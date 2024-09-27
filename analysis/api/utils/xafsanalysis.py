#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
#          Last Update: Q3 2024
# ________________________________________________________________________________________________
# Authors: Miyasaka Naotoshi [2024-] 
#          Mikael Nicander Kuwahara (Lead Developer) [2021-]
# ________________________________________________________________________________________________
# Description: Serverside (Django) rest api utils for the 'Analysis' page involving
#              'classification' components
# ------------------------------------------------------------------------------------------------
# Notes:  This is one of the REST API parts of the 'analysis' interface of the website that
#         allows serverside work for the 'classification' component.
# ------------------------------------------------------------------------------------------------
# References: logging, numpy, pandas and sklearn libs
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
import logging
import numpy as np
import pandas as pd
from io import StringIO

from statistics import stdev, variance, median
from scipy.signal import find_peaks
import os
import re
import math
import csv
from sklearn.ensemble import RandomForestClassifier
from sklearn.ensemble import VotingClassifier
from sklearn.neural_network import MLPClassifier
import tempfile

logger = logging.getLogger(__name__)

#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
def get_xafs_analysis(data):

    if data['data']['version'] == 1:

        abs1 = data['view']['settings']['abs']
        energy1 = data['view']['settings']['energy']
        element_name = data['view']['settings']['element']
        dataset = data['data']
        dataset['Raw_Energy'] = data['data'][data['data']['RawData_Xname']]
        dataset['Raw_Abs'] = data['data'][data['data']['RawData_Yname']]
        dataset['Element'] = element_name

        #############################################

        dataset['XANES_Data'] = data['view']['settings']['XANES_Data']
        dataset['EXAFS_Data'] = data['view']['settings']['EXAFS_Data']

        #Remove None values for XANES_xpoint and XANES_ypoint
        XANES_xpoint = [x for x in dataset['XANES_Data']['XANES_x'] if x is not None]
        XANES_ypoint = [y for y in dataset['XANES_Data']['XANES_y'] if y is not None]

        EXAFS_xpoint = [x for x in dataset['EXAFS_Data']['EXAFS_x'] if x is not None]
        EXAFS_ypoint = [y for y in dataset['EXAFS_Data']['EXAFS_y'] if y is not None]

        dataset['XANES_Data']['XANES_x'] = XANES_xpoint
        dataset['XANES_Data']['XANES_y'] = XANES_ypoint
        dataset['EXAFS_Data']['EXAFS_x'] = EXAFS_xpoint
        dataset['EXAFS_Data']['EXAFS_y'] = EXAFS_ypoint

        ########XANES###################################################

        df = pd.DataFrame({'energy': XANES_xpoint, 'mu': XANES_ypoint})

        #XA_Min_En
        df["mu_3"]=df["mu"].rolling(3).mean().round(1)
        threshold = 0.1
        min_energy_point = pd.DataFrame(columns=df.columns)
        if "route" in data['view']['settings']:
            min_data_option = data['view']['settings']['Min_Data_Option']
        else:
            min_data_option = 20
        for index, row in df.iterrows():
            if index >= min_data_option and row['mu_3'] >= threshold:
                min_energy_point = df[index:].nsmallest(1, 'energy')
                dataset['XANES_statistics_Minx'] = min_energy_point['energy'].iloc[0]
                dataset['XANES_statistics_Miny'] = min_energy_point['mu'].iloc[0]
                break

        ########Code like Larch########################################

        import numpy as np
        import lmfit
        from lmfit.lineshapes import (gaussian, lorentzian, voigt, pvoigt, moffat,
                                    pearson7, breit_wigner, damped_oscillator,
                                    dho, logistic, lognormal, students_t,
                                    doniach, skewed_gaussian, expgaussian,
                                    skewed_voigt, step, rectangle, exponential,
                                    powerlaw, linear, parabolic)
        from scipy.interpolate import interp1d as scipy_interp1d

        def interp1d(x, y, xnew, kind='linear', fill_value=np.nan, **kws):
            kwargs  = {'kind': kind.lower(), 'fill_value': fill_value,
                    'copy': False, 'bounds_error': False}
            kwargs.update(kws)
            return  scipy_interp1d(x, y, **kwargs)(xnew)

        def interp(x, y, xnew, kind='linear', fill_value=np.nan, **kws):
            out = interp1d(x, y, xnew, kind=kind, fill_value=fill_value, **kws)
            below = np.where(xnew<x[0])[0]
            above = np.where(xnew>x[-1])[0]
            if len(above) == 0 and len(below) == 0:
                return out
            if (len(np.where(np.diff(np.argsort(x))!=1)[0]) > 0 or
                len(np.where(np.diff(np.argsort(xnew))!=1)[0]) > 0):
                return out
            for span, isbelow in ((below, True), (above, False)):
                if len(span) < 1:
                    continue
                ncoef = 5
                if kind.startswith('lin'):
                    ncoef = 2
                elif kind.startswith('quad'):
                    ncoef = 3
                sel = slice(None, ncoef) if isbelow  else slice(-ncoef, None)
                if kind.startswith('lin'):
                    coefs = polyfit(x[sel], y[sel], 1)
                    out[span] = coefs[0]
                    if len(coefs) > 1:
                        out[span] += coefs[1]*xnew[span]
                elif kind.startswith('quad'):
                    coefs = polyfit(x[sel], y[sel], 2)
                    out[span] = coefs[0]
                    if len(coefs) > 1:
                        out[span] += coefs[1]*xnew[span]
                    if len(coefs) > 2:
                        out[span] += coefs[2]*xnew[span]**2
                elif kind.startswith('cubic'):
                    out[span] = IUSpline(x[sel], y[sel])(xnew[span])
            return out

        def smooth(x, y, sigma=1, gamma=None, xstep=None, npad=None, form='lorentzian'):
            # make uniform x, y data
            TINY = 1.e-12
            if xstep is None:
                xstep = min(np.diff(x))
            if xstep < TINY:
                raise Warning('Cannot smooth data: must be strictly increasing ')
            if npad is None:
                npad = 5
            xmin = xstep * int( (min(x) - npad*xstep)/xstep)
            xmax = xstep * int( (max(x) + npad*xstep)/xstep)
            npts1 = 1 + int(abs(xmax-xmin+xstep*0.1)/xstep)
            npts = min(npts1, 50*len(x))
            x0  = np.linspace(xmin, xmax, npts)
            y0  = np.interp(x0, x, y)
            # put sigma in units of 1 for convolving window function
            sigma *= 1.0 / xstep
            if gamma is not None:
                gamma *= 1.0 / xstep
            wx = np.arange(2*npts)
            if form.lower().startswith('gauss'):
                win = gaussian(wx, center=npts, sigma=sigma)
            elif form.lower().startswith('voig'):
                win = voigt(wx, center=npts, sigma=sigma, gamma=gamma)
            else:
                win = lorentzian(wx, center=npts, sigma=sigma)
            y1 = np.concatenate((y0[npts:0:-1], y0, y0[-1:-npts-1:-1]))
            y2 = np.convolve(win/win.sum(), y1, mode='valid')
            if len(y2) > len(x0):
                nex = int((len(y2) - len(x0))/2)
                y2 = (y2[nex:])[:len(x0)]
            return interp(x0, y2, x)

        def remove_dups(arr, tiny=1.e-6):
            try:
                work = np.asarray(arr)
            except Exception:
                print('remove_dups: argument is not an array')
                return arr
            if work.size <= 1:
                return arr
            shape = work.shape
            work = work.flatten()
            min_step = min(np.diff(work))
            tval = (abs(min(work)) + abs(max(work))) /2.0
            if min_step > 10*tiny:
                return work
            previous_val = np.nan
            previous_add = 0
            npts = len(work)
            add = np.zeros(npts)
            for i in range(1, npts):
                if not np.isnan(work[i-1]):
                    previous_val = work[i-1]
                    previous_add = add[i-1]
                val = work[i]
                if np.isnan(val) or np.isnan(previous_val):
                    continue
                diff = abs(val - previous_val)
                if diff < tiny:
                    add[i] = previous_add + tiny
            return work+add

        def find_energy_step(energy, frac_ignore=0.01, nave=10):
            nskip = int(frac_ignore*len(energy))
            e_ordered = np.where(np.diff(np.argsort(energy))==1)[0]  # where energy step are in order
            ediff = np.diff(energy[e_ordered][nskip:-nskip])
            return ediff[np.argsort(ediff)][nskip:nskip+nave].mean()

        def _finde0(energy, mu_input, estep=None, use_smooth=True):
            en = remove_dups(energy, tiny=0.00050)
            ordered = np.where(np.diff(np.argsort(en))==1)[0]
            mu_input = np.array(mu_input)
            en = en[ordered]
            mu = mu_input[ordered]
            if len(en.shape) > 1:
                en = en.squeeze()
            if len(mu.shape) > 1:
                mu = mu.squeeze()
            if estep is None:
                estep = find_energy_step(en)
            nmin = max(3, int(len(en)*0.02))
            if use_smooth:
                dmu = smooth(en, np.gradient(mu)/np.gradient(en), xstep=estep, sigma=estep)
            else:
                dmu = np.gradient(mu)/np.gradient(en)
            dmu[np.where(~np.isfinite(dmu))] = -1.0
            dm_min = dmu[nmin:-nmin].min()
            dm_ptp = max(1.e-10, dmu[nmin:-nmin].ptp())
            dmu = (dmu - dm_min)/dm_ptp
            dhigh = 0.60 if len(en) > 20 else 0.30
            high_deriv_pts = np.where(dmu > dhigh)[0]
            if len(high_deriv_pts) < 3:
                for _ in range(2):
                    if len(high_deriv_pts) > 3:
                        break
                    dhigh *= 0.5
                    high_deriv_pts = np.where(dmu > dhigh)[0]
            if len(high_deriv_pts) < 3:
                high_deriv_pts = np.where(np.isfinite(dmu))[0]
            imax, dmax = 0, 0
            for i in high_deriv_pts:
                if i < nmin or i > len(en) - nmin:
                    continue
                if (dmu[i] > dmax and
                    (i+1 in high_deriv_pts) and
                    (i-1 in high_deriv_pts)):
                    imax, dmax = i, dmu[i]
            return en[imax], imax, estep

        def find_e0(energy, mu=None):
            e1, ie0, estep1 = _finde0(energy, mu, estep=None, use_smooth=False)
            istart = max(3, ie0-75)
            istop  = min(ie0+75, len(energy)-3)
            if ie0 < 0.05*len(energy):
                e1 = energy.mean()
                istart = max(3, ie0-20)
                istop = len(energy)-3
            estep = 0.5*(max(0.01, min(1.0, estep1)) + max(0.01, min(1.0, e1/25000.)))
            e0, ix, ex = _finde0(energy[istart:istop], mu[istart:istop], estep=estep, use_smooth=True)
            if ix < 1 :
                e0 = energy[istart+2]
            return e0

        max_points = df[(df['mu'].shift(1) < df['mu']) & (df['mu'].shift(-1) < df['mu'])]
        max_energy_points = max_points[(max_points['mu'].shift(1) < max_points['mu']) & (max_points['mu'].shift(-1) < max_points['mu'])]

        e0 = find_e0(XANES_xpoint, XANES_ypoint)

        # Get the smallest index among values greater than e0 in XANES_xpoint
        indices_greater_than_e0 = np.where(XANES_xpoint > e0)[0]
        closest_index = indices_greater_than_e0[0] if len(indices_greater_than_e0) > 0 else None

        if closest_index is not None:
            max_energy_point = max_energy_points[max_energy_points['mu'] >= XANES_ypoint[closest_index]].nsmallest(1, 'energy')
        #else:
        #    max_energy_point = max_points.nlargest(1, 'mu')

        if max_energy_point.empty:
            max_energy_point = max_points[max_points['energy'] > e0].nsmallest(1, 'energy')

        # Get the index of the XANES_xpoint that is exactly equal to e0
        indices = np.where(np.abs(XANES_xpoint - e0) < 1e-10)[0]

        # If indices is not empty, get the next element
        if indices:
            next_idx = indices[0] + 0

        dataset['XANES_statistics_Maxx'] = max_energy_point['energy'].iloc[0]
        dataset['XANES_statistics_Maxy'] = max_energy_point['mu'].iloc[0]
        dataset['XANES_statistics_E0x'] = XANES_xpoint[next_idx]
        dataset['XANES_statistics_E0y'] = XANES_ypoint[next_idx]

        # Check the condition and update if necessary
        if dataset['XANES_statistics_E0x'] <= dataset['XANES_statistics_Minx']:
            dataset['XANES_statistics_Minx'] = XANES_xpoint[next_idx - 1]
            dataset['XANES_statistics_Miny'] = XANES_ypoint[next_idx - 1]

        peak_width = dataset['XANES_statistics_Maxx'] - dataset['XANES_statistics_Minx']

        ###########EXAFS##############################################

        EXAFS_xpoint = np.array(EXAFS_xpoint)
        EXAFS_ypoint = np.array(EXAFS_ypoint)

        condition = (1 <= EXAFS_xpoint) & (EXAFS_xpoint <= 6)
        x_range = EXAFS_xpoint[condition]
        y_range = EXAFS_ypoint[condition]
        peaks, _ = find_peaks(y_range)
        peak_xpositions = [x_range[i] for i in peaks]
        peak_ypositions = [y_range[i] for i in peaks]
        max_peak_index = np.argmax(peak_ypositions)
        max_peak_xposition = peak_xpositions[max_peak_index]

        dataset['EXAFS_statistics_x'] = max_peak_xposition
        dataset['EXAFS_statistics_y'] = max(peak_ypositions)

        ###########periodic table#####################
        pt_strIO = StringIO(periodictablestring)
        testpt = pd.read_csv(pt_strIO)

        element = testpt[testpt['Element'] == element_name]

        ##################################################

        columns_to_extract = ['Peak_E0_μt', 'Peak_Max_μt', 'Max_y_xposition', 'Max_y', 'vdw_radius_alvarez', 'Peak_Width', 'gs_energy', 'fusion_enthalpy', 'num_unfilled']
        data_information=[XANES_ypoint[next_idx], max_energy_point['mu'].iloc[0], max_peak_xposition, max(peak_ypositions), element['vdw_radius_alvarez'].values[0],
                        peak_width, element['gs_energy'].values[0], element['fusion_enthalpy'].values[0], element['num_unfilled'].values[0]]

        data_information_df = pd.DataFrame([data_information], columns=columns_to_extract)

        ##############################################################################
        #Oxide & Valence Group (0, 1-3, 4-6) Classification
        ##############################################################################
        Oxide008 = StringIO(Train_Oxide_008)
        df008 = pd.read_csv(Oxide008)
        #########Oxide#################
        target_A_8 = df008.iloc[:, 1]
        targets_A_8 = np.array(target_A_8)
        data1_8 = df008.iloc[:, 3:8]
        datas1_8 = np.array(data1_8)
        model_8 = RandomForestClassifier(random_state=0, n_estimators=80)
        model_8.fit(datas1_8, targets_A_8)
        pred_8 = data_information_df
        pred1_8 = pred_8.iloc[:, :5]
        pred_data_8 = np.array(pred1_8)
        predictionlist_8 = []
        result_8 = model_8.predict(pred_data_8)
        predictionlist_8.extend(result_8)
        df_result_8 = pd.DataFrame(predictionlist_8, columns=['Predict_Oxide'])
        results_8 = pd.concat([pred_8, df_result_8], axis=1)
        results_8['Oxide'] = result_8
        results_8 = pd.concat([results_8.iloc[:, -1], results_8.iloc[:, :-1]], axis=1)
        ###########Valence##########################
        target_B_8 = df008.iloc[:, 2]
        targets_B_8 = np.array(target_B_8)
        data2_A_8 = df008.iloc[:, 1]
        data2_B_8 = df008.iloc[:, 3:7]
        data2_C_8 = df008.iloc[:, 8:]
        data2_8 = pd.concat([data2_A_8, data2_B_8, data2_C_8], axis=1)
        datas2_8 = np.array(data2_8)
        model_8V = RandomForestClassifier(random_state=0, n_estimators=80)
        model_8V.fit(datas2_8, targets_B_8)
        pred3_8 = results_8.iloc[:, :5]
        pred4_8 = results_8.iloc[:, 6:-1]
        pred5_8 = pd.concat([pred3_8, pred4_8], axis=1)
        pred_data2_8 = np.array(pred5_8)
        predictionlist_A_8 = []
        result2_8 = model_8V.predict(pred_data2_8)
        predictionlist_A_8.extend(result2_8)
        df_result2_8 = pd.DataFrame(predictionlist_A_8, columns=['Predict_Valence(0, 1-3, 4-6)'])
        #############################################################
        #To make the display more user-friendly, the following code should also be executed
        replace_dict = {3: '1 - 3', 4: '4 - 6'}
        df_result2_8['Predict_Valence(0, 1-3, 4-6)'] = df_result2_8['Predict_Valence(0, 1-3, 4-6)'].replace(replace_dict)
        #############################################################
        results_8 = pd.concat([pred_8, df_result_8, df_result2_8], axis=1)

        #results_8.to_csv('PredictData_for_Oxide&Valence_008.csv', index=False)
        result_df008 = results_8.iloc[:, -2:]

        dataset['Predict_Oxide'] = result_df008['Predict_Oxide'].values[0]
        dataset['Predict_Valence_Group'] = result_df008['Predict_Valence(0, 1-3, 4-6)'].values[0]

        ##############################################################################
        #Oxide & Valence Each (0, 1, 2, 3, 4, 5, 6) Classification
        ##############################################################################
        Oxide006 = StringIO(Train_006)
        df006 = pd.read_csv(Oxide006)
        #########Oxide#################
        target_A_6 = df006.iloc[:, 1]
        targets_A_6 = np.array(target_A_6)
        data1_6 = df006.iloc[:, 3:8]
        datas1_6 = np.array(data1_6)
        model_6 = RandomForestClassifier(random_state=0, n_estimators=80)
        model_6.fit(datas1_6, targets_A_6)
        pred_6 = data_information_df
        pred1_6 = pred_6.iloc[:, :5]
        pred_data_6 = np.array(pred1_6)
        predictionlist_6 = []
        result_6 = model_6.predict(pred_data_6)
        predictionlist_6.extend(result_6)
        df_result_6 = pd.DataFrame(predictionlist_6, columns=['Predict_Oxide'])
        results_6 = pd.concat([pred_6, df_result_6], axis=1)
        results_6['Oxide'] = result_6
        results_6 = pd.concat([results_6.iloc[:, -1], results_6.iloc[:, :-1]], axis=1)
        ###########Valence##########################
        target_B_6 = df006.iloc[:, 2]
        targets_B_6 = np.array(target_B_6)
        data2_A_6 = df006.iloc[:, 1]
        data2_B_6 = df006.iloc[:, 3:7]
        data2_C_6 = df006.iloc[:, 8:]
        data2_6 = pd.concat([data2_A_6, data2_B_6, data2_C_6], axis=1)
        datas2_6 = np.array(data2_6)
        model1_6V = RandomForestClassifier(random_state=0, n_estimators=80)
        model2_6V = MLPClassifier(random_state=0, solver='lbfgs', alpha=0.4, activation='tanh', max_iter=800)
        model_6V  = VotingClassifier(estimators=[('rf', model1_6V), ('mlp', model2_6V)], voting='soft', weights=[0.85, 0.15])
        model_6V.fit(datas2_6, targets_B_6)
        pred3_6 = results_6.iloc[:, :5]
        pred4_6 = results_6.iloc[:, 6:-1]
        pred5_6 = pd.concat([pred3_6, pred4_6], axis=1)
        pred_data2_6 = np.array(pred5_6)
        predictionlist_A_6 = []
        result2_6 = model_6V.predict(pred_data2_6)
        predictionlist_A_6.extend(result2_6)
        df_result2_6 = pd.DataFrame(predictionlist_A_6, columns=['Predict_Valence(0, 1, 2, 3, 4, 5, 6)'])
        results_6 = pd.concat([pred_6, df_result_6, df_result2_6], axis=1)
        #results_6.to_csv('PredictData_for_Oxide&Valence_006.csv', index=False)

        result_df006 = pd.concat([results_6.iloc[:, 0], results_6.iloc[:, -2:]], axis=1)

        dataset['Predict_Valence_Each'] = result_df006['Predict_Valence(0, 1, 2, 3, 4, 5, 6)'].values[0]

        #df_all = pd.concat([df008, df006.iloc[:, -1]], axis=1)
        #df_all2 = pd.merge(result_df1, df_all, on=["Data_Number"], how="inner")
        #display(df_all2)
        #df_all2.to_csv('PredictData_for_Oxide&Valence_all.csv', index=False)
            
        return dataset



    
    if data['data']['version'] == 2:

        abs1 = data['view']['settings']['abs']
        energy1 = data['view']['settings']['energy']
        element_name = data['view']['settings']['element']
        dataset = data['data']
        dataset['Raw_Energy'] = data['data'][data['data']['RawData_Xname']]
        dataset['Raw_Abs'] = data['data'][data['data']['RawData_Yname']]
        dataset['Element'] = element_name
        dataset['XANES_Data'] = {}
        dataset['EXAFS_Data'] = {} 

        #############################################
        import numpy as np
        import lmfit
        from lmfit.lineshapes import (gaussian, lorentzian, voigt, pvoigt, moffat,
                                    pearson7, breit_wigner, damped_oscillator,
                                    dho, logistic, lognormal, students_t,
                                    doniach, skewed_gaussian, expgaussian,
                                    skewed_voigt, step, rectangle, exponential,
                                    powerlaw, linear, parabolic)
        from scipy.interpolate import interp1d as scipy_interp1d


        def interp1d(x, y, xnew, kind='linear', fill_value=np.nan, **kws):

            kwargs  = {'kind': kind.lower(), 'fill_value': fill_value,
                    'copy': False, 'bounds_error': False}
            kwargs.update(kws)
            return  scipy_interp1d(x, y, **kwargs)(xnew)

        def interp(x, y, xnew, kind='linear', fill_value=np.nan, **kws):
            
            out = interp1d(x, y, xnew, kind=kind, fill_value=fill_value, **kws)

            below = np.where(xnew<x[0])[0]
            above = np.where(xnew>x[-1])[0]
            if len(above) == 0 and len(below) == 0:
                return out

            if (len(np.where(np.diff(np.argsort(x))!=1)[0]) > 0 or
                len(np.where(np.diff(np.argsort(xnew))!=1)[0]) > 0):
                return out

            for span, isbelow in ((below, True), (above, False)):
                if len(span) < 1:
                    continue
                ncoef = 5
                if kind.startswith('lin'):
                    ncoef = 2
                elif kind.startswith('quad'):
                    ncoef = 3
                sel = slice(None, ncoef) if isbelow  else slice(-ncoef, None)
                if kind.startswith('lin'):
                    coefs = polyfit(x[sel], y[sel], 1)
                    out[span] = coefs[0]
                    if len(coefs) > 1:
                        out[span] += coefs[1]*xnew[span]
                elif kind.startswith('quad'):
                    coefs = polyfit(x[sel], y[sel], 2)
                    out[span] = coefs[0]
                    if len(coefs) > 1:
                        out[span] += coefs[1]*xnew[span]
                    if len(coefs) > 2:
                        out[span] += coefs[2]*xnew[span]**2
                elif kind.startswith('cubic'):
                    out[span] = IUSpline(x[sel], y[sel])(xnew[span])
            return out

        def smooth(x, y, sigma=1, gamma=None, xstep=None, npad=None, form='lorentzian'):

            # make uniform x, y data
            TINY = 1.e-12
            if xstep is None:
                xstep = min(np.diff(x))
            if xstep < TINY:
                raise Warning('Cannot smooth data: must be strictly increasing ')
            if npad is None:
                npad = 5
            xmin = xstep * int( (min(x) - npad*xstep)/xstep)
            xmax = xstep * int( (max(x) + npad*xstep)/xstep)
            npts1 = 1 + int(abs(xmax-xmin+xstep*0.1)/xstep)
            npts = min(npts1, 50*len(x))
            x0  = np.linspace(xmin, xmax, npts)
            y0  = np.interp(x0, x, y)

            # put sigma in units of 1 for convolving window function
            sigma *= 1.0 / xstep
            if gamma is not None:
                gamma *= 1.0 / xstep

            wx = np.arange(2*npts)
            if form.lower().startswith('gauss'):
                win = gaussian(wx, center=npts, sigma=sigma)
            elif form.lower().startswith('voig'):
                win = voigt(wx, center=npts, sigma=sigma, gamma=gamma)
            else:
                win = lorentzian(wx, center=npts, sigma=sigma)

            y1 = np.concatenate((y0[npts:0:-1], y0, y0[-1:-npts-1:-1]))
            y2 = np.convolve(win/win.sum(), y1, mode='valid')
            if len(y2) > len(x0):
                nex = int((len(y2) - len(x0))/2)
                y2 = (y2[nex:])[:len(x0)]
            return interp(x0, y2, x)

        def remove_dups(arr, tiny=1.e-6):

            try:
                work = np.asarray(arr)
            except Exception:
                print('remove_dups: argument is not an array')
                return arr 

            if work.size <= 1:
                return arr
            shape = work.shape
            work = work.flatten()

            min_step = min(np.diff(work))
            tval = (abs(min(work)) + abs(max(work))) /2.0
            if min_step > 10*tiny:
                return work
            previous_val = np.nan
            previous_add = 0

            npts = len(work)
            add = np.zeros(npts)
            for i in range(1, npts):
                if not np.isnan(work[i-1]):
                    previous_val = work[i-1]
                    previous_add = add[i-1]
                val = work[i]
                if np.isnan(val) or np.isnan(previous_val):
                    continue
                diff = abs(val - previous_val)
                if diff < tiny:
                    add[i] = previous_add + tiny
            return work+add 

        def find_energy_step(energy, frac_ignore=0.01, nave=10):

            nskip = int(frac_ignore*len(energy))
            e_ordered = np.where(np.diff(np.argsort(energy))==1)[0]  # where energy step are in order
            ediff = np.diff(energy[e_ordered][nskip:-nskip])
            return ediff[np.argsort(ediff)][nskip:nskip+nave].mean()

        def _finde0(energy, mu_input, estep=None, use_smooth=True):

            en = remove_dups(energy, tiny=0.00050)
            ordered = np.where(np.diff(np.argsort(en))==1)[0]
            mu_input = np.array(mu_input)
            en = en[ordered]
            mu = mu_input[ordered]
            if len(en.shape) > 1:
                en = en.squeeze()
            if len(mu.shape) > 1:
                mu = mu.squeeze()
            if estep is None:
                estep = find_energy_step(en)

            nmin = max(3, int(len(en)*0.02))
            if use_smooth:
                dmu = smooth(en, np.gradient(mu)/np.gradient(en), xstep=estep, sigma=estep)
            else:
                dmu = np.gradient(mu)/np.gradient(en)

            dmu[np.where(~np.isfinite(dmu))] = -1.0
            dm_min = dmu[nmin:-nmin].min()
            dm_ptp = max(1.e-10, np.ptp(dmu[nmin:-nmin]))
            dmu = (dmu - dm_min)/dm_ptp

            dhigh = 0.60 if len(en) > 20 else 0.30
            high_deriv_pts = np.where(dmu > dhigh)[0]
            if len(high_deriv_pts) < 3:
                for _ in range(2):
                    if len(high_deriv_pts) > 3:
                        break
                    dhigh *= 0.5
                    high_deriv_pts = np.where(dmu > dhigh)[0]

            if len(high_deriv_pts) < 3:
                high_deriv_pts = np.where(np.isfinite(dmu))[0]

            imax, dmax = 0, 0
            for i in high_deriv_pts:
                if i < nmin or i > len(en) - nmin:
                    continue
                if (dmu[i] > dmax and
                    (i+1 in high_deriv_pts) and
                    (i-1 in high_deriv_pts)):
                    imax, dmax = i, dmu[i]
            return en[imax], imax, estep    

        def find_e0(energy, mu=None):

            e1, ie0, estep1 = _finde0(energy, mu, estep=None, use_smooth=False)
            istart = max(3, ie0-75)
            istop  = min(ie0+75, len(energy)-3)

            if ie0 < 0.05*len(energy):
                e1 = energy.mean()
                istart = max(3, ie0-20)
                istop = len(energy)-3

            estep = 0.5*(max(0.01, min(1.0, estep1)) + max(0.01, min(1.0, e1/25000.)))
            e0, ix, ex = _finde0(energy[istart:istop], mu[istart:istop], estep=estep, use_smooth=True)
            if ix < 1 :
                e0 = energy[istart+2]
            
            return e0

        #########################
        MAX_NNORM = 5
        TINY_ENERGY = 0.0005

        def remove_nans2(a, b):
            
            if not isinstance(a, np.ndarray):
                try:
                    a = np.array(a)
                except:
                    print( 'remove_nans2: argument 1 is not an array')
            if not isinstance(b, np.ndarray):
                try:
                    b = np.array(b)
                except:
                    print( 'remove_nans2: argument 2 is not an array')

            def fix_bad(isbad, x, y):
                if np.any(isbad):
                    bad = np.where(isbad)[0]
                    x, y = np.delete(x, bad), np.delete(y, bad)
                return x, y

            a, b = fix_bad(~np.isfinite(a), a, b)
            a, b = fix_bad(~np.isfinite(b), a, b)
            return a, b


        def index_nearest(array, value):
            
            return np.abs(array-value).argmin()

        def index_of(array, value):
            
            if value < min(array):
                return 0
            return max(np.where(array<=value)[0])

        def remove_nans(val, goodval=0.0, default=0.0, interp=False):

            isbad = ~np.isfinite(val)
            if not np.any(isbad):
                return val

            if isinstance(goodval, np.ndarray):
                goodval = goodval.mean()
            if np.any(~np.isfinite(goodval)):
                goodval = default

            if not isinstance(val, np.ndarray):
                return goodval
            if interp:
                for i in np.where(isbad)[0]:
                    if i == 0:
                        val[i] = 2.0*val[1] - val[2]
                    elif i == len(val)-1:
                        val[i] = 2.0*val[i-1] - val[i-2]
                    else:
                        val[i] = 0.5*(val[i+1] + val[i-1])
                isbad = ~np.isfinite(val)
            val[np.where(isbad)] = goodval
            return val

        def remove_nans2(a, b):

            if not isinstance(a, np.ndarray):
                try:
                    a = np.array(a)
                except:
                    print( 'remove_nans2: argument 1 is not an array')
            if not isinstance(b, np.ndarray):
                try:
                    b = np.array(b)
                except:
                    print( 'remove_nans2: argument 2 is not an array')

            def fix_bad(isbad, x, y):
                if np.any(isbad):
                    bad = np.where(isbad)[0]
                    x, y = np.delete(x, bad), np.delete(y, bad)
                return x, y

            a, b = fix_bad(~np.isfinite(a), a, b)
            a, b = fix_bad(~np.isfinite(b), a, b)
            return a, b

        def polyfit(x, y, deg=1, reverse=False):

            pfit = np.polynomial.Polynomial.fit(x, y, deg=int(deg))
            coefs = pfit.convert().coef
            if reverse:
                coefs = list(reversed(coefs))
            return coefs



        def preedge(energy, mu, e0=None, step=None, nnorm=None, nvict=0, pre1=None,
                    pre2=None, norm1=None, norm2=None):

            energy, mu = remove_nans2(energy, mu)
            energy = remove_dups(energy, tiny=TINY_ENERGY)
            if energy.size <= 1:
                raise ValueError("energy array must have at least 2 points")
            if e0 is None or e0 < energy[1] or e0 > energy[-2]:
                e0 = find_e0(energy, mu)
            ie0 = index_nearest(energy, e0)
            e0 = energy[ie0]

            if pre1 is None:
                # skip first energy point, often bad
                if ie0 > 20:
                    pre1  = 5.0*round((energy[1] - e0)/5.0)
                else:
                    pre1  = 2.0*round((energy[1] - e0)/2.0)
            pre1 = max(pre1,  (min(energy) - e0))
            if pre2 is None:
                pre2 = 0.5*pre1
            if pre1 > pre2:
                pre1, pre2 = pre2, pre1
            ipre1 = index_of(energy-e0, pre1)
            ipre2 = index_of(energy-e0, pre2)
            if ipre2 < ipre1 + 2 + nvict:
                pre2 = (energy-e0)[int(ipre1 + 2 + nvict)]

            if norm2 is None:
                norm2 = 5.0*round((max(energy) - e0)/5.0)
            if norm2 < 0:
                norm2 = max(energy) - e0 - norm2
            norm2 = min(norm2, (max(energy) - e0))
            if norm1 is None:
                norm1 = min(25, 5.0*round(norm2/15.0))

            if norm1 > norm2:
                norm1, norm2 = norm2, norm1

            norm1 = min(norm1, norm2 - 10)
            if nnorm is None:
                nnorm = 2
                if norm2-norm1 < 300: nnorm = 1
                if norm2-norm1 <  30: nnorm = 0
            nnorm = max(min(nnorm, MAX_NNORM), 0)
            # preedge
            p1 = index_of(energy, pre1+e0)
            p2 = index_nearest(energy, pre2+e0)
            if p2-p1 < 2:
                p2 = min(len(energy), p1 + 2)

            omu  = mu*energy**nvict
            ex = remove_nans(energy[p1:p2], interp=True)
            mx = remove_nans(omu[p1:p2], interp=True)

            precoefs = polyfit(ex, mx, 1)
            pre_edge = (precoefs[0] + energy*precoefs[1]) * energy**(-nvict)
            # normalization
            p1 = index_of(energy, norm1+e0)
            p2 = index_nearest(energy, norm2+e0)
            if p2-p1 < 2:
                p2 = min(len(energy), p1 + 2)
            if p2-p1 < 2:
                p1 = p1-2

            presub = (mu-pre_edge)[p1:p2]
            coefs = polyfit(energy[p1:p2], presub, nnorm)
            post_edge = 1.0*pre_edge
            norm_coefs = []
            for n, c in enumerate(coefs):
                post_edge += c * energy**(n)
                norm_coefs.append(c)
            edge_step = step
            if edge_step is None:
                edge_step = post_edge[ie0] - pre_edge[ie0]
            edge_step = max(1.e-12, abs(float(edge_step)))
            norm = (mu - pre_edge)/edge_step
            return {'e0': e0, 'edge_step': edge_step, 'norm': norm,
                    'pre_edge': pre_edge, 'post_edge': post_edge,
                    'norm_coefs': norm_coefs, 'nvict': nvict,
                    'nnorm': nnorm, 'norm1': norm1, 'norm2': norm2,
                    'pre1': pre1, 'pre2': pre2, 'precoefs': precoefs}

        def pre_edge(energy, mu=None, group=None, e0=None, step=None, nnorm=None,
                    nvict=0, pre1=None, pre2=None, norm1=None, norm2=None,
                    make_flat=True, _larch=None):
            
            # Convert energy and mu to numpy arrays if they are not already
            energy = np.array(energy)
            mu = np.array(mu)
            
            if len(energy.shape) > 1:
                energy = energy.squeeze()
            if len(mu.shape) > 1:
                mu = mu.squeeze()

            out_of_order = np.where(np.diff(np.argsort(energy))!=1)[0]
            if len(out_of_order) > 0:
                order = np.argsort(energy)
                energy = energy[order]
                mu = mu[order]
            energy = remove_dups(energy, tiny=TINY_ENERGY)

            pre_dat = preedge(energy, mu, e0=e0, step=step, nnorm=nnorm,
                            nvict=nvict, pre1=pre1, pre2=pre2, norm1=norm1,
                            norm2=norm2)

            e0    = pre_dat['e0']
            norm  = pre_dat['norm']
            norm1 = pre_dat['norm1']
            norm2 = pre_dat['norm2']
            # generate flattened spectra, by fitting a quadratic to .norm
            # and removing that.

            ie0 = index_nearest(energy, e0)
            p1 = index_of(energy, norm1+e0)
            p2 = index_nearest(energy, norm2+e0)
            if p2-p1 < 2:
                p2 = min(len(energy), p1 + 2)

            if make_flat:
                pre_edge = pre_dat['pre_edge']
                post_edge = pre_dat['post_edge']
                edge_step = pre_dat['edge_step']
                flat_residue = (post_edge - pre_edge)/edge_step
                flat = norm - flat_residue + flat_residue[ie0]
                flat[:ie0] = norm[:ie0]

                enx = remove_nans(energy[p1:p2], interp=True)
                mux = remove_nans(norm[p1:p2], interp=True)

            return flat, edge_step
###############################################################
        mu_new = pre_edge(dataset['Raw_Energy'], dataset['Raw_Abs'])[0]
        edge_step_new = pre_edge(dataset['Raw_Energy'], dataset['Raw_Abs'])[1]
        e0_new = find_e0(dataset['Raw_Energy'], dataset['Raw_Abs'])
###############################################################
        import sys

        import scipy.constants as consts
        from numpy import arange, interp, pi, zeros, sqrt
        from scipy.interpolate import splrep, splev, UnivariateSpline
        from scipy.optimize import leastsq

        KTOE = 1.e20*consts.hbar**2 / (2*consts.m_e * consts.e) # 3.8099819442818976
        ETOK = 1.0/KTOE
        sqrtpi = sqrt(pi)

        FT_WINDOWS = ('Kaiser-Bessel', 'Hanning', 'Parzen', 'Welch', 'Gaussian', 'Sine')
        FT_WINDOWS_SHORT = tuple([a[:3].lower() for a in FT_WINDOWS])

        def ftwindow(x, xmin=None, xmax=None, dx=1, dx2=None,
                    window='hanning', _larch=None, **kws):
            
            if window is None:
                window = FT_WINDOWS_SHORT[0]
            nam = window.strip().lower()[:3]
            if nam not in FT_WINDOWS_SHORT:
                raise RuntimeError("invalid window name %s" % window)

            dx1 = dx
            if dx2 is None:  dx2 = dx1
            if xmin is None: xmin = min(x)
            if xmax is None: xmax = max(x)

            xstep = (x[-1] - x[0]) / (len(x)-1)
            xeps  = 1.e-4 * xstep
            x1 = max(min(x), xmin - dx1/2.0)
            x2 = xmin + dx1/2.0  + xeps
            x3 = xmax - dx2/2.0  - xeps
            x4 = min(max(x), xmax + dx2/2.0)

            if nam == 'fha':
                if dx1 < 0: dx1 = 0
                if dx2 > 1: dx2 = 1
                x2 = x1 + xeps + dx1*(xmax-xmin)/2.0
                x3 = x4 - xeps - dx2*(xmax-xmin)/2.0
            elif nam == 'gau':
                dx1 = max(dx1, xeps)

            def asint(val): return int((val+xeps)/xstep)
            i1, i2, i3, i4 = asint(x1), asint(x2), asint(x3), asint(x4)
            i1, i2 = max(0, i1), max(0, i2)
            i3, i4 = min(len(x)-1, i3), min(len(x)-1, i4)
            if i2 == i1: i1 = max(0, i2-1)
            if i4 == i3: i3 = max(i2, i4-1)
            x1, x2, x3, x4 = x[i1], x[i2], x[i3], x[i4]
            if x1 == x2: x2 = x2+xeps
            if x3 == x4: x4 = x4+xeps
            # initial window
            fwin =  zeros(len(x))
            if i3 > i2:
                fwin[i2:i3] = np.ones(i3-i2)

            # now finish making window
            if nam in ('han', 'fha'):
                fwin[i1:i2+1] = np.sin((pi/2)*(x[i1:i2+1]-x1) / (x2-x1))**2
                fwin[i3:i4+1] = np.cos((pi/2)*(x[i3:i4+1]-x3) / (x4-x3))**2
            elif nam == 'par':
                fwin[i1:i2+1] =     (x[i1:i2+1]-x1) / (x2-x1)
                fwin[i3:i4+1] = 1 - (x[i3:i4+1]-x3) / (x4-x3)
            elif nam == 'wel':
                fwin[i1:i2+1] = 1 - ((x[i1:i2+1]-x2) / (x2-x1))**2
                fwin[i3:i4+1] = 1 - ((x[i3:i4+1]-x3) / (x4-x3))**2
            elif nam  in ('kai', 'bes'):
                cen  = (x4+x1)/2
                wid  = (x4-x1)/2
                arg  = 1 - (x-cen)**2 / (wid**2)
                arg[where(arg<0)] = 0
                if nam == 'bes': # 'bes' : ifeffit 1.0 implementation of kaiser-bessel
                    fwin = bessel_i0(dx* sqrt(arg)) / bessel_i0(dx)
                    fwin[where(x<=x1)] = 0
                    fwin[where(x>=x4)] = 0
                else: # better version
                    scale = max(1.e-10, bessel_i0(dx)-1)
                    fwin = (bessel_i0(dx * sqrt(arg)) - 1) / scale
            elif nam == 'sin':
                fwin[i1:i4+1] = sin(pi*(x4-x[i1:i4+1]) / (x4-x1))
            elif nam == 'gau':
                cen  = (x4+x1)/2
                fwin =  exp(-(((x - cen)**2)/(2*dx1*dx1)))
            return fwin

        def spline_eval(kraw, mu, knots, coefs, order, kout):
            bkg = splev(kraw, [knots, coefs, order])
            chi = UnivariateSpline(kraw, (mu-bkg), s=0)(kout)
            return bkg, chi

        def _resid(vcoefs, ncoef, kraw, mu, chi_std, knots, order, kout,
                    ftwin, nfft, irbkg, nclamp, clamp_lo, clamp_hi):
            global NFEV
            NFEV += 1
            nspl = len(vcoefs)
            coefs = np.ones(ncoef)*vcoefs[-1]
            coefs[:nspl] = vcoefs
            bkg, chi = spline_eval(kraw, mu, knots, coefs, order, kout)
            if chi_std is not None:
                chi = chi - chi_std
            out =  realimag(xftf_fast(chi*ftwin, nfft=nfft)[:irbkg])
            if nclamp == 0:
                return out
            scale = 1.0 + 100*(out*out).mean()
            return  np.concatenate((out,
                                    abs(clamp_lo)*scale*chi[:nclamp],
                                    abs(clamp_hi)*scale*chi[-nclamp:]))

        def realimag(arr):
            return np.array([(i.real, i.imag) for i in arr]).flatten()

        def xftf_fast(chi, nfft=2048, kstep=0.05, _larch=None, **kws):
            cchi = zeros(nfft, dtype='complex128')
            cchi[0:len(chi)] = chi
            return (kstep / sqrtpi) * np.fft.fft(cchi)[:int(nfft/2)]

        def autobk(energy, mu=None, group=None, rbkg=1, nknots=None, e0=None, ek0=None,
                edge_step=None, kmin=0, kmax=None, kweight=1, dk=0.1,
                win='hanning', k_std=None, chi_std=None, nfft=2048, kstep=0.05,
                pre_edge_kws=None, nclamp=3, clamp_lo=0, clamp_hi=1,
                calc_uncertainties=False, err_sigma=1, _larch=None, **kws):

            msg = sys.stdout.write
            if _larch is not None:
                msg = _larch.writer.write
            if 'kw' in kws:
                kweight = kws.pop('kw')
            if len(kws) > 0:
                msg('Unrecognized arguments for autobk():\n')
                msg('    %s\n' % (', '.join(kws.keys())))
                return

            energy = np.array(energy)
            mu = np.array(mu)
            
            if len(energy.shape) > 1:
                energy = energy.squeeze()
            if len(mu.shape) > 1:
                mu = mu.squeeze()
            energy = remove_dups(energy, tiny=TINY_ENERGY)

            if e0 is not None and ek0 is None:  # command-line e0 still valid
                ek0 = e0

            if ek0 is None or edge_step is None:
                msg('autobk() could not determine ek0 or edge_step!: trying running pre_edge first\n')
                return

            # get array indices for rkbg and ek0: irbkg, iek0
            iek0 = index_of(energy, ek0)
            rgrid = np.pi/(kstep*nfft)
            rbkg = max(rbkg, 2*rgrid)

            # save ungridded k (kraw) and grided k (kout)
            # and ftwin (*k-weighting) for FT in residual
            enpe = energy[iek0:] - ek0
            kraw = np.sign(enpe)*np.sqrt(ETOK*abs(enpe))
            if kmax is None:
                kmax = max(kraw)
            else:
                kmax = max(0, min(max(kraw), kmax))
            kout  = kstep * np.arange(int(1.01+kmax/kstep), dtype='float64')
            iemax = min(len(energy), 2+index_of(energy, ek0+kmax*kmax/ETOK)) - 1

            # interpolate provided chi(k) onto the kout grid
            if chi_std is not None and k_std is not None:
                chi_std = np.interp(kout, k_std, chi_std)
            # pre-load FT window
            ftwin = kout**kweight * ftwindow(kout, xmin=kmin, xmax=kmax,
                                            window=win, dx=dk, dx2=dk)
            # calc k-value and initial guess for y-values of spline params
            nspl = 1 + int(2*rbkg*(kmax-kmin)/np.pi)
            irbkg = int(1 + (nspl-1)*np.pi/(2*rgrid*(kmax-kmin)))
            if nknots is not None:
                nspl = nknots
            nspl = max(5, min(128, nspl))
            spl_y, spl_k  = np.ones(nspl), np.zeros(nspl)

            for i in range(nspl):
                q  = kmin + i*(kmax-kmin)/(nspl - 1)
                ik = index_nearest(kraw, q)
                i1 = min(len(kraw)-1, ik + 5)
                i2 = max(0, ik - 5)
                spl_k[i] = kraw[ik]
                spl_y[i] = (2*mu[ik+iek0] + mu[i1+iek0] + mu[i2+iek0] ) / 4.0

            order = 3
            qmin, qmax  = spl_k[0], spl_k[nspl-1]
            knots = [spl_k[0] - 1.e-4*(order-i) for i in range(order)]

            for i in range(order, nspl):
                knots.append((i-order)*(qmax - qmin)/(nspl-order+1))
            qlast = knots[-1]
            for i in range(order+1):
                knots.append(qlast + 1.e-4*(i+1))

            # coefs = [mu[index_nearest(energy, ek0 + q**2/ETOK)] for q in knots]
            knots, coefs, order = splrep(spl_k, spl_y, k=order)
            coefs[nspl:] = coefs[nspl-1]
            ncoefs = len(coefs)
            kraw_ = kraw[:iemax-iek0+1]
            mu_  = mu[iek0:iemax+1]
            initbkg, initchi = spline_eval(kraw_, mu_, knots, coefs, order, kout)
            global NFEV
            NFEV = 0

            vcoefs = 1.0*coefs[:nspl]
            userargs = (len(coefs), kraw_, mu_, chi_std, knots, order, kout,
                    ftwin, nfft, irbkg, nclamp, clamp_lo, clamp_hi)

            lsout = leastsq(_resid, vcoefs, userargs, maxfev=2000*(ncoefs+1),
                            gtol=0.0, ftol=1.e-6, xtol=1.e-6, epsfcn=1.e-6,
                            full_output=1, col_deriv=0, factor=100, diag=None)

            best, covar, _infodict, errmsg, ier = lsout
            final_coefs        = coefs[:]
            final_coefs[:nspl] = best[:]
            final_coefs[nspl:] = best[-1]

            chisqr = ((_resid(best, *userargs))**2).sum()
            redchi = chisqr / (2*irbkg+2*nclamp - nspl)

            coefs_std = np.array([np.sqrt(redchi*covar[i, i]) for i in range(nspl)])
            bkg, chi = spline_eval(kraw[:iemax-iek0+1], mu[iek0:iemax+1],
                                knots, final_coefs, order, kout)
            obkg = mu[:]*1.0
            obkg[iek0:iek0+len(bkg)] = bkg

            k = kout
        #    chi = chi/edge_step
            chi = chi
            
            knots_y  = np.array([coefs[i] for i in range(nspl)])
            init_bkg = mu[:]*1.0
            init_bkg[iek0:iek0+len(bkg)] = initbkg
            # now fill in 'autobk_details' group

            if  calc_uncertainties and covar is not None:
                autobk_delta_chi(group, err_sigma=err_sigma)

            return k, chi

        def xftf_prep(k, chi, kmin=0, kmax=20, kweight=2, dk=1, dk2=None,
                        window='kaiser', nfft=2048, kstep=0.05, _larch=None):

            if dk2 is None: dk2 = dk
            kweight = int(kweight)
            npts = int(1.01 + max(k)/kstep)
            k_max = max(max(k), kmax+dk2)
            k_   = kstep * np.arange(int(1.01+k_max/kstep), dtype='float64')
            chi_ = interp(k_, k, chi)
            win  = ftwindow(k_, xmin=kmin, xmax=kmax, dx=dk, dx2=dk2, window=window)
            return ((chi_[:npts] *k_[:npts]**kweight), win[:npts])

        def xftf(k, chi=None, group=None, kmin=0, kmax=20, kweight=None,
                dk=1, dk2=None, with_phase=False, window='kaiser', rmax_out=10,
                nfft=2048, kstep=None, _larch=None, **kws):

            # allow kweight keyword == kw
            if kweight is None:
                if 'kw' in kws:
                    kweight = kws['kw']
                else:
                    kweight = 2

            if kstep is None:
                kstep = k[1] - k[0]

            cchi, win  = xftf_prep(k, chi, kmin=kmin, kmax=kmax, kweight=kweight,
                                    dk=dk, dk2=dk2, nfft=nfft, kstep=kstep,
                                    window=window, _larch=_larch)

            out = xftf_fast(cchi*win, kstep=kstep, nfft=nfft)
            rstep = pi/(kstep*nfft)

            irmax = int(min(nfft/2, 1.01 + rmax_out/rstep))

            r   = rstep * arange(irmax)
            mag = sqrt(out.real**2 + out.imag**2)

            r = r[:irmax]
            chir_mag = mag[:irmax]

            return r, chir_mag

        k_new = autobk(dataset['Raw_Energy'], mu=mu_new, edge_step = edge_step_new, e0=e0_new)[0]
        chi_new = autobk(dataset['Raw_Energy'], mu=mu_new, edge_step = edge_step_new, e0=e0_new)[1]

        r_new = xftf(k=k_new, chi=chi_new, kweight=3, kmin=2, kmax=16, dk=0.7, window='hanning')[0]
        chir_mag_new = xftf(k=k_new, chi=chi_new, kweight=3, kmin=2, kmax=16, dk=0.7, window='hanning')[1]


        #dataset['XANES_Data'] = data['view']['settings']['XANES_Data']
        #dataset['EXAFS_Data'] = data['view']['settings']['EXAFS_Data']

        #Remove None values for XANES_xpoint and XANES_ypoint
        #XANES_xpoint = [x for x in dataset['XANES_Data']['XANES_x'] if x is not None]
        #XANES_ypoint = [y for y in dataset['XANES_Data']['XANES_y'] if y is not None]

        #EXAFS_xpoint = [x for x in dataset['EXAFS_Data']['EXAFS_x'] if x is not None]
        #EXAFS_ypoint = [y for y in dataset['EXAFS_Data']['EXAFS_y'] if y is not None]

        #dataset['XANES_Data'] = []
        #dataset['EXAFS_Data'] = []

        #dataset['XANES_x'] = dataset['Raw_Energy']  #XANES_xpoint
        #dataset['XANES_y'] = mu_new.tolist()                 #XANES_ypoint

        #dataset['EXAFS_x'] = r_new.tolist()                  #EXAFS_xpoint
        #dataset['EXAFS_y'] = chir_mag_new.tolist()           #EXAFS_ypoint
        
        dataset['XANES_Data']['XANES_x'] = dataset['Raw_Energy']
        dataset['XANES_Data']['XANES_y'] = mu_new.tolist()

        dataset['EXAFS_Data']['EXAFS_x'] = r_new.tolist()
        dataset['EXAFS_Data']['EXAFS_y'] = chir_mag_new.tolist()

        ########XANES###################################################

        df = pd.DataFrame({'energy': dataset['XANES_Data']['XANES_x'], 'mu': dataset['XANES_Data']['XANES_y']})

        #XA_Min_En
        df["mu_3"]=df["mu"].rolling(3).mean().round(1)
        threshold = 0.1
        min_energy_point = pd.DataFrame(columns=df.columns)
        if "route" in data['view']['settings']:
            min_data_option = data['view']['settings']['Min_Data_Option']
        else:
            min_data_option = 20
        for index, row in df.iterrows():
            if index >= min_data_option and row['mu_3'] >= threshold:
                min_energy_point = df[index:].nsmallest(1, 'energy')
                dataset['XANES_statistics_Minx'] = min_energy_point['energy'].iloc[0]
                dataset['XANES_statistics_Miny'] = min_energy_point['mu'].iloc[0]
                break

        max_points = df[(df['mu'].shift(1) < df['mu']) & (df['mu'].shift(-1) < df['mu'])]
        max_energy_points = max_points[(max_points['mu'].shift(1) < max_points['mu']) & (max_points['mu'].shift(-1) < max_points['mu'])]

        e0 = e0_new

        # Get the smallest index among values greater than e0 in XANES_xpoint
        indices_greater_than_e0 = np.where(dataset['XANES_Data']['XANES_x'] > e0)[0]
        closest_index = indices_greater_than_e0[0] if len(indices_greater_than_e0) > 0 else None

        if closest_index is not None:
            max_energy_point = max_energy_points[max_energy_points['mu'] >= dataset['XANES_Data']['XANES_y'][closest_index]].nsmallest(1, 'energy')
        #else:
        #    max_energy_point = max_points.nlargest(1, 'mu')

        if max_energy_point.empty:
            max_energy_point = max_points[max_points['energy'] > e0].nsmallest(1, 'energy')

        # Get the index of the XANES_xpoint that is exactly equal to e0
        indices = np.where(np.abs(dataset['XANES_Data']['XANES_x'] - e0) < 1e-10)[0]

        # If indices is not empty, get the next element
        if indices:
            next_idx = indices[0] + 0

        dataset['XANES_statistics_Maxx'] = max_energy_point['energy'].iloc[0]
        dataset['XANES_statistics_Maxy'] = max_energy_point['mu'].iloc[0]
        dataset['XANES_statistics_E0x'] = dataset['XANES_Data']['XANES_x'][next_idx]
        dataset['XANES_statistics_E0y'] = dataset['XANES_Data']['XANES_y'][next_idx]

        # Check the condition and update if necessary
        if dataset['XANES_statistics_E0x'] <= dataset['XANES_statistics_Minx']:
            dataset['XANES_statistics_Minx'] = dataset['XANES_Data']['XANES_x'][next_idx - 1]
            dataset['XANES_statistics_Miny'] = dataset['XANES_Data']['XANES_y'][next_idx - 1]

        peak_width = dataset['XANES_statistics_Maxx'] - dataset['XANES_statistics_Minx']

        ###########EXAFS##############################################

        EXAFS_xpoint = dataset['EXAFS_Data']['EXAFS_x']
        EXAFS_ypoint = dataset['EXAFS_Data']['EXAFS_y']

        EXAFS_xpoint = np.array(EXAFS_xpoint)
        EXAFS_ypoint = np.array(EXAFS_ypoint)

        condition = (1 <= EXAFS_xpoint) & (EXAFS_xpoint <= 6)
        x_range = EXAFS_xpoint[condition]
        y_range = EXAFS_ypoint[condition]
        peaks, _ = find_peaks(y_range)
        peak_xpositions = [x_range[i] for i in peaks]
        peak_ypositions = [y_range[i] for i in peaks]
        max_peak_index = np.argmax(peak_ypositions)
        max_peak_xposition = peak_xpositions[max_peak_index]

        dataset['EXAFS_statistics_x'] = max_peak_xposition
        dataset['EXAFS_statistics_y'] = max(peak_ypositions)

        ###########periodic table#####################
        pt_strIO = StringIO(periodictablestring)
        testpt = pd.read_csv(pt_strIO)

        element = testpt[testpt['Element'] == element_name]

        ##################################################

        columns_to_extract = ['Peak_E0_μt', 'Peak_Max_μt', 'Max_y_xposition', 'Max_y', 'vdw_radius_alvarez', 'Peak_Width', 'gs_energy', 'fusion_enthalpy', 'num_unfilled']
        data_information=[dataset['XANES_Data']['XANES_y'][next_idx], max_energy_point['mu'].iloc[0], max_peak_xposition, max(peak_ypositions), element['vdw_radius_alvarez'].values[0],
                        peak_width, element['gs_energy'].values[0], element['fusion_enthalpy'].values[0], element['num_unfilled'].values[0]]

        data_information_df = pd.DataFrame([data_information], columns=columns_to_extract)

        ##############################################################################
        #Oxide & Valence Group (0, 1-3, 4-6) Classification
        ##############################################################################
        Oxide008 = StringIO(Train_Oxide_008)
        df008 = pd.read_csv(Oxide008)
        #########Oxide#################
        target_A_8 = df008.iloc[:, 1]
        targets_A_8 = np.array(target_A_8)
        data1_8 = df008.iloc[:, 3:8]
        datas1_8 = np.array(data1_8)
        model_8 = RandomForestClassifier(random_state=0, n_estimators=80)
        model_8.fit(datas1_8, targets_A_8)
        pred_8 = data_information_df
        pred1_8 = pred_8.iloc[:, :5]
        pred_data_8 = np.array(pred1_8)
        predictionlist_8 = []
        result_8 = model_8.predict(pred_data_8)
        predictionlist_8.extend(result_8)
        df_result_8 = pd.DataFrame(predictionlist_8, columns=['Predict_Oxide'])
        results_8 = pd.concat([pred_8, df_result_8], axis=1)
        results_8['Oxide'] = result_8
        results_8 = pd.concat([results_8.iloc[:, -1], results_8.iloc[:, :-1]], axis=1)
        ###########Valence##########################
        target_B_8 = df008.iloc[:, 2]
        targets_B_8 = np.array(target_B_8)
        data2_A_8 = df008.iloc[:, 1]
        data2_B_8 = df008.iloc[:, 3:7]
        data2_C_8 = df008.iloc[:, 8:]
        data2_8 = pd.concat([data2_A_8, data2_B_8, data2_C_8], axis=1)
        datas2_8 = np.array(data2_8)
        model_8V = RandomForestClassifier(random_state=0, n_estimators=80)
        model_8V.fit(datas2_8, targets_B_8)
        pred3_8 = results_8.iloc[:, :5]
        pred4_8 = results_8.iloc[:, 6:-1]
        pred5_8 = pd.concat([pred3_8, pred4_8], axis=1)
        pred_data2_8 = np.array(pred5_8)
        predictionlist_A_8 = []
        result2_8 = model_8V.predict(pred_data2_8)
        predictionlist_A_8.extend(result2_8)
        df_result2_8 = pd.DataFrame(predictionlist_A_8, columns=['Predict_Valence(0, 1-3, 4-6)'])
        #############################################################
        #To make the display more user-friendly, the following code should also be executed
        replace_dict = {3: '1 - 3', 4: '4 - 6'}
        df_result2_8['Predict_Valence(0, 1-3, 4-6)'] = df_result2_8['Predict_Valence(0, 1-3, 4-6)'].replace(replace_dict)
        #############################################################
        results_8 = pd.concat([pred_8, df_result_8, df_result2_8], axis=1)

        #results_8.to_csv('PredictData_for_Oxide&Valence_008.csv', index=False)
        result_df008 = results_8.iloc[:, -2:]

        dataset['Predict_Oxide'] = result_df008['Predict_Oxide'].values[0]
        dataset['Predict_Valence_Group'] = result_df008['Predict_Valence(0, 1-3, 4-6)'].values[0]

        ##############################################################################
        #Oxide & Valence Each (0, 1, 2, 3, 4, 5, 6) Classification
        ##############################################################################
        Oxide006 = StringIO(Train_006)
        df006 = pd.read_csv(Oxide006)
        #########Oxide#################
        target_A_6 = df006.iloc[:, 1]
        targets_A_6 = np.array(target_A_6)
        data1_6 = df006.iloc[:, 3:8]
        datas1_6 = np.array(data1_6)
        model_6 = RandomForestClassifier(random_state=0, n_estimators=80)
        model_6.fit(datas1_6, targets_A_6)
        pred_6 = data_information_df
        pred1_6 = pred_6.iloc[:, :5]
        pred_data_6 = np.array(pred1_6)
        predictionlist_6 = []
        result_6 = model_6.predict(pred_data_6)
        predictionlist_6.extend(result_6)
        df_result_6 = pd.DataFrame(predictionlist_6, columns=['Predict_Oxide'])
        results_6 = pd.concat([pred_6, df_result_6], axis=1)
        results_6['Oxide'] = result_6
        results_6 = pd.concat([results_6.iloc[:, -1], results_6.iloc[:, :-1]], axis=1)
        ###########Valence##########################
        target_B_6 = df006.iloc[:, 2]
        targets_B_6 = np.array(target_B_6)
        data2_A_6 = df006.iloc[:, 1]
        data2_B_6 = df006.iloc[:, 3:7]
        data2_C_6 = df006.iloc[:, 8:]
        data2_6 = pd.concat([data2_A_6, data2_B_6, data2_C_6], axis=1)
        datas2_6 = np.array(data2_6)
        model1_6V = RandomForestClassifier(random_state=0, n_estimators=80)
        model2_6V = MLPClassifier(random_state=0, solver='lbfgs', alpha=0.4, activation='tanh', max_iter=800)
        model_6V  = VotingClassifier(estimators=[('rf', model1_6V), ('mlp', model2_6V)], voting='soft', weights=[0.85, 0.15])
        model_6V.fit(datas2_6, targets_B_6)
        pred3_6 = results_6.iloc[:, :5]
        pred4_6 = results_6.iloc[:, 6:-1]
        pred5_6 = pd.concat([pred3_6, pred4_6], axis=1)
        pred_data2_6 = np.array(pred5_6)
        predictionlist_A_6 = []
        result2_6 = model_6V.predict(pred_data2_6)
        predictionlist_A_6.extend(result2_6)
        df_result2_6 = pd.DataFrame(predictionlist_A_6, columns=['Predict_Valence(0, 1, 2, 3, 4, 5, 6)'])
        results_6 = pd.concat([pred_6, df_result_6, df_result2_6], axis=1)
        #results_6.to_csv('PredictData_for_Oxide&Valence_006.csv', index=False)

        result_df006 = pd.concat([results_6.iloc[:, 0], results_6.iloc[:, -2:]], axis=1)

        dataset['Predict_Valence_Each'] = result_df006['Predict_Valence(0, 1, 2, 3, 4, 5, 6)'].values[0]

        #df_all = pd.concat([df008, df006.iloc[:, -1]], axis=1)
        #df_all2 = pd.merge(result_df1, df_all, on=["Data_Number"], how="inner")
        #display(df_all2)
        #df_all2.to_csv('PredictData_for_Oxide&Valence_all.csv', index=False)
            
        return dataset

#-------------------------------------------------------------------------------------------------
periodictablestring = """Element,fusion_enthalpy,gs_energy,num_unfilled,vdw_radius_alvarez
H,0.06,-3.331290765,1,120
He,6.001797775,0.0011354,0,143
Li,3,-1.86988691,1,212
Be,7.895,-3.755038695,0,198
B,50.2,-6.677698154,5,191
C,117.4,-9.209713655,4,177
N,0.355,-8.21144121,3,166
O,0.22,-4.756791905,2,150
F,0.255,-1.698060958,1,146
Ne,0.164,0.09403567,0,158
Na,2.6,-1.260241383,1,250
Mg,8.48,-1.54227231,0,251
Al,10.71,-3.74542312,5,225
Si,50.21,-5.424918005,4,219
P,18.54,-5.400509043,3,190
S,1.721,-4.097216719,2,189
Cl,3.2,-1.784433755,1,182
Ar,1.18,0.05854104,0,194
K,2.335,-1.097539713,1,273
Ca,8.54,-1.948329565,0,262
Sc,14.1,-6.28551309,9,258
Ti,14.15,-7.77522712,8,246
V,21.5,-8.93926069,7,242
Cr,21,-9.50571654,6,245
Mn,12.91,-9.02056525,5,245
Fe,13.81,-8.28548436,4,244
Co,16.2,-7.080389145,3,240
Ni,17.48,-5.54632457,2,240
Cu,13.6,-3.68065482,1,238
Zn,7.068,-1.239999915,0,239
Ga,5.585,-3.012255303,5,232
Ge,36.94,-4.616039545,4,229
As,24.44,-4.650889115,3,188
Se,6.69,-3.47079191,2,182
Br,5.285,-1.583025338,1,186
Kr,1.164,0.08753524,0,207
Rb,2.19,-0.963335025,1,321
Sr,7.43,-1.6828136,0,284
Y,11.39,-6.464599775,9,275
Zr,21,-8.545958555,8,252
Nb,30,-10.09332153,7,256
Mo,37.48,-10.84610777,6,245
Tc,33.29,-10.3551512,5,244
Ru,38.59,-9.19463357,4,246
Rh,26.59,-7.25364552,3,244
Pd,16.74,-5.13777457,0,215
Ag,11.3,-2.76539356,1,253
Cd,6.21,-0.812174225,0,249
In,3.291,-2.66680196,5,243
Sn,7.15,-3.96104709,4,242
Sb,19.79,-4.11736234,3,247
Te,17.38,-3.141302507,2,199
I,7.76,-1.505402418,1,204
Xe,2.27,0.04873128,0,228
Cs,2.09,-0.85462646,1,348
Ba,7.12,-1.92352226,0,303
La,6.2,-4.927546185,9,298
Ce,5.46,-4.77656965,22,288
Pr,6.89,-4.77382996,11,292
Nd,7.14,-4.76235134,10,295
Pm,15.6487277,-4.744621343,9,293.2335143
Sm,8.62,-4.713379635,8,290
Eu,9.21,-1.82958684,7,287
Gd,9.67,-4.65442131,16,283
Tb,10.15,-4.629217697,5,279
Dy,11.35,-4.601554453,4,287
Ho,11.76,-4.577416877,3,281
Er,19.9,-4.563633745,2,283
Tm,16.84,-4.47387849,1,279
Yb,7.66,-1.47410408,0,280
Lu,18.65,-4.52300002,9,274
Hf,27.2,-9.954299335,8,263
Ta,36.57,-11.85139954,7,253
W,52.31,-12.95880062,6,257
Re,34.08,-12.41702777,5,249
Os,57.85,-11.22070399,4,248
Ir,41.12,-8.84851145,3,241
Pt,22.175,-6.02850968,2,229
Au,12.55,-3.20969261,1,232
Hg,2.295,-0.250105562,0,245
Tl,4.142,-2.27267753,5,247
Pb,4.774,-3.62902961,4,260
Bi,11.106,-3.9736944,3,254
Po,10,-4.039348349,2,214.2720439
At,11.05330931,-4.039348349,1,203.0523628
Rn,7.728805588,-4.039348349,0,240
Fr,7.297893185,-4.039348349,1,247.9600442
Ra,7.7,-4.039348349,0,248.9334266
Ac,12,-4.105002298,9,280
Th,13.81,-7.41254306,8,293
Pa,12.34,-9.49741247,21,288
U,9.14,-11.29233996,20,271
Np,3.2,-12.94031436,19,282
Pu,2.824,-14.32663431,8,281
"""

Train_Oxide_008 = """Data_Number,Oxide,Valence,Peak_E0_μt,Peak_Max_μt,Max_y_xposition,Max_y,vdw_radius_alvarez,Peak_Width,gs_energy,fusion_enthalpy,num_unfilled
218,0,0,0.781122182906341,1.08879214659341,2.45436926061703,32.8847129302847,215,54.0236550000009,-5.13777457,16.74,0
220,0,0,0.72931222262096,1.1058360388172,2.20893233455532,2.68447325475762,215,46.6150130000024,-5.13777457,16.74,0
225,0,0,0.168401241097614,1.09791502601094,2.45436926061703,1.19482979972818,240,50.7699999999986,-5.54632457,17.48,2
226,0,0,0.645385065560281,1.06444309085501,3.5895150436524,0.721218909965802,245,46.0599999999977,-10.84610777,37.48,6
229,1,3,1.09419276701734,1.65417335994617,2.6384469551633,18.3902461612642,240,17.6199999999999,-7.080389145,16.2,3
231,1,3,0.46391791768529,1.22366308809691,1.77941771394734,1.66942289386451,238,17.0600000000013,-3.68065482,13.6,1
233,1,3,0.834094778397302,1.29023204216136,1.62601963515878,9.84092974757643,238,9.20000000000073,-3.68065482,13.6,1
236,0,0,0.443473096642326,1.18728513414794,2.23961195031304,12.3531020629595,239,14.0400000000009,-1.239999915,7.068,0
248,1,3,1.06156631078093,1.81830448774281,2.51572849213245,2.68531032720866,240,15.2299999999996,-5.54632457,17.48,2
249,1,4,1.4106888957371,1.77534323554673,1.74873809818963,1.7939939355346,245,21.1900000000005,-9.02056525,12.91,5
250,1,3,1.03762453261065,1.59703081301958,2.33165079758617,1.53931209726335,245,19.21,-9.02056525,12.91,5
252,1,3,0.46552595007524,1.46457105674337,2.69980618667873,2.84791832513053,245,15.7699999999995,-9.02056525,12.91,5
253,1,3,1.36523934423524,1.66139687820329,1.93281579273591,3.1451682477916,245,21.2400000000007,-9.50571654,21.0,6
257,1,4,1.01961426974098,1.40368441970859,1.74873809818963,1.0600973643731,246,18.8199999999997,-7.77522712,14.15,8
258,1,3,1.04313142638316,1.77342851265877,1.96349540849362,1.41474486787293,244,20.2200000000002,-8.28548436,13.81,4
260,0,0,0.227228506119833,1.01229100684117,2.20893233455532,39.3653297373309,240,25.5299999999997,-7.080389145,16.2,3
261,0,0,0.186690715683001,1.05611005795333,2.33165079758617,7.68239898343462,245,19.1799999999994,-9.02056525,12.91,5
262,0,0,0.169525621227213,1.0770218630426,2.20893233455532,43.5827781521375,240,51.2600000000002,-5.54632457,17.48,2
263,0,0,0.846174018453792,1.03780082722173,2.48504887637474,21.8945968255728,256,17.4399999999987,-10.09332153,30.0,7
264,1,4,0.642001785869911,1.24187247661183,1.07378655151995,7.56621498961586,256,36.6599999999999,-10.09332153,30.0,7
265,0,0,0.24605530712024,1.06457387602587,2.54640810789016,16.5844713225845,246,19.0299999999997,-7.77522712,14.15,8
274,0,0,0.155443731502485,1.00715695117645,2.17825271879761,35.7957161007858,240,25.3463016299993,-7.080389145,16.2,3
275,1,4,0.802044872871759,1.06473473309399,3.46679658062155,15.9118052668159,288,62.0300000000061,-4.77656965,5.46,22
276,1,3,0.395434681989438,1.0203386548339,1.68737886667421,4.36814664393095,253,30.6399999999994,-2.76539356,11.3,1
278,1,3,0.469708406479693,1.27638212840903,1.59534001940107,12.5057620153736,246,20.71,-7.77522712,14.15,8
279,1,4,1.02422422683295,1.40541152297423,1.10446616727766,14.4836533490363,246,23.21,-7.77522712,14.15,8
285,1,3,0.888444681641742,1.155940500644,2.45436926061703,14.888219116479,256,27.6892100000005,-10.09332153,30.0,7
287,1,4,1.12094771533634,1.49343657881994,1.62601963515878,14.576471701197,242,34.2699999999968,-3.96104709,7.15,4
288,1,3,0.845095863056605,1.54094212219881,2.60776733940559,27.8703488073535,240,17.8199999999997,-5.54632457,17.48,2
299,1,4,0.527052430426678,1.27578444283739,1.38058270909708,11.5310979024768,245,51.5300000000007,-9.02056525,12.91,5
302,1,3,0.755005681734066,1.217070709116,1.81009732970506,1.44975985596789,215,28.0900000000001,-5.13777457,16.74,0
304,1,3,0.430179895627972,1.25659664436288,3.00660234425586,0.498228612010668,245,19.6300000000001,-9.02056525,12.91,5
305,0,0,0.177163740640611,1.0917252291574,2.20893233455532,0.930006983072324,245,17.8400000000001,-9.02056525,12.91,5
306,1,3,0.448085530082365,1.38038532781695,2.42368964485931,1.28973882180575,245,15.3699999999999,-9.02056525,12.91,5
308,1,4,0.857335396257223,1.34548046990575,1.4419419406125,6.91145513107343,242,28.0599999999977,-3.96104709,7.15,4
309,0,0,0.658048438571788,1.05306818538536,1.99417502425133,0.252505079535856,242,28.0499999999993,-3.96104709,7.15,4
310,1,3,0.405991758292549,1.22701483333697,1.04310693576224,13.8485309153147,245,21.8599999999997,-9.02056525,12.91,5
314,0,0,0.604354986342388,1.00652824119267,2.97592272849814,1.33799886493162,243,32.7900000000009,-2.66680196,3.291,5
315,0,0,0.739962110031517,1.02760692840661,2.66912657092102,0.768390848219402,243,25.6700000000019,-2.66680196,3.291,5
316,0,0,0.659149815782981,1.00244063317667,3.00660234425586,0.995885777693946,243,35.9900000000016,-2.66680196,3.291,5
317,0,0,0.720662902129129,1.00192446333841,2.94524311274043,1.14147327470166,243,35.9900000000016,-2.66680196,3.291,5
318,0,0,0.701083660528225,1.02647342877347,2.94524311274043,1.66145279966085,243,33.1500000000015,-2.66680196,3.291,5
319,0,0,0.656782715248699,1.05183038529799,5.79844737820772,2586.30558772431,243,25.3100000000013,-2.66680196,3.291,5
320,0,0,0.657030885549467,1.01949362105623,2.94524311274043,2.1753392071182,243,33.1500000000015,-2.66680196,3.291,5
322,0,0,0.728824629024898,1.04288680995554,1.38058270909708,579.480841660334,243,25.6700000000019,-2.66680196,3.291,5
324,0,0,0.717149236141494,1.03736717325971,3.68155389092554,6170.61672515635,243,25.6699999999983,-2.66680196,3.291,5
325,0,0,0.675451339934619,1.01706722624481,2.97592272849814,3.94620708798027,243,34.2200000000012,-2.66680196,3.291,5
326,0,0,0.452855490355052,1.0387658581206,1.53398078788564,2265.087794701,243,24.5900000000001,-2.66680196,3.291,5
327,0,0,0.674437441407751,1.0184414377784,3.22135965455985,6.41223739306688,243,34.2200000000012,-2.66680196,3.291,5
328,1,3,1.04586715658423,1.58570789288916,2.73048580243644,0.466387320684806,244,19.5799999999999,-8.28548436,13.81,4
330,0,0,0.342219198091654,1.10078140865332,2.42368964485931,53.7118371450703,244,55.0200000000004,-7.25364552,26.59,3
331,1,3,0.401655488383587,1.44752722484011,2.79184503395187,12.9132868055401,245,17.4899999999998,-9.02056525,12.91,5
333,1,3,0.988134606324648,1.40573329003804,1.87145656122048,1.43363479514286,244,25.5299999999988,-7.25364552,26.59,3
334,0,0,0.615685133353679,1.08817706560336,2.45436926061703,32.7931616786206,215,55.0,-5.13777457,16.74,0
335,0,0,0.674479213851147,1.09035024359643,2.45436926061703,44.4683411674565,215,54.0,-5.13777457,16.74,0
336,0,0,0.681219875194022,1.09416310657143,2.45436926061703,62.7767673919165,215,54.0,-5.13777457,16.74,0
337,0,0,0.666943194154289,1.09500474491872,2.45436926061703,68.9818019753093,215,55.0,-5.13777457,16.74,0
338,0,0,0.67438580650959,1.09548492081834,2.45436926061703,72.7919908991312,215,54.0,-5.13777457,16.74,0
339,0,0,0.670859565040902,1.09610299157176,2.45436926061703,76.3614555958971,215,55.0,-5.13777457,16.74,0
342,1,3,0.734484730397958,1.48366178809022,2.6384469551633,14.7580602139086,244,20.8800000000001,-8.28548436,13.81,4
347,0,0,0.79029578177219,1.08920545241949,2.36233041334389,40.2897579657267,245,51.2000000000007,-10.84610777,37.48,6
348,0,0,0.758298224785072,1.01070920460047,2.3930100291016,58.0282499403809,245,24.0,-10.84610777,37.48,6
351,0,0,0.429735967489144,1.10431822219804,2.30097118182846,1.78391454262433,246,49.1699999999983,-9.19463357,38.59,4
352,1,4,0.889032388971215,1.44969105541686,2.6384469551633,3684.14437714684,246,26.4600000000028,-9.19463357,38.59,4
354,1,3,0.988134606324648,1.40573329003804,1.87145656122048,1.43363479514286,244,25.5299999999988,-7.25364552,26.59,3
355,1,4,0.946042149885484,1.17276556098543,2.42368964485931,12.3239493956622,256,26.9078100000006,-10.09332153,30.0,7
356,1,3,0.977523582927338,1.71795164619023,2.36233041334389,1.24793640657071,240,13.2799999999997,-7.080389145,16.2,3
359,0,0,0.150219219529218,1.06865276857604,1.84077694546277,0.910680451387555,245,21.0,-9.50571654,21.0,6
360,1,3,1.04586715658423,1.58570789288916,2.73048580243644,0.466387320684806,244,19.5799999999999,-8.28548436,13.81,4
361,0,0,0.182579766138093,1.08933507522219,2.20893233455532,0.917425300437298,245,18.1700000000001,-9.02056525,12.91,5
362,1,4,0.447052246318421,1.38260047215076,3.16000042304442,0.532240156646912,245,19.9299999999994,-9.02056525,12.91,5
364,1,3,0.507426262212515,1.57612564321781,1.16582539879309,13.6971959200321,245,21.5900000000001,-9.50571654,21.0,6
367,1,4,0.684863469599881,1.0747109593744,1.59534001940107,8.05345595776403,245,43.2400000000016,-10.84610777,37.48,6
372,1,4,0.779092201709989,1.25178360736124,2.94524311274043,1.12598239348125,256,33.828510000003,-10.09332153,30.0,7
378,1,4,0.823495948379365,1.24683535609904,1.59534001940107,6.05441621903821,256,37.5275899999979,-10.09332153,30.0,7
381,1,4,0.702697405108314,1.04153050853038,2.36233041334389,0.661231113932584,245,40.7964432199988,-10.84610777,37.48,6
382,1,3,0.820236833144902,1.10381646398886,3.09864119152899,16.3711480490946,215,32.101980970001,-5.13777457,16.74,0
383,1,3,0.832239899776155,1.1954704249518,1.84077694546277,1.57296284872492,215,23.4758325799994,-5.13777457,16.74,0
384,0,0,0.223826564331089,1.07529336862525,2.27029156607075,72.8179434757969,238,49.0300000000007,-3.68065482,13.6,1
385,0,0,0.161300136622501,1.05990245387623,2.36233041334389,6.56697220964944,245,49.0,-9.02056525,12.91,5
387,0,0,0.16531483782741,1.06525548378836,2.36233041334389,11.2063003713613,245,18.9899999999998,-9.02056525,12.91,5
388,0,0,0.175538952862473,1.08906093177419,2.20893233455532,80.4866288226944,240,51.4799999999996,-5.54632457,17.48,2
390,0,0,0.683097415228021,1.12269657373751,2.3930100291016,54.5738810296171,244,53.75,-7.25364552,26.59,3
391,0,0,0.136732471543269,1.05916700154075,2.20893233455532,35.3593138546295,244,20.0199999999995,-8.28548436,13.81,4
392,0,0,0.150956272508988,1.0630723607054,2.20893233455532,49.5132963848913,244,20.5,-8.28548436,13.81,4
400,1,4,1.1365980101082,1.52554983746692,3.43611696486384,14.9706493543895,242,37.0,-3.96104709,7.15,4
401,1,3,0.69243040941381,1.30216559969372,1.74873809818963,6.87989506744953,242,39.0,-3.96104709,7.15,4
402,0,0,0.703487113566968,1.10562697261319,2.76116541819415,4.85960863990623,242,31.0,-3.96104709,7.15,4
406,0,0,0.34821885628934,1.0772986521524,2.6384469551633,14.0573128919976,253,86.1699999999983,-2.76539356,11.3,1
407,0,0,0.309528905698442,1.10059357248925,2.73048580243644,4.07601033342621,253,43.630000000001,-2.76539356,11.3,1
698,1,3,0.845676345388621,1.7505837738866,2.91456349698272,17.4467364863835,239,13.1496299999999,-1.239999915,7.068,0
707,1,4,0.556120579853302,1.01333495219472,1.34990309333936,6.90486255119895,245,28.6321029999999,-9.50571654,21.0,6
719,1,4,1.12431063344203,1.62805655747285,1.62601963515878,16.4335032224978,242,31.4571929999984,-3.96104709,7.15,4
736,1,4,1.07218511042645,1.52014823041137,1.04310693576224,16.31058832142,246,27.7436630000002,-7.77522712,14.15,8
737,0,0,0.489735331874739,1.07113764956377,2.6384469551633,13.7231610163493,253,84.8867199999986,-2.76539356,11.3,1
748,1,3,0.891658023360346,1.44631075387366,1.62601963515878,8.69657108658158,247,25.7091549999968,-4.11736234,19.79,3
777,0,0,0.853126761079381,1.06394854076107,2.51572849213245,18.1592308664996,256,48.754488999999,-10.09332153,30.0,7
787,1,4,1.05778140109725,1.50621586515197,1.59534001940107,9.27323284757854,247,27.9752589999989,-4.11736234,19.79,3
821,0,0,0.783747827709164,0.977335977271888,2.36233041334389,53.3044272545606,244,31.0942370000012,-7.25364552,26.59,3
841,1,3,0.845132070339489,1.15326256690064,3.12932080728671,15.7000529645868,215,32.2337880000014,-5.13777457,16.74,0
842,1,3,0.865178180996933,1.32486356127408,3.06796157577128,13.8924259751768,243,30.3442070000019,-2.66680196,3.291,5
861,0,0,0.327516984276281,1.20985264185057,2.33165079758617,10.6026816090826,239,13.8571679999986,-1.239999915,7.068,0
902,0,0,0.706109354534886,1.11899127500092,2.94524311274043,2.45515332394589,243,23.6663110000009,-2.66680196,3.291,5
906,0,0,0.650335457280843,0.980171017155072,2.6384469551633,10.6493606480798,253,90.8540249999933,-11.85139954,36.57,7
906,0,0,0.685519250487303,0.960168997216262,2.6384469551633,10.0859348655431,253,82.3693169999897,-11.85139954,36.57,7
906,0,0,0.516420026447058,0.947206598907291,2.66912657092102,10.8898196495644,253,76.1359669999947,-11.85139954,36.57,7
906,0,0,0.512289946695809,0.955023128453156,2.6384469551633,11.4182446180092,253,78.7239709999994,-11.85139954,36.57,7
906,0,0,0.506487101524818,1.001132341509,2.6384469551633,10.1178733909682,253,95.7939340000012,-11.85139954,36.57,7
916,0,0,0.158823777443369,1.05177806659397,2.30097118182846,18.6207262607769,242,19.996255,-8.93926069,21.5,7
934,1,3,0.603037762344102,1.05383127876804,1.59534001940107,5.24843259040239,253,41.3488959999995,-2.76539356,11.3,1
944,1,3,0.657903036171887,1.01829328470597,1.65669925091649,4.34088509748661,253,32.8575439999986,-2.76539356,11.3,1
957,0,0,0.874014697511419,1.02758743351574,2.48504887637474,18.1619642389414,256,23.2146439999997,-10.09332153,30.0,7
971,1,3,0.934169273767068,1.85932930564373,2.6384469551633,21.4951186986675,240,16.8069990000004,-7.080389145,16.2,3
982,1,4,0.661856496415535,1.23462936269708,1.07378655151995,8.45115105469284,256,28.8280980000018,-10.09332153,30.0,7
1020,1,3,0.677565017045384,1.02129602355514,2.11689348728218,1.62982689214745,303,45.0700760000036,-1.92352226,7.12,0
1065,1,3,0.359277349240113,1.20680806561108,1.50330117212793,6.69414787006606,238,18.3280709999999,-3.68065482,13.6,1
1114,1,4,0.692967601333116,1.25014899623619,1.04310693576224,8.89776424720543,256,36.4900479999997,-10.09332153,30.0,7
1116,1,4,1.20762015101655,1.49235400161116,1.04310693576224,15.9406016856605,246,24.1864599999999,-7.77522712,14.15,8
1145,1,3,0.646303351940892,1.05076858564669,3.62019465941011,3.68919807890825,298,54.0050459999984,-4.927546185,6.2,9
1154,1,3,0.895940545660317,1.28200289479516,2.60776733940559,16.1658342168621,244,28.6220159999975,-7.25364552,26.59,3
1161,0,0,0.723789803942066,1.06860848252041,2.3930100291016,39.1035154761251,245,51.7412569999979,-10.84610777,37.48,6
1176,1,4,0.948266987765124,1.39392265969729,3.06796157577128,9.59147868398627,252,26.9149849999994,-8.545958555,21.0,8
1262,1,3,1.17750684459014,1.53969586402297,1.59534001940107,14.1738588369907,245,22.0691409999999,-9.50571654,21.0,6
1263,1,3,1.23773088865019,1.6607026041365,2.6384469551633,13.6186284803048,245,16.2191499999999,-9.02056525,12.91,5
1266,1,3,0.566499293555413,1.07109134651751,1.59534001940107,5.14710222935161,253,39.8627359999991,-2.76539356,11.3,1
1268,0,0,0.134670712465243,1.07580897059157,2.20893233455532,29.028885560125,245,20.9918580000003,-9.50571654,21.0,6
1288,0,0,0.698885649438611,1.05711367201287,1.50330117212793,2.44233268754531,243,28.2120280000017,-2.66680196,3.291,5
1292,1,4,0.843125170093317,1.40931736126217,1.38058270909708,8.86583478889184,247,35.6944750000002,-4.11736234,19.79,3
1302,1,4,0.72579070541285,1.28383657249627,3.3440781175907,14.4571805378569,245,37.6887129999996,-10.84610777,37.48,6
1318,1,3,0.93615656653938,1.41249040032891,1.59534001940107,11.4853789393511,238,18.9819129999996,-3.68065482,13.6,1
1320,1,3,0.590472380208398,0.94930666212388,3.28271888607527,6.86642624312726,280,67.691353000002,-1.47410408,7.66,0
1320,1,3,0.577402250755303,0.941773002084181,3.28271888607527,6.12540727132826,280,65.2860490000021,-1.47410408,7.66,0
1320,1,3,0.797584084464671,0.937935721070914,3.25203927031756,6.80127774860233,280,72.8604350000023,-1.47410408,7.66,0
1320,1,3,0.602747859640856,0.950256405708978,3.25203927031756,7.83784277408704,280,66.879160000004,-1.47410408,7.66,0
1320,1,3,0.73471455008645,0.933406541589484,3.25203927031756,6.06419363653546,280,65.0307240000038,-1.47410408,7.66,0
1335,0,0,0.252835623661635,1.07113104726248,2.23961195031304,29.1101390900639,238,25.9634640000004,-3.68065482,13.6,1
1348,1,4,0.795504907124338,1.24303715453863,1.07378655151995,7.81264953465776,256,36.189878000001,-10.09332153,30.0,7
1356,1,3,0.506700026189002,0.988302389533657,3.3440781175907,8.17834285381952,279,55.9970620000022,-4.629217697,10.15,5
1356,1,3,0.674066042198072,0.982415384853818,3.31339850183298,8.33151182611907,279,53.7365090000021,-4.629217697,10.15,5
1356,1,3,0.570608162069161,0.98926323327619,3.31339850183298,7.99852569017692,279,56.9902969999966,-4.629217697,10.15,5
1368,1,4,0.60612182109342,1.07592260555159,3.49747619637926,5.45999494415982,288,52.7710330000045,-4.77656965,5.46,22
1381,0,0,0.300273260816367,1.05063732626687,2.91456349698272,13.2647393520313,252,21.6592930000006,-8.545958555,21.0,8
1391,0,0,0.149157381804166,1.05591686590128,2.20893233455532,35.7773507630676,244,20.5542940000005,-8.28548436,13.81,4
1399,0,0,0.738617063089037,1.11305499254155,2.66912657092102,7.58519365138373,247,24.7653939999982,-4.11736234,19.79,3
1420,1,4,0.96643094113578,1.28704044126787,3.19068003880213,23.6397387709266,246,28.6750780000002,-9.19463357,38.59,4
1431,0,0,0.848571802341647,0.989832828851258,2.42368964485931,33.6006127134414,215,29.6498439999996,-5.13777457,16.74,0
1461,0,0,0.599347940780615,0.897046355510099,2.51572849213245,23.6781761151345,257,81.8111449999997,-12.95880062,52.31,6
1461,0,0,0.549425265067563,0.958995383074077,2.51572849213245,22.6495225264203,257,92.0807179999975,-12.95880062,52.31,6
1461,0,0,0.494756926179764,0.85213831820671,2.51572849213245,23.6576277085465,257,80.9956620000012,-12.95880062,52.31,6
1461,0,0,0.551265925599521,0.855605719640046,2.51572849213245,23.1204201075687,257,76.1223080000054,-12.95880062,52.31,6
1461,0,0,0.609934160800155,0.97881242343651,2.51572849213245,23.9106145926486,257,99.5914789999952,-12.95880062,52.31,6
1461,0,0,0.687799173523803,0.926570899254645,2.48504887637474,22.5818080572667,257,87.8804070000042,-12.95880062,52.31,6
1461,0,0,0.48407972152421,1.00562372967238,2.54640810789016,23.4600879837258,257,108.852606,-12.95880062,52.31,6
1461,0,0,0.662452735534663,0.931401347141906,2.51572849213245,23.6410812666073,257,88.4196500000107,-12.95880062,52.31,6
1461,0,0,0.441790953499744,0.977343135997391,2.54640810789016,24.9637844204749,257,98.3938070000004,-12.95880062,52.31,6
1461,0,0,0.536848877305146,0.799998736814716,2.51572849213245,23.9464693985537,257,70.3702340000018,-12.95880062,52.31,6
1468,1,4,0.512655615226847,1.2633955833891,1.34990309333936,4.8052649976539,242,32.833157,-8.93926069,21.5,7
1478,1,4,0.59483344656651,1.25605889534306,1.04310693576224,10.7807866721895,256,28.1242280000006,-10.09332153,30.0,7
1485,0,0,0.187349329448427,1.00750982961081,2.17825271879761,39.3529632028689,240,25.9792579999994,-7.080389145,16.2,3
1491,1,3,0.423977772340532,1.37010500242006,1.53398078788564,11.0885713577482,246,31.0931310000005,-7.77522712,14.15,8
1509,0,0,0.822329671589629,1.13532721086408,2.36233041334389,54.048287757561,244,53.9269889999996,-7.25364552,26.59,3
1539,1,3,1.10183640919762,1.44265171686285,2.69980618667873,11.0203247477495,245,18.866978,-9.02056525,12.91,5
1547,1,4,0.701223944767013,0.969108830734875,1.68737886667421,3.11000856199214,253,80.6402550000057,-11.85139954,36.57,7
1547,1,4,0.446825355349816,0.980046160176072,1.31922347758165,3.78343297915318,253,74.0460820000008,-11.85139954,36.57,7
1547,1,4,0.558364246043315,0.979403579665605,3.68155389092554,2.9819718744464,253,80.5200719999993,-11.85139954,36.57,7
1547,1,4,0.653181821277455,0.949705513765762,1.28854386182394,2.92010077837891,253,73.9094359999872,-11.85139954,36.57,7
1547,1,4,0.502212904312452,0.964012082578792,1.28854386182394,3.42026632969741,253,76.2522219999955,-11.85139954,36.57,7
1547,1,4,0.682532915883637,0.971269436077665,1.68737886667421,2.99801713801316,253,82.2265310000075,-11.85139954,36.57,7
1547,1,4,0.737306457992835,0.945096008300162,1.28854386182394,3.4390219338504,253,67.7187629999971,-11.85139954,36.57,7
1547,1,4,0.54487031503258,0.971799608391104,1.28854386182394,4.09447913202722,253,78.6013220000023,-11.85139954,36.57,7
1551,1,3,1.22176332229719,1.36866488941035,1.16582539879309,11.0019055735056,246,52.2046200000004,-7.77522712,14.15,8
1563,1,3,0.796998725479219,1.25682920771818,2.60776733940559,15.8313575377083,244,32.5711740000006,-7.25364552,26.59,3
1583,0,0,0.203010563890465,1.0614139677661,2.36233041334389,7.64360637812844,245,19.1229620000004,-9.02056525,12.91,5
1589,1,3,0.370217489570331,1.17624481788647,2.66912657092102,23.2964396543755,256,27.7753100000009,-10.09332153,30.0,7
1592,1,3,0.924458653034125,1.49399718480253,1.59534001940107,12.2734150900947,238,17.0270490000003,-3.68065482,13.6,1
1620,0,0,0.811262439210581,1.14365056212512,2.76116541819415,5.16440586401696,242,27.3482120000008,-3.96104709,7.15,4
1622,1,4,0.555421165421339,1.10361184608959,3.22135965455985,7.25991408536147,245,42.518806,-10.84610777,37.48,6
1636,0,0,0.262480320166803,1.07497471022999,2.23961195031304,29.0761053881353,238,48.1625640000002,-3.68065482,13.6,1
1637,1,3,0.977314376192746,1.22938910507874,2.6384469551633,23.6744130565159,256,26.9358520000023,-10.09332153,30.0,7
1659,1,3,0.978520392051249,1.72351262760192,2.6384469551633,18.303599195651,240,17.4403080000002,-7.080389145,16.2,3
1675,1,3,0.918675073543566,1.80582033660743,2.60776733940559,32.4252518034506,240,16.8457660000004,-5.54632457,17.48,2
1682,1,3,0.645119800189854,1.70984940957461,2.88388388122501,17.5192120870527,239,13.3170380000011,-1.239999915,7.068,0
1703,1,3,1.01293577604878,1.77132842155013,2.60776733940559,31.3999284968659,240,16.8632809999999,-5.54632457,17.48,2
1704,0,0,0.333008592023047,1.04261759049878,2.54640810789016,15.637468287736,246,20.1765990000003,-7.77522712,14.15,8
1741,0,0,0.757827101997181,1.07574437696333,2.85320426546729,13.0750319956431,252,38.8308809999981,-8.545958555,21.0,8
1744,1,4,0.371643446195907,0.984276548597983,1.56466040364335,7.54218040344398,257,89.2540489999956,-12.95880062,52.31,6
1744,1,4,0.418454033646416,0.962849060635397,1.50330117212793,7.07161906837788,257,84.2891640000016,-12.95880062,52.31,6
1744,1,4,0.546664545363881,0.949134848242994,2.27029156607075,6.98840360990268,257,85.1943420000025,-12.95880062,52.31,6
1744,1,4,0.658332458673375,0.940312619630238,2.23961195031304,6.21589943574357,257,85.1795379999967,-12.95880062,52.31,6
1744,1,4,0.689698328285918,0.951924765255724,1.47262155637022,6.71463745581801,257,89.4627939999918,-12.95880062,52.31,6
1744,1,4,0.467208597870972,0.932506677326672,1.50330117212793,7.03471579492647,257,80.4626569999964,-12.95880062,52.31,6
1744,1,4,0.791568817252652,0.937109088185961,2.23961195031304,6.07532026864446,257,86.2031669999997,-12.95880062,52.31,6
1744,1,4,0.673556262811252,0.956059276176119,2.23961195031304,6.45761286739362,257,90.0024149999954,-12.95880062,52.31,6
1744,1,4,0.533285976995301,0.957828465129862,1.56466040364335,6.02853848897654,257,86.9307510000072,-12.95880062,52.31,6
1744,1,4,0.789393058029566,0.94803228546375,2.20893233455532,5.99633814027426,257,89.2540489999956,-12.95880062,52.31,6
1747,1,3,0.996111132425002,1.37013916745598,3.22135965455985,5.54986153732919,242,27.6210100000026,-3.96104709,7.15,4
1759,0,0,0.552569460825452,1.0570005122382,2.6384469551633,7.30929441353563,247,34.426277999999,-4.11736234,19.79,3
1778,1,4,1.02556812611227,1.58147458042347,1.38058270909708,10.5261039230582,247,29.9767649999994,-4.11736234,19.79,3
1790,1,3,0.577689006263275,1.01148900243298,3.52815581213697,4.44764035696211,295,57.5184169999993,-4.76235134,7.14,10
1793,1,3,0.3385822760384,1.03038417474771,1.65669925091649,4.65135110095287,253,31.0094549999994,-2.76539356,11.3,1
1797,1,4,0.341277365957499,1.35052962045766,1.04310693576224,13.5195960945436,245,21.9178190000002,-9.02056525,12.91,5
1810,1,3,0.531843824988377,1.43487887167024,1.62601963515878,11.090091997673,242,23.2760039999994,-8.93926069,21.5,7
1875,1,4,0.378829073755863,1.14204019283876,1.56466040364335,6.64777305354064,242,27.9562669999996,-8.93926069,21.5,7
1906,1,3,0.725371620311763,1.00374236948267,3.3440781175907,8.27431217974746,287,62.3134129999962,-1.82958684,9.21,7
1906,1,3,0.632862737969055,1.00388257117837,3.3440781175907,7.2412676551388,287,62.2376480000021,-1.82958684,9.21,7
1928,1,3,0.554195255947747,0.968896313998685,3.28271888607527,7.80509496273471,283,63.1248330000017,-4.563633745,19.9,2
1928,1,3,0.492817523181162,0.969213176118454,3.31339850183298,7.50954572794657,283,64.499738999999,-4.563633745,19.9,2
1928,1,3,0.674994981950012,0.969470553308337,3.25203927031756,7.36448103725401,283,64.0947339999984,-4.563633745,19.9,2
1928,1,3,0.356258972039052,0.933605302510363,3.31339850183298,7.94011444135897,283,55.9981960000005,-4.563633745,19.9,2
1995,1,3,0.883788413442769,1.26322434258235,1.77941771394734,5.52610691835609,242,35.8429619999988,-3.96104709,7.15,4
1998,0,0,0.718420145147095,1.07441775596155,2.69980618667873,4.12461488761209,242,34.4969579999997,-3.96104709,7.15,4
2006,1,4,0.796145234632419,1.26401954478311,3.3440781175907,14.5581326781807,245,31.6356799999994,-10.84610777,37.48,6
2025,1,4,1.00193632595253,1.47208587335493,1.04310693576224,18.0088560521531,247,35.5728180000006,-4.11736234,19.79,3
2036,1,4,0.806598937555551,1.46981781283891,1.65669925091649,18.158105778844,242,37.0515070000001,-3.96104709,7.15,4
2055,1,4,0.816026264278696,1.41846741882527,3.06796157577128,9.98037008132488,252,26.0401329999986,-8.545958555,21.0,8
2060,0,0,0.795458532791452,1.01305505191261,2.36233041334389,39.1886598316576,245,23.8369159999966,-10.84610777,37.48,6
2070,0,0,0.321853436464159,1.0848044843728,2.66912657092102,14.1234282838283,253,51.0951800000003,-2.76539356,11.3,1
2077,1,3,0.817226604282361,1.22381275486181,2.57708772364788,9.63898568746781,256,29.3491919999979,-10.09332153,30.0,7
2086,1,3,0.930839479753825,1.17219457709631,3.12932080728671,16.4393149823679,215,29.086124999998,-5.13777457,16.74,0
2092,1,3,0.699939560912835,1.19649224786818,2.57708772364788,9.57873215354354,256,29.6462829999982,-10.09332153,30.0,7
2094,1,3,0.470101282295579,1.18594615454114,1.47262155637022,6.74810660547673,238,18.6913779999995,-3.68065482,13.6,1
2109,0,0,0.44065817346967,1.19805456732484,2.30097118182846,10.8384835158442,239,14.2516300000007,-1.239999915,7.068,0
2114,1,4,1.18053819681577,1.4776983514805,1.04310693576224,15.5871092204489,246,19.6666519999999,-7.77522712,14.15,8
2139,1,4,0.592939224527234,1.24102636334935,3.22135965455985,23.057324087908,246,31.1436759999997,-9.19463357,38.59,4
2155,1,4,0.753190028312821,1.10000727614319,3.19068003880213,6.79219991387746,245,42.0272130000012,-10.84610777,37.48,6
2169,0,0,0.410978440152663,1.10196613623846,2.48504887637474,33.7404097321026,215,54.0238680000002,-5.13777457,16.74,0
2179,0,0,0.143768252656512,1.0083357083934,2.20893233455532,39.6443967268618,240,25.2629800000004,-7.080389145,16.2,3
2195,1,4,0.640613112425316,0.959508821909456,1.28854386182394,3.68770682645619,257,86.5002249999961,-12.95880062,52.31,6
2195,1,4,0.520815552038129,0.911966164423318,1.34990309333936,6.3637057863566,257,83.6611810000031,-12.95880062,52.31,6
2195,1,4,0.778827028099608,0.934014321125627,1.28854386182394,4.97577286444828,257,82.9661469999992,-12.95880062,52.31,6
2195,1,4,0.700794805918902,0.93850528667509,1.25786424606623,5.72985661872654,257,82.5070280000073,-12.95880062,52.31,6
2195,1,4,0.656791605652416,0.974046555551069,1.31922347758165,5.29021800925992,257,90.8494369999971,-12.95880062,52.31,6
2195,1,4,0.494985487406233,0.968936926943428,1.34990309333936,6.0992459370944,257,89.9167829999933,-12.95880062,52.31,6
2195,1,4,0.381486261536616,1.01109937836114,1.34990309333936,7.19954636967375,257,98.7726129999937,-12.95880062,52.31,6
2195,1,4,0.450811927127834,0.963392982648629,1.04310693576224,6.57827632668799,257,88.4759790000098,-12.95880062,52.31,6
2195,1,4,0.564551752209399,0.916980195756782,1.38058270909708,6.18962683308838,257,83.8981840000051,-12.95880062,52.31,6
2195,1,4,0.8226772722131,0.955029984996585,1.28854386182394,3.24584063013414,257,88.4451289999997,-12.95880062,52.31,6
2204,1,3,0.896698340256702,1.43842118857664,3.09864119152899,14.0190606673372,243,26.5881929999996,-2.66680196,3.291,5
2215,1,3,0.948379525507113,1.5009353868897,2.69980618667873,9.41709026650138,244,17.3360160000002,-8.28548436,13.81,4
2223,1,3,0.648311824613001,1.33076090319809,1.04310693576224,13.4770642587168,247,34.384697999998,-4.11736234,19.79,3
1,1,3,1.22219172187706,2.22757747227073,1.38058270909708,16.4825868723792,188,14.3929999999982,-4.650889115,24.44,3
2,1,3,1.3074553724898,2.22662137442338,1.38058270909708,16.217415135986,188,14.3929999999982,-4.650889115,24.44,3
3,1,3,1.38949608798048,2.22898181922032,1.38058270909708,16.4434340703174,188,14.0869999999995,-4.650889115,24.44,3
5,1,3,1.30935816491957,1.87288621888629,1.38058270909708,14.8159619622808,188,14.3949999999986,-4.650889115,24.44,3
6,1,3,1.34086788543747,1.87199154471851,1.38058270909708,14.7524956047243,188,15.0079999999998,-4.650889115,24.44,3
7,1,4,1.65594635613222,2.47498934428696,1.04310693576224,28.8270408921984,188,15.018,-4.650889115,24.44,3
8,1,4,1.66098057716873,2.48222416304169,1.04310693576224,28.8396295012946,188,15.018,-4.650889115,24.44,3
9,1,4,1.72357600540026,2.48547984015932,1.04310693576224,28.257866017108,188,15.628999999999,-4.650889115,24.44,3
10,1,4,1.71829122275001,2.48759586703409,1.04310693576224,27.8074900665838,188,14.7109999999993,-4.650889115,24.44,3
11,1,4,1.77567253635314,2.49997723201824,1.04310693576224,27.250740435331,188,14.7109999999993,-4.650889115,24.44,3
12,1,4,1.75847522086533,2.49879811967303,1.04310693576224,27.5256039929863,188,14.7109999999993,-4.650889115,24.44,3
13,1,3,1.20311146537134,1.49120013824847,1.56466040364335,14.6734105249285,245,20.7970000000005,-9.50571654,21.0,6
14,1,3,1.2041340906168,1.49089130331448,1.59534001940107,14.7792607933445,245,20.7970000000005,-9.50571654,21.0,6
15,1,3,1.20458442296947,1.49276271415319,1.59534001940107,14.9572787802131,245,20.7970000000005,-9.50571654,21.0,6
16,1,3,0.478771007109984,1.37287363432021,2.57708772364788,17.9215461761617,245,43.3109999999997,-9.50571654,21.0,6
17,1,3,1.18199333778883,1.53613777878079,1.56466040364335,13.869035810223,245,21.777,-9.50571654,21.0,6
18,1,3,1.26802870013915,1.53640112713641,1.56466040364335,14.6173702530373,245,21.777,-9.50571654,21.0,6
19,1,3,1.17403086032382,1.53619423576021,1.56466040364335,14.4170229941613,245,21.777,-9.50571654,21.0,6
20,1,4,1.13584896873391,1.43814449930824,1.28854386182394,17.4326884265848,245,42.8510000000006,-9.50571654,21.0,6
21,1,4,1.13858103261891,1.44040166893431,1.25786424606623,14.433352676182,245,42.8510000000006,-9.50571654,21.0,6
22,1,4,1.14541370519886,1.44749827928561,1.28854386182394,15.8232849289919,245,42.8510000000006,-9.50571654,21.0,6
23,1,4,1.12690264473317,1.4478526581231,1.28854386182394,15.7129997136137,245,42.3310000000001,-9.50571654,21.0,6
24,1,4,1.13047228583346,1.4456850770821,1.28854386182394,13.5719297932609,245,42.3310000000001,-9.50571654,21.0,6
25,1,4,1.14407814638265,1.44441778935066,1.28854386182394,12.5092584798204,245,42.3310000000001,-9.50571654,21.0,6
26,1,3,0.76442766199361,1.10101623422663,3.03728196001357,47.4744513438113,249,68.0260000000017,-0.812174225,6.21,0
27,1,3,0.667304540770575,1.10624307429205,3.03728196001357,50.5146973501707,249,67.0780000000013,-0.812174225,6.21,0
28,1,3,0.634992836934971,1.10799339252263,3.06796157577128,51.0831844710275,249,67.0780000000013,-0.812174225,6.21,0
29,1,3,0.182671921607992,1.31931590477319,1.47262155637022,14.1513203088891,238,14.3760000000002,-3.68065482,13.6,1
30,1,3,1.06291941886263,1.64130369751706,2.60776733940559,31.9054176871881,240,15.5020000000004,-5.54632457,17.48,2
31,1,3,1.06853640866704,1.64129324966564,2.60776733940559,32.0686489986268,240,15.5010000000002,-5.54632457,17.48,2
32,1,3,1.02438820275592,2.09491403406429,1.38058270909708,21.1641920868251,188,15.1579999999995,-4.650889115,24.44,3
33,1,3,1.07462412060139,2.09295258085231,1.38058270909708,20.8695655521852,188,14.3979999999992,-4.650889115,24.44,3
34,1,3,1.12873422654228,2.10124805650789,1.38058270909708,20.3481505562489,188,14.3979999999992,-4.650889115,24.44,3
35,1,4,1.53362306427092,2.31108409965875,1.04310693576224,32.1653160991789,188,14.393,-4.650889115,24.44,3
36,1,4,1.57830532759003,2.31103354048891,1.04310693576224,31.7200160992757,188,14.393,-4.650889115,24.44,3
37,1,4,1.62003404335258,2.31158845011275,1.04310693576224,31.2541138199089,188,14.393,-4.650889115,24.44,3
38,1,3,0.463150190649778,1.30401275478745,1.65669925091649,22.7446739832004,245,22.7240000000002,-9.50571654,21.0,6
39,1,3,0.471592378591788,1.38285693923562,1.65669925091649,22.7368774882732,245,25.9549999999999,-9.50571654,21.0,6
40,1,3,0.481074993081625,1.30540514361615,1.65669925091649,22.7655951455326,245,21.9700000000002,-9.50571654,21.0,6
41,1,3,0.806939708124326,1.51003216162382,1.04310693576224,24.5136344252903,244,19.6298000000006,-8.28548436,13.81,4
42,1,3,0.969783661345795,1.48944987571596,1.04310693576224,11.5616925035936,244,17.0465999999997,-8.28548436,13.81,4
43,0,0,0.123720903629169,1.07250205038542,2.23961195031304,37.3377861759355,244,20.4376999999995,-8.28548436,13.81,4
44,1,3,0.38745120505384,1.22624890322628,2.1475731030399,1.31199554745537,245,18.6639999999998,-9.02056525,12.91,5
45,1,3,0.991685109164424,1.37716072778028,2.33165079758617,1.24850913531962,245,16.0,-9.02056525,12.91,5
46,1,3,0.993218003846167,1.38343161293369,2.33165079758617,1.24937124954744,245,15.9980000000005,-9.02056525,12.91,5
47,1,4,0.451774228183324,1.19645131588541,1.84077694546277,1.19208600810381,245,19.6790000000001,-9.02056525,12.91,5
48,1,4,0.49978019893075,1.2206096317981,1.81009732970506,1.25672702580869,245,19.3270000000002,-9.02056525,12.91,5
49,1,4,0.495286434151014,1.21456396626739,1.81009732970506,1.20738106708889,245,19.3270000000002,-9.02056525,12.91,5
50,1,3,0.487335171554667,1.30387355377642,2.73048580243644,1.89089791915828,245,15.6719999999996,-9.02056525,12.91,5
51,1,3,0.414250266016894,1.30389568709637,2.76116541819415,1.96348518872371,245,15.6700000000001,-9.02056525,12.91,5
52,1,3,0.416991989494921,1.32612768010984,2.76116541819415,1.9889169284283,245,15.6719999999996,-9.02056525,12.91,5
53,0,0,0.131444127703458,1.10468602285043,2.20893233455532,40.2417263278648,240,167.393,-7.080389145,16.2,3
54,0,0,0.297222115383637,1.0745466887554,2.23961195031304,28.4267158706748,238,49.3590000000004,-3.68065482,13.6,1
55,0,0,0.155386344489173,1.06019827100036,2.23961195031304,32.8512452987004,244,20.6999999999998,-8.28548436,13.81,4
56,0,0,0.292472552979561,1.07026190992298,2.23961195031304,30.7470512966094,238,48.2140613329993,-3.68065482,13.6,1
57,0,0,0.144827760090849,1.04529078303113,2.23961195031304,37.5619345676003,244,42.9259339999999,-8.28548436,13.81,4
58,0,0,0.219018951711404,1.04990964815275,2.23961195031304,17.5262521867654,242,20.1600240000007,-8.93926069,21.5,7
59,0,0,0.270746861093569,1.06725558667242,2.23961195031304,30.2106635104875,238,48.8089999999993,-3.68065482,13.6,1
60,0,0,0.141586384992306,1.05888050326441,2.23961195031304,34.0438415064136,244,20.0,-8.28548436,13.81,4
61,0,0,0.175305099777665,1.08222331176238,2.20893233455532,44.4508523175608,240,50.8089999999993,-5.54632457,17.48,2
62,0,0,0.172881380060942,1.08219114566486,2.20893233455532,44.5039425996974,240,50.8089999999993,-5.54632457,17.48,2
63,0,0,0.279517447682464,1.09125333433711,2.3930100291016,42.8476974372747,245,49.9318170000006,-10.84610777,37.48,6
64,1,3,1.13509621075069,1.3311397638045,3.3440781175907,12.8634253757108,284,19.996000000001,-1.6828136,7.43,0
65,1,3,1.13663381975659,1.33317468658499,3.3440781175907,13.5914389421863,284,19.996000000001,-1.6828136,7.43,0
66,1,3,1.12553750573618,1.33558926997515,3.31339850183298,12.5815312037711,284,21.3780000000006,-1.6828136,7.43,0
67,1,3,0.905090488010526,1.29869028254673,2.08621387152447,5.37334331730731,284,19.9940000000006,-1.6828136,7.43,0
68,1,3,0.900599178577481,1.298910486791,2.08621387152447,5.52592228302095,284,19.9940000000006,-1.6828136,7.43,0
69,1,3,0.895394793612895,1.29912539258979,2.08621387152447,5.53169863131758,284,19.9940000000006,-1.6828136,7.43,0
70,1,3,0.926664104292933,1.3817740005018,1.04310693576224,17.3852017778592,242,21.0020000000004,-8.93926069,21.5,7
71,1,4,0.487894132310117,1.12524081310278,1.34990309333936,13.5949909677563,242,27.2490000000007,-8.93926069,21.5,7
72,1,4,0.286166632160844,1.14507909354968,1.62601963515878,15.0858409450126,242,24.2709999999997,-8.93926069,21.5,7
73,1,3,0.455496117345157,1.12652891573724,1.34990309333936,8.69849317021042,242,19.5030000000006,-8.93926069,21.5,7
74,0,0,0.179060463833077,1.04572224927457,2.30097118182846,18.7259139726366,242,19.5039999999999,-8.93926069,21.5,7
75,0,0,0.388742500429314,1.21670820316686,2.30097118182846,15.5819843914115,239,13.8885570000002,-1.239999915,7.068,0
76,1,3,0.878854754515668,2.11773894877576,1.04310693576224,27.9933406878992,239,8.29917000000023,-1.239999915,7.068,0
"""

Train_006 = """
Data_Number,Oxide,Valence,Peak_E0_μt,Peak_Max_μt,Max_y_xposition,Max_y,vdw_radius_alvarez,Peak_Width,gs_energy,fusion_enthalpy,num_unfilled
218,0,0,0.781122182906341,1.08879214659341,2.45436926061703,32.8847129302847,215,54.0236550000009,-5.13777457,16.74,0
220,0,0,0.72931222262096,1.1058360388172,2.20893233455532,2.68447325475762,215,46.6150130000024,-5.13777457,16.74,0
225,0,0,0.168401241097614,1.09791502601094,2.45436926061703,1.19482979972818,240,50.7699999999986,-5.54632457,17.48,2
226,0,0,0.645385065560281,1.06444309085501,3.5895150436524,0.721218909965802,245,46.0599999999977,-10.84610777,37.48,6
229,1,2,1.09419276701734,1.65417335994617,2.6384469551633,18.3902461612642,240,17.6199999999999,-7.080389145,16.2,3
231,1,1,0.46391791768529,1.22366308809691,1.77941771394734,1.66942289386451,238,17.0600000000013,-3.68065482,13.6,1
233,1,2,0.834094778397302,1.29023204216136,1.62601963515878,9.84092974757643,238,9.20000000000073,-3.68065482,13.6,1
236,0,0,0.443473096642326,1.18728513414794,2.23961195031304,12.3531020629595,239,14.0400000000009,-1.239999915,7.068,0
248,1,2,1.06156631078093,1.81830448774281,2.51572849213245,2.68531032720866,240,15.2299999999996,-5.54632457,17.48,2
249,1,4,1.4106888957371,1.77534323554673,1.74873809818963,1.7939939355346,245,21.1900000000005,-9.02056525,12.91,5
250,1,3,1.03762453261065,1.59703081301958,2.33165079758617,1.53931209726335,245,19.21,-9.02056525,12.91,5
252,1,2,0.46552595007524,1.46457105674337,2.69980618667873,2.84791832513053,245,15.7699999999995,-9.02056525,12.91,5
253,1,3,1.36523934423524,1.66139687820329,1.93281579273591,3.1451682477916,245,21.2400000000007,-9.50571654,21,6
257,1,4,1.01961426974098,1.40368441970859,1.74873809818963,1.0600973643731,246,18.8199999999997,-7.77522712,14.15,8
258,1,3,1.04313142638316,1.77342851265877,1.96349540849362,1.41474486787293,244,20.2200000000002,-8.28548436,13.81,4
260,0,0,0.227228506119833,1.01229100684117,2.20893233455532,39.3653297373309,240,25.5299999999997,-7.080389145,16.2,3
261,0,0,0.186690715683001,1.05611005795333,2.33165079758617,7.68239898343462,245,19.1799999999994,-9.02056525,12.91,5
262,0,0,0.169525621227213,1.0770218630426,2.20893233455532,43.5827781521375,240,51.2600000000002,-5.54632457,17.48,2
263,0,0,0.846174018453792,1.03780082722173,2.48504887637474,21.8945968255728,256,17.4399999999987,-10.09332153,30,7
264,1,5,0.642001785869911,1.24187247661183,1.07378655151995,7.56621498961586,256,36.6599999999999,-10.09332153,30,7
265,0,0,0.24605530712024,1.06457387602587,2.54640810789016,16.5844713225845,246,19.0299999999997,-7.77522712,14.15,8
274,0,0,0.155443731502485,1.00715695117645,2.17825271879761,35.7957161007858,240,25.3463016299993,-7.080389145,16.2,3
275,1,4,0.802044872871759,1.06473473309399,3.46679658062155,15.9118052668159,288,62.0300000000061,-4.77656965,5.46,22
276,1,1,0.395434681989438,1.0203386548339,1.68737886667421,4.36814664393095,253,30.6399999999994,-2.76539356,11.3,1
278,1,3,0.469708406479693,1.27638212840903,1.59534001940107,12.5057620153736,246,20.71,-7.77522712,14.15,8
279,1,4,1.02422422683295,1.40541152297423,1.10446616727766,14.4836533490363,246,23.21,-7.77522712,14.15,8
285,1,3,0.888444681641742,1.155940500644,2.45436926061703,14.888219116479,256,27.6892100000005,-10.09332153,30,7
287,1,4,1.12094771533634,1.49343657881994,1.62601963515878,14.576471701197,242,34.2699999999968,-3.96104709,7.15,4
288,1,2,0.845095863056605,1.54094212219881,2.60776733940559,27.8703488073535,240,17.8199999999997,-5.54632457,17.48,2
299,1,4,0.527052430426678,1.27578444283739,1.38058270909708,11.5310979024768,245,51.5300000000007,-9.02056525,12.91,5
302,1,2,0.755005681734066,1.217070709116,1.81009732970506,1.44975985596789,215,28.0900000000001,-5.13777457,16.74,0
304,1,3,0.430179895627972,1.25659664436288,3.00660234425586,0.498228612010668,245,19.6300000000001,-9.02056525,12.91,5
305,0,0,0.177163740640611,1.0917252291574,2.20893233455532,0.930006983072324,245,17.8400000000001,-9.02056525,12.91,5
306,1,2,0.448085530082365,1.38038532781695,2.42368964485931,1.28973882180575,245,15.3699999999999,-9.02056525,12.91,5
308,1,4,0.857335396257223,1.34548046990575,1.4419419406125,6.91145513107343,242,28.0599999999977,-3.96104709,7.15,4
309,0,0,0.658048438571788,1.05306818538536,1.99417502425133,0.252505079535856,242,28.0499999999993,-3.96104709,7.15,4
310,1,3,0.405991758292549,1.22701483333697,1.04310693576224,13.8485309153147,245,21.8599999999997,-9.02056525,12.91,5
314,0,0,0.604354986342388,1.00652824119267,2.97592272849814,1.33799886493162,243,32.7900000000009,-2.66680196,3.291,5
315,0,0,0.739962110031517,1.02760692840661,2.66912657092102,0.768390848219402,243,25.6700000000019,-2.66680196,3.291,5
316,0,0,0.659149815782981,1.00244063317667,3.00660234425586,0.995885777693946,243,35.9900000000016,-2.66680196,3.291,5
317,0,0,0.720662902129129,1.00192446333841,2.94524311274043,1.14147327470166,243,35.9900000000016,-2.66680196,3.291,5
318,0,0,0.701083660528225,1.02647342877347,2.94524311274043,1.66145279966085,243,33.1500000000015,-2.66680196,3.291,5
319,0,0,0.656782715248699,1.05183038529799,5.79844737820772,2586.30558772431,243,25.3100000000013,-2.66680196,3.291,5
320,0,0,0.657030885549467,1.01949362105623,2.94524311274043,2.1753392071182,243,33.1500000000015,-2.66680196,3.291,5
322,0,0,0.728824629024898,1.04288680995554,1.38058270909708,579.480841660334,243,25.6700000000019,-2.66680196,3.291,5
324,0,0,0.717149236141494,1.03736717325971,3.68155389092554,6170.61672515635,243,25.6699999999983,-2.66680196,3.291,5
325,0,0,0.675451339934619,1.01706722624481,2.97592272849814,3.94620708798027,243,34.2200000000012,-2.66680196,3.291,5
326,0,0,0.452855490355052,1.0387658581206,1.53398078788564,2265.087794701,243,24.5900000000001,-2.66680196,3.291,5
327,0,0,0.674437441407751,1.0184414377784,3.22135965455985,6.41223739306688,243,34.2200000000012,-2.66680196,3.291,5
328,1,3,1.04586715658423,1.58570789288916,2.73048580243644,0.466387320684806,244,19.5799999999999,-8.28548436,13.81,4
330,0,0,0.342219198091654,1.10078140865332,2.42368964485931,53.7118371450703,244,55.0200000000004,-7.25364552,26.59,3
331,1,2,0.401655488383587,1.44752722484011,2.79184503395187,12.9132868055401,245,17.4899999999998,-9.02056525,12.91,5
333,1,3,0.988134606324648,1.40573329003804,1.87145656122048,1.43363479514286,244,25.5299999999988,-7.25364552,26.59,3
334,0,0,0.615685133353679,1.08817706560336,2.45436926061703,32.7931616786206,215,55,-5.13777457,16.74,0
335,0,0,0.674479213851147,1.09035024359643,2.45436926061703,44.4683411674565,215,54,-5.13777457,16.74,0
336,0,0,0.681219875194022,1.09416310657143,2.45436926061703,62.7767673919165,215,54,-5.13777457,16.74,0
337,0,0,0.666943194154289,1.09500474491872,2.45436926061703,68.9818019753093,215,55,-5.13777457,16.74,0
338,0,0,0.67438580650959,1.09548492081834,2.45436926061703,72.7919908991312,215,54,-5.13777457,16.74,0
339,0,0,0.670859565040902,1.09610299157176,2.45436926061703,76.3614555958971,215,55,-5.13777457,16.74,0
342,1,3,0.734484730397958,1.48366178809022,2.6384469551633,14.7580602139086,244,20.8800000000001,-8.28548436,13.81,4
347,0,0,0.79029578177219,1.08920545241949,2.36233041334389,40.2897579657267,245,51.2000000000007,-10.84610777,37.48,6
348,0,0,0.758298224785072,1.01070920460047,2.3930100291016,58.0282499403809,245,24,-10.84610777,37.48,6
351,0,0,0.429735967489144,1.10431822219804,2.30097118182846,1.78391454262433,246,49.1699999999983,-9.19463357,38.59,4
352,1,4,0.889032388971215,1.44969105541686,2.6384469551633,3684.14437714684,246,26.4600000000028,-9.19463357,38.59,4
354,1,3,0.988134606324648,1.40573329003804,1.87145656122048,1.43363479514286,244,25.5299999999988,-7.25364552,26.59,3
355,1,4,0.946042149885484,1.17276556098543,2.42368964485931,12.3239493956622,256,26.9078100000006,-10.09332153,30,7
356,1,2,0.977523582927338,1.71795164619023,2.36233041334389,1.24793640657071,240,13.2799999999997,-7.080389145,16.2,3
359,0,0,0.150219219529218,1.06865276857604,1.84077694546277,0.910680451387555,245,21,-9.50571654,21,6
360,1,3,1.04586715658423,1.58570789288916,2.73048580243644,0.466387320684806,244,19.5799999999999,-8.28548436,13.81,4
361,0,0,0.182579766138093,1.08933507522219,2.20893233455532,0.917425300437298,245,18.1700000000001,-9.02056525,12.91,5
362,1,4,0.447052246318421,1.38260047215076,3.16000042304442,0.532240156646912,245,19.9299999999994,-9.02056525,12.91,5
364,1,3,0.507426262212515,1.57612564321781,1.16582539879309,13.6971959200321,245,21.5900000000001,-9.50571654,21,6
367,1,6,0.684863469599881,1.0747109593744,1.59534001940107,8.05345595776403,245,43.2400000000016,-10.84610777,37.48,6
372,1,5,0.779092201709989,1.25178360736124,2.94524311274043,1.12598239348125,256,33.828510000003,-10.09332153,30,7
378,1,5,0.823495948379365,1.24683535609904,1.59534001940107,6.05441621903821,256,37.5275899999979,-10.09332153,30,7
381,1,6,0.702697405108314,1.04153050853038,2.36233041334389,0.661231113932584,245,40.7964432199988,-10.84610777,37.48,6
382,1,2,0.820236833144902,1.10381646398886,3.09864119152899,16.3711480490946,215,32.101980970001,-5.13777457,16.74,0
383,1,2,0.832239899776155,1.1954704249518,1.84077694546277,1.57296284872492,215,23.4758325799994,-5.13777457,16.74,0
384,0,0,0.223826564331089,1.07529336862525,2.27029156607075,72.8179434757969,238,49.0300000000007,-3.68065482,13.6,1
385,0,0,0.161300136622501,1.05990245387623,2.36233041334389,6.56697220964944,245,49,-9.02056525,12.91,5
387,0,0,0.16531483782741,1.06525548378836,2.36233041334389,11.2063003713613,245,18.9899999999998,-9.02056525,12.91,5
388,0,0,0.175538952862473,1.08906093177419,2.20893233455532,80.4866288226944,240,51.4799999999996,-5.54632457,17.48,2
390,0,0,0.683097415228021,1.12269657373751,2.3930100291016,54.5738810296171,244,53.75,-7.25364552,26.59,3
391,0,0,0.136732471543269,1.05916700154075,2.20893233455532,35.3593138546295,244,20.0199999999995,-8.28548436,13.81,4
392,0,0,0.150956272508988,1.0630723607054,2.20893233455532,49.5132963848913,244,20.5,-8.28548436,13.81,4
400,1,4,1.1365980101082,1.52554983746692,3.43611696486384,14.9706493543895,242,37,-3.96104709,7.15,4
401,1,2,0.69243040941381,1.30216559969372,1.74873809818963,6.87989506744953,242,39,-3.96104709,7.15,4
402,0,0,0.703487113566968,1.10562697261319,2.76116541819415,4.85960863990623,242,31,-3.96104709,7.15,4
406,0,0,0.34821885628934,1.0772986521524,2.6384469551633,14.0573128919976,253,86.1699999999983,-2.76539356,11.3,1
407,0,0,0.309528905698442,1.10059357248925,2.73048580243644,4.07601033342621,253,43.630000000001,-2.76539356,11.3,1
698,1,2,0.845676345388621,1.7505837738866,2.91456349698272,17.4467364863835,239,13.1496299999999,-1.239999915,7.068,0
707,1,6,0.556120579853302,1.01333495219472,1.34990309333936,6.90486255119895,245,28.6321029999999,-9.50571654,21,6
719,1,4,1.12431063344203,1.62805655747285,1.62601963515878,16.4335032224978,242,31.4571929999984,-3.96104709,7.15,4
736,1,4,1.07218511042645,1.52014823041137,1.04310693576224,16.31058832142,246,27.7436630000002,-7.77522712,14.15,8
737,0,0,0.489735331874739,1.07113764956377,2.6384469551633,13.7231610163493,253,84.8867199999986,-2.76539356,11.3,1
748,1,3,0.891658023360346,1.44631075387366,1.62601963515878,8.69657108658158,247,25.7091549999968,-4.11736234,19.79,3
777,0,0,0.853126761079381,1.06394854076107,2.51572849213245,18.1592308664996,256,48.754488999999,-10.09332153,30,7
787,1,4,1.05778140109725,1.50621586515197,1.59534001940107,9.27323284757854,247,27.9752589999989,-4.11736234,19.79,3
821,0,0,0.783747827709164,0.977335977271888,2.36233041334389,53.3044272545606,244,31.0942370000012,-7.25364552,26.59,3
841,1,2,0.845132070339489,1.15326256690064,3.12932080728671,15.7000529645868,215,32.2337880000014,-5.13777457,16.74,0
842,1,3,0.865178180996933,1.32486356127408,3.06796157577128,13.8924259751768,243,30.3442070000019,-2.66680196,3.291,5
861,0,0,0.327516984276281,1.20985264185057,2.33165079758617,10.6026816090826,239,13.8571679999986,-1.239999915,7.068,0
902,0,0,0.706109354534886,1.11899127500092,2.94524311274043,2.45515332394589,243,23.6663110000009,-2.66680196,3.291,5
906,0,0,0.650335457280843,0.980171017155072,2.6384469551633,10.6493606480798,253,90.8540249999933,-11.85139954,36.57,7
906,0,0,0.685519250487303,0.960168997216262,2.6384469551633,10.0859348655431,253,82.3693169999897,-11.85139954,36.57,7
906,0,0,0.516420026447058,0.947206598907291,2.66912657092102,10.8898196495644,253,76.1359669999947,-11.85139954,36.57,7
906,0,0,0.512289946695809,0.955023128453156,2.6384469551633,11.4182446180092,253,78.7239709999994,-11.85139954,36.57,7
906,0,0,0.506487101524818,1.001132341509,2.6384469551633,10.1178733909682,253,95.7939340000012,-11.85139954,36.57,7
916,0,0,0.158823777443369,1.05177806659397,2.30097118182846,18.6207262607769,242,19.996255,-8.93926069,21.5,7
934,1,2,0.603037762344102,1.05383127876804,1.59534001940107,5.24843259040239,253,41.3488959999995,-2.76539356,11.3,1
944,1,1,0.657903036171887,1.01829328470597,1.65669925091649,4.34088509748661,253,32.8575439999986,-2.76539356,11.3,1
957,0,0,0.874014697511419,1.02758743351574,2.48504887637474,18.1619642389414,256,23.2146439999997,-10.09332153,30,7
971,1,2,0.934169273767068,1.85932930564373,2.6384469551633,21.4951186986675,240,16.8069990000004,-7.080389145,16.2,3
982,1,4,0.661856496415535,1.23462936269708,1.07378655151995,8.45115105469284,256,28.8280980000018,-10.09332153,30,7
1020,1,2,0.677565017045384,1.02129602355514,2.11689348728218,1.62982689214745,303,45.0700760000036,-1.92352226,7.12,0
1065,1,1,0.359277349240113,1.20680806561108,1.50330117212793,6.69414787006606,238,18.3280709999999,-3.68065482,13.6,1
1114,1,5,0.692967601333116,1.25014899623619,1.04310693576224,8.89776424720543,256,36.4900479999997,-10.09332153,30,7
1116,1,4,1.20762015101655,1.49235400161116,1.04310693576224,15.9406016856605,246,24.1864599999999,-7.77522712,14.15,8
1145,1,3,0.646303351940892,1.05076858564669,3.62019465941011,3.68919807890825,298,54.0050459999984,-4.927546185,6.2,9
1154,1,3,0.895940545660317,1.28200289479516,2.60776733940559,16.1658342168621,244,28.6220159999975,-7.25364552,26.59,3
1161,0,0,0.723789803942066,1.06860848252041,2.3930100291016,39.1035154761251,245,51.7412569999979,-10.84610777,37.48,6
1176,1,4,0.948266987765124,1.39392265969729,3.06796157577128,9.59147868398627,252,26.9149849999994,-8.545958555,21,8
1262,1,3,1.17750684459014,1.53969586402297,1.59534001940107,14.1738588369907,245,22.0691409999999,-9.50571654,21,6
1263,1,2,1.23773088865019,1.6607026041365,2.6384469551633,13.6186284803048,245,16.2191499999999,-9.02056525,12.91,5
1266,1,2,0.566499293555413,1.07109134651751,1.59534001940107,5.14710222935161,253,39.8627359999991,-2.76539356,11.3,1
1268,0,0,0.134670712465243,1.07580897059157,2.20893233455532,29.028885560125,245,20.9918580000003,-9.50571654,21,6
1288,0,0,0.698885649438611,1.05711367201287,1.50330117212793,2.44233268754531,243,28.2120280000017,-2.66680196,3.291,5
1292,1,4,0.843125170093317,1.40931736126217,1.38058270909708,8.86583478889184,247,35.6944750000002,-4.11736234,19.79,3
1302,1,4,0.72579070541285,1.28383657249627,3.3440781175907,14.4571805378569,245,37.6887129999996,-10.84610777,37.48,6
1318,1,2,0.93615656653938,1.41249040032891,1.59534001940107,11.4853789393511,238,18.9819129999996,-3.68065482,13.6,1
1320,1,3,0.590472380208398,0.94930666212388,3.28271888607527,6.86642624312726,280,67.691353000002,-1.47410408,7.66,0
1320,1,3,0.577402250755303,0.941773002084181,3.28271888607527,6.12540727132826,280,65.2860490000021,-1.47410408,7.66,0
1320,1,3,0.797584084464671,0.937935721070914,3.25203927031756,6.80127774860233,280,72.8604350000023,-1.47410408,7.66,0
1320,1,3,0.602747859640856,0.950256405708978,3.25203927031756,7.83784277408704,280,66.879160000004,-1.47410408,7.66,0
1320,1,3,0.73471455008645,0.933406541589484,3.25203927031756,6.06419363653546,280,65.0307240000038,-1.47410408,7.66,0
1335,0,0,0.252835623661635,1.07113104726248,2.23961195031304,29.1101390900639,238,25.9634640000004,-3.68065482,13.6,1
1348,1,5,0.795504907124338,1.24303715453863,1.07378655151995,7.81264953465776,256,36.189878000001,-10.09332153,30,7
1356,1,3,0.506700026189002,0.988302389533657,3.3440781175907,8.17834285381952,279,55.9970620000022,-4.629217697,10.15,5
1356,1,3,0.674066042198072,0.982415384853818,3.31339850183298,8.33151182611907,279,53.7365090000021,-4.629217697,10.15,5
1356,1,3,0.570608162069161,0.98926323327619,3.31339850183298,7.99852569017692,279,56.9902969999966,-4.629217697,10.15,5
1368,1,4,0.60612182109342,1.07592260555159,3.49747619637926,5.45999494415982,288,52.7710330000045,-4.77656965,5.46,22
1381,0,0,0.300273260816367,1.05063732626687,2.91456349698272,13.2647393520313,252,21.6592930000006,-8.545958555,21,8
1391,0,0,0.149157381804166,1.05591686590128,2.20893233455532,35.7773507630676,244,20.5542940000005,-8.28548436,13.81,4
1399,0,0,0.738617063089037,1.11305499254155,2.66912657092102,7.58519365138373,247,24.7653939999982,-4.11736234,19.79,3
1420,1,4,0.96643094113578,1.28704044126787,3.19068003880213,23.6397387709266,246,28.6750780000002,-9.19463357,38.59,4
1431,0,0,0.848571802341647,0.989832828851258,2.42368964485931,33.6006127134414,215,29.6498439999996,-5.13777457,16.74,0
1461,0,0,0.599347940780615,0.897046355510099,2.51572849213245,23.6781761151345,257,81.8111449999997,-12.95880062,52.31,6
1461,0,0,0.549425265067563,0.958995383074077,2.51572849213245,22.6495225264203,257,92.0807179999975,-12.95880062,52.31,6
1461,0,0,0.494756926179764,0.85213831820671,2.51572849213245,23.6576277085465,257,80.9956620000012,-12.95880062,52.31,6
1461,0,0,0.551265925599521,0.855605719640046,2.51572849213245,23.1204201075687,257,76.1223080000054,-12.95880062,52.31,6
1461,0,0,0.609934160800155,0.97881242343651,2.51572849213245,23.9106145926486,257,99.5914789999952,-12.95880062,52.31,6
1461,0,0,0.687799173523803,0.926570899254645,2.48504887637474,22.5818080572667,257,87.8804070000042,-12.95880062,52.31,6
1461,0,0,0.48407972152421,1.00562372967238,2.54640810789016,23.4600879837258,257,108.852606,-12.95880062,52.31,6
1461,0,0,0.662452735534663,0.931401347141906,2.51572849213245,23.6410812666073,257,88.4196500000107,-12.95880062,52.31,6
1461,0,0,0.441790953499744,0.977343135997391,2.54640810789016,24.9637844204749,257,98.3938070000004,-12.95880062,52.31,6
1461,0,0,0.536848877305146,0.799998736814716,2.51572849213245,23.9464693985537,257,70.3702340000018,-12.95880062,52.31,6
1468,1,4,0.512655615226847,1.2633955833891,1.34990309333936,4.8052649976539,242,32.833157,-8.93926069,21.5,7
1478,1,4,0.59483344656651,1.25605889534306,1.04310693576224,10.7807866721895,256,28.1242280000006,-10.09332153,30,7
1485,0,0,0.187349329448427,1.00750982961081,2.17825271879761,39.3529632028689,240,25.9792579999994,-7.080389145,16.2,3
1491,1,3,0.423977772340532,1.37010500242006,1.53398078788564,11.0885713577482,246,31.0931310000005,-7.77522712,14.15,8
1509,0,0,0.822329671589629,1.13532721086408,2.36233041334389,54.048287757561,244,53.9269889999996,-7.25364552,26.59,3
1539,1,3,1.10183640919762,1.44265171686285,2.69980618667873,11.0203247477495,245,18.866978,-9.02056525,12.91,5
1547,1,5,0.701223944767013,0.969108830734875,1.68737886667421,3.11000856199214,253,80.6402550000057,-11.85139954,36.57,7
1547,1,5,0.446825355349816,0.980046160176072,1.31922347758165,3.78343297915318,253,74.0460820000008,-11.85139954,36.57,7
1547,1,5,0.558364246043315,0.979403579665605,3.68155389092554,2.9819718744464,253,80.5200719999993,-11.85139954,36.57,7
1547,1,5,0.653181821277455,0.949705513765762,1.28854386182394,2.92010077837891,253,73.9094359999872,-11.85139954,36.57,7
1547,1,5,0.502212904312452,0.964012082578792,1.28854386182394,3.42026632969741,253,76.2522219999955,-11.85139954,36.57,7
1547,1,5,0.682532915883637,0.971269436077665,1.68737886667421,2.99801713801316,253,82.2265310000075,-11.85139954,36.57,7
1547,1,5,0.737306457992835,0.945096008300162,1.28854386182394,3.4390219338504,253,67.7187629999971,-11.85139954,36.57,7
1547,1,5,0.54487031503258,0.971799608391104,1.28854386182394,4.09447913202722,253,78.6013220000023,-11.85139954,36.57,7
1551,1,2,1.22176332229719,1.36866488941035,1.16582539879309,11.0019055735056,246,52.2046200000004,-7.77522712,14.15,8
1563,1,3,0.796998725479219,1.25682920771818,2.60776733940559,15.8313575377083,244,32.5711740000006,-7.25364552,26.59,3
1583,0,0,0.203010563890465,1.0614139677661,2.36233041334389,7.64360637812844,245,19.1229620000004,-9.02056525,12.91,5
1589,1,2,0.370217489570331,1.17624481788647,2.66912657092102,23.2964396543755,256,27.7753100000009,-10.09332153,30,7
1592,1,2,0.924458653034125,1.49399718480253,1.59534001940107,12.2734150900947,238,17.0270490000003,-3.68065482,13.6,1
1620,0,0,0.811262439210581,1.14365056212512,2.76116541819415,5.16440586401696,242,27.3482120000008,-3.96104709,7.15,4
1622,1,6,0.555421165421339,1.10361184608959,3.22135965455985,7.25991408536147,245,42.518806,-10.84610777,37.48,6
1636,0,0,0.262480320166803,1.07497471022999,2.23961195031304,29.0761053881353,238,48.1625640000002,-3.68065482,13.6,1
1637,1,2,0.977314376192746,1.22938910507874,2.6384469551633,23.6744130565159,256,26.9358520000023,-10.09332153,30,7
1659,1,2,0.978520392051249,1.72351262760192,2.6384469551633,18.303599195651,240,17.4403080000002,-7.080389145,16.2,3
1675,1,2,0.918675073543566,1.80582033660743,2.60776733940559,32.4252518034506,240,16.8457660000004,-5.54632457,17.48,2
1682,1,2,0.645119800189854,1.70984940957461,2.88388388122501,17.5192120870527,239,13.3170380000011,-1.239999915,7.068,0
1703,1,2,1.01293577604878,1.77132842155013,2.60776733940559,31.3999284968659,240,16.8632809999999,-5.54632457,17.48,2
1704,0,0,0.333008592023047,1.04261759049878,2.54640810789016,15.637468287736,246,20.1765990000003,-7.77522712,14.15,8
1741,0,0,0.757827101997181,1.07574437696333,2.85320426546729,13.0750319956431,252,38.8308809999981,-8.545958555,21,8
1744,1,4,0.371643446195907,0.984276548597983,1.56466040364335,7.54218040344398,257,89.2540489999956,-12.95880062,52.31,6
1744,1,4,0.418454033646416,0.962849060635397,1.50330117212793,7.07161906837788,257,84.2891640000016,-12.95880062,52.31,6
1744,1,4,0.546664545363881,0.949134848242994,2.27029156607075,6.98840360990268,257,85.1943420000025,-12.95880062,52.31,6
1744,1,4,0.658332458673375,0.940312619630238,2.23961195031304,6.21589943574357,257,85.1795379999967,-12.95880062,52.31,6
1744,1,4,0.689698328285918,0.951924765255724,1.47262155637022,6.71463745581801,257,89.4627939999918,-12.95880062,52.31,6
1744,1,4,0.467208597870972,0.932506677326672,1.50330117212793,7.03471579492647,257,80.4626569999964,-12.95880062,52.31,6
1744,1,4,0.791568817252652,0.937109088185961,2.23961195031304,6.07532026864446,257,86.2031669999997,-12.95880062,52.31,6
1744,1,4,0.673556262811252,0.956059276176119,2.23961195031304,6.45761286739362,257,90.0024149999954,-12.95880062,52.31,6
1744,1,4,0.533285976995301,0.957828465129862,1.56466040364335,6.02853848897654,257,86.9307510000072,-12.95880062,52.31,6
1744,1,4,0.789393058029566,0.94803228546375,2.20893233455532,5.99633814027426,257,89.2540489999956,-12.95880062,52.31,6
1747,1,2,0.996111132425002,1.37013916745598,3.22135965455985,5.54986153732919,242,27.6210100000026,-3.96104709,7.15,4
1759,0,0,0.552569460825452,1.0570005122382,2.6384469551633,7.30929441353563,247,34.426277999999,-4.11736234,19.79,3
1778,1,5,1.02556812611227,1.58147458042347,1.38058270909708,10.5261039230582,247,29.9767649999994,-4.11736234,19.79,3
1790,1,3,0.577689006263275,1.01148900243298,3.52815581213697,4.44764035696211,295,57.5184169999993,-4.76235134,7.14,10
1793,1,1,0.3385822760384,1.03038417474771,1.65669925091649,4.65135110095287,253,31.0094549999994,-2.76539356,11.3,1
1797,1,4,0.341277365957499,1.35052962045766,1.04310693576224,13.5195960945436,245,21.9178190000002,-9.02056525,12.91,5
1810,1,3,0.531843824988377,1.43487887167024,1.62601963515878,11.090091997673,242,23.2760039999994,-8.93926069,21.5,7
1875,1,5,0.378829073755863,1.14204019283876,1.56466040364335,6.64777305354064,242,27.9562669999996,-8.93926069,21.5,7
1906,1,3,0.725371620311763,1.00374236948267,3.3440781175907,8.27431217974746,287,62.3134129999962,-1.82958684,9.21,7
1906,1,3,0.632862737969055,1.00388257117837,3.3440781175907,7.2412676551388,287,62.2376480000021,-1.82958684,9.21,7
1928,1,3,0.554195255947747,0.968896313998685,3.28271888607527,7.80509496273471,283,63.1248330000017,-4.563633745,19.9,2
1928,1,3,0.492817523181162,0.969213176118454,3.31339850183298,7.50954572794657,283,64.499738999999,-4.563633745,19.9,2
1928,1,3,0.674994981950012,0.969470553308337,3.25203927031756,7.36448103725401,283,64.0947339999984,-4.563633745,19.9,2
1928,1,3,0.356258972039052,0.933605302510363,3.31339850183298,7.94011444135897,283,55.9981960000005,-4.563633745,19.9,2
1995,1,2,0.883788413442769,1.26322434258235,1.77941771394734,5.52610691835609,242,35.8429619999988,-3.96104709,7.15,4
1998,0,0,0.718420145147095,1.07441775596155,2.69980618667873,4.12461488761209,242,34.4969579999997,-3.96104709,7.15,4
2006,1,4,0.796145234632419,1.26401954478311,3.3440781175907,14.5581326781807,245,31.6356799999994,-10.84610777,37.48,6
2025,1,5,1.00193632595253,1.47208587335493,1.04310693576224,18.0088560521531,247,35.5728180000006,-4.11736234,19.79,3
2036,1,4,0.806598937555551,1.46981781283891,1.65669925091649,18.158105778844,242,37.0515070000001,-3.96104709,7.15,4
2055,1,4,0.816026264278696,1.41846741882527,3.06796157577128,9.98037008132488,252,26.0401329999986,-8.545958555,21,8
2060,0,0,0.795458532791452,1.01305505191261,2.36233041334389,39.1886598316576,245,23.8369159999966,-10.84610777,37.48,6
2070,0,0,0.321853436464159,1.0848044843728,2.66912657092102,14.1234282838283,253,51.0951800000003,-2.76539356,11.3,1
2077,1,3,0.817226604282361,1.22381275486181,2.57708772364788,9.63898568746781,256,29.3491919999979,-10.09332153,30,7
2086,1,2,0.930839479753825,1.17219457709631,3.12932080728671,16.4393149823679,215,29.086124999998,-5.13777457,16.74,0
2092,1,3,0.699939560912835,1.19649224786818,2.57708772364788,9.57873215354354,256,29.6462829999982,-10.09332153,30,7
2094,1,1,0.470101282295579,1.18594615454114,1.47262155637022,6.74810660547673,238,18.6913779999995,-3.68065482,13.6,1
2109,0,0,0.44065817346967,1.19805456732484,2.30097118182846,10.8384835158442,239,14.2516300000007,-1.239999915,7.068,0
2114,1,4,1.18053819681577,1.4776983514805,1.04310693576224,15.5871092204489,246,19.6666519999999,-7.77522712,14.15,8
2139,1,4,0.592939224527234,1.24102636334935,3.22135965455985,23.057324087908,246,31.1436759999997,-9.19463357,38.59,4
2155,1,6,0.753190028312821,1.10000727614319,3.19068003880213,6.79219991387746,245,42.0272130000012,-10.84610777,37.48,6
2169,0,0,0.410978440152663,1.10196613623846,2.48504887637474,33.7404097321026,215,54.0238680000002,-5.13777457,16.74,0
2179,0,0,0.143768252656512,1.0083357083934,2.20893233455532,39.6443967268618,240,25.2629800000004,-7.080389145,16.2,3
2195,1,6,0.640613112425316,0.959508821909456,1.28854386182394,3.68770682645619,257,86.5002249999961,-12.95880062,52.31,6
2195,1,6,0.520815552038129,0.911966164423318,1.34990309333936,6.3637057863566,257,83.6611810000031,-12.95880062,52.31,6
2195,1,6,0.778827028099608,0.934014321125627,1.28854386182394,4.97577286444828,257,82.9661469999992,-12.95880062,52.31,6
2195,1,6,0.700794805918902,0.93850528667509,1.25786424606623,5.72985661872654,257,82.5070280000073,-12.95880062,52.31,6
2195,1,6,0.656791605652416,0.974046555551069,1.31922347758165,5.29021800925992,257,90.8494369999971,-12.95880062,52.31,6
2195,1,6,0.494985487406233,0.968936926943428,1.34990309333936,6.0992459370944,257,89.9167829999933,-12.95880062,52.31,6
2195,1,6,0.381486261536616,1.01109937836114,1.34990309333936,7.19954636967375,257,98.7726129999937,-12.95880062,52.31,6
2195,1,6,0.450811927127834,0.963392982648629,1.04310693576224,6.57827632668799,257,88.4759790000098,-12.95880062,52.31,6
2195,1,6,0.564551752209399,0.916980195756782,1.38058270909708,6.18962683308838,257,83.8981840000051,-12.95880062,52.31,6
2195,1,6,0.8226772722131,0.955029984996585,1.28854386182394,3.24584063013414,257,88.4451289999997,-12.95880062,52.31,6
2204,1,3,0.896698340256702,1.43842118857664,3.09864119152899,14.0190606673372,243,26.5881929999996,-2.66680196,3.291,5
2215,1,2,0.948379525507113,1.5009353868897,2.69980618667873,9.41709026650138,244,17.3360160000002,-8.28548436,13.81,4
2223,1,3,0.648311824613001,1.33076090319809,1.04310693576224,13.4770642587168,247,34.384697999998,-4.11736234,19.79,3
1,1,3,1.22219172187706,2.22757747227073,1.38058270909708,16.4825868723792,188,14.3929999999982,-4.650889115,24.44,3
2,1,3,1.3074553724898,2.22662137442338,1.38058270909708,16.217415135986,188,14.3929999999982,-4.650889115,24.44,3
3,1,3,1.38949608798048,2.22898181922032,1.38058270909708,16.4434340703174,188,14.0869999999995,-4.650889115,24.44,3
5,1,3,1.30935816491957,1.87288621888629,1.38058270909708,14.8159619622808,188,14.3949999999986,-4.650889115,24.44,3
6,1,3,1.34086788543747,1.87199154471851,1.38058270909708,14.7524956047243,188,15.0079999999998,-4.650889115,24.44,3
7,1,5,1.65594635613222,2.47498934428696,1.04310693576224,28.8270408921984,188,15.018,-4.650889115,24.44,3
8,1,5,1.66098057716873,2.48222416304169,1.04310693576224,28.8396295012946,188,15.018,-4.650889115,24.44,3
9,1,5,1.72357600540026,2.48547984015932,1.04310693576224,28.257866017108,188,15.628999999999,-4.650889115,24.44,3
10,1,5,1.71829122275001,2.48759586703409,1.04310693576224,27.8074900665838,188,14.7109999999993,-4.650889115,24.44,3
11,1,5,1.77567253635314,2.49997723201824,1.04310693576224,27.250740435331,188,14.7109999999993,-4.650889115,24.44,3
12,1,5,1.75847522086533,2.49879811967303,1.04310693576224,27.5256039929863,188,14.7109999999993,-4.650889115,24.44,3
13,1,3,1.20311146537134,1.49120013824847,1.56466040364335,14.6734105249285,245,20.7970000000005,-9.50571654,21,6
14,1,3,1.2041340906168,1.49089130331448,1.59534001940107,14.7792607933445,245,20.7970000000005,-9.50571654,21,6
15,1,3,1.20458442296947,1.49276271415319,1.59534001940107,14.9572787802131,245,20.7970000000005,-9.50571654,21,6
16,1,3,0.478771007109984,1.37287363432021,2.57708772364788,17.9215461761617,245,43.3109999999997,-9.50571654,21,6
17,1,3,1.18199333778883,1.53613777878079,1.56466040364335,13.869035810223,245,21.777,-9.50571654,21,6
18,1,3,1.26802870013915,1.53640112713641,1.56466040364335,14.6173702530373,245,21.777,-9.50571654,21,6
19,1,3,1.17403086032382,1.53619423576021,1.56466040364335,14.4170229941613,245,21.777,-9.50571654,21,6
20,1,4,1.13584896873391,1.43814449930824,1.28854386182394,17.4326884265848,245,42.8510000000006,-9.50571654,21,6
21,1,4,1.13858103261891,1.44040166893431,1.25786424606623,14.433352676182,245,42.8510000000006,-9.50571654,21,6
22,1,4,1.14541370519886,1.44749827928561,1.28854386182394,15.8232849289919,245,42.8510000000006,-9.50571654,21,6
23,1,4,1.12690264473317,1.4478526581231,1.28854386182394,15.7129997136137,245,42.3310000000001,-9.50571654,21,6
24,1,4,1.13047228583346,1.4456850770821,1.28854386182394,13.5719297932609,245,42.3310000000001,-9.50571654,21,6
25,1,4,1.14407814638265,1.44441778935066,1.28854386182394,12.5092584798204,245,42.3310000000001,-9.50571654,21,6
26,1,2,0.76442766199361,1.10101623422663,3.03728196001357,47.4744513438113,249,68.0260000000017,-0.812174225,6.21,0
27,1,2,0.667304540770575,1.10624307429205,3.03728196001357,50.5146973501707,249,67.0780000000013,-0.812174225,6.21,0
28,1,2,0.634992836934971,1.10799339252263,3.06796157577128,51.0831844710275,249,67.0780000000013,-0.812174225,6.21,0
29,1,2,0.182671921607992,1.31931590477319,1.47262155637022,14.1513203088891,238,14.3760000000002,-3.68065482,13.6,1
30,1,3,1.06291941886263,1.64130369751706,2.60776733940559,31.9054176871881,240,15.5020000000004,-5.54632457,17.48,2
31,1,3,1.06853640866704,1.64129324966564,2.60776733940559,32.0686489986268,240,15.5010000000002,-5.54632457,17.48,2
32,1,3,1.02438820275592,2.09491403406429,1.38058270909708,21.1641920868251,188,15.1579999999995,-4.650889115,24.44,3
33,1,3,1.07462412060139,2.09295258085231,1.38058270909708,20.8695655521852,188,14.3979999999992,-4.650889115,24.44,3
34,1,3,1.12873422654228,2.10124805650789,1.38058270909708,20.3481505562489,188,14.3979999999992,-4.650889115,24.44,3
35,1,5,1.53362306427092,2.31108409965875,1.04310693576224,32.1653160991789,188,14.393,-4.650889115,24.44,3
36,1,5,1.57830532759003,2.31103354048891,1.04310693576224,31.7200160992757,188,14.393,-4.650889115,24.44,3
37,1,5,1.62003404335258,2.31158845011275,1.04310693576224,31.2541138199089,188,14.393,-4.650889115,24.44,3
38,1,3,0.463150190649778,1.30401275478745,1.65669925091649,22.7446739832004,245,22.7240000000002,-9.50571654,21,6
39,1,3,0.471592378591788,1.38285693923562,1.65669925091649,22.7368774882732,245,25.9549999999999,-9.50571654,21,6
40,1,3,0.481074993081625,1.30540514361615,1.65669925091649,22.7655951455326,245,21.9700000000002,-9.50571654,21,6
41,1,3,0.806939708124326,1.51003216162382,1.04310693576224,24.5136344252903,244,19.6298000000006,-8.28548436,13.81,4
42,1,2,0.969783661345795,1.48944987571596,1.04310693576224,11.5616925035936,244,17.0465999999997,-8.28548436,13.81,4
43,0,0,0.123720903629169,1.07250205038542,2.23961195031304,37.3377861759355,244,20.4376999999995,-8.28548436,13.81,4
44,1,3,0.38745120505384,1.22624890322628,2.1475731030399,1.31199554745537,245,18.6639999999998,-9.02056525,12.91,5
45,1,3,0.991685109164424,1.37716072778028,2.33165079758617,1.24850913531962,245,16,-9.02056525,12.91,5
46,1,3,0.993218003846167,1.38343161293369,2.33165079758617,1.24937124954744,245,15.9980000000005,-9.02056525,12.91,5
47,1,4,0.451774228183324,1.19645131588541,1.84077694546277,1.19208600810381,245,19.6790000000001,-9.02056525,12.91,5
48,1,4,0.49978019893075,1.2206096317981,1.81009732970506,1.25672702580869,245,19.3270000000002,-9.02056525,12.91,5
49,1,4,0.495286434151014,1.21456396626739,1.81009732970506,1.20738106708889,245,19.3270000000002,-9.02056525,12.91,5
50,1,2,0.487335171554667,1.30387355377642,2.73048580243644,1.89089791915828,245,15.6719999999996,-9.02056525,12.91,5
51,1,2,0.414250266016894,1.30389568709637,2.76116541819415,1.96348518872371,245,15.6700000000001,-9.02056525,12.91,5
52,1,2,0.416991989494921,1.32612768010984,2.76116541819415,1.9889169284283,245,15.6719999999996,-9.02056525,12.91,5
53,0,0,0.131444127703458,1.10468602285043,2.20893233455532,40.2417263278648,240,167.393,-7.080389145,16.2,3
54,0,0,0.297222115383637,1.0745466887554,2.23961195031304,28.4267158706748,238,49.3590000000004,-3.68065482,13.6,1
55,0,0,0.155386344489173,1.06019827100036,2.23961195031304,32.8512452987004,244,20.6999999999998,-8.28548436,13.81,4
56,0,0,0.292472552979561,1.07026190992298,2.23961195031304,30.7470512966094,238,48.2140613329993,-3.68065482,13.6,1
57,0,0,0.144827760090849,1.04529078303113,2.23961195031304,37.5619345676003,244,42.9259339999999,-8.28548436,13.81,4
58,0,0,0.219018951711404,1.04990964815275,2.23961195031304,17.5262521867654,242,20.1600240000007,-8.93926069,21.5,7
59,0,0,0.270746861093569,1.06725558667242,2.23961195031304,30.2106635104875,238,48.8089999999993,-3.68065482,13.6,1
60,0,0,0.141586384992306,1.05888050326441,2.23961195031304,34.0438415064136,244,20,-8.28548436,13.81,4
61,0,0,0.175305099777665,1.08222331176238,2.20893233455532,44.4508523175608,240,50.8089999999993,-5.54632457,17.48,2
62,0,0,0.172881380060942,1.08219114566486,2.20893233455532,44.5039425996974,240,50.8089999999993,-5.54632457,17.48,2
63,0,0,0.279517447682464,1.09125333433711,2.3930100291016,42.8476974372747,245,49.9318170000006,-10.84610777,37.48,6
64,1,2,1.13509621075069,1.3311397638045,3.3440781175907,12.8634253757108,284,19.996000000001,-1.6828136,7.43,0
65,1,2,1.13663381975659,1.33317468658499,3.3440781175907,13.5914389421863,284,19.996000000001,-1.6828136,7.43,0
66,1,2,1.12553750573618,1.33558926997515,3.31339850183298,12.5815312037711,284,21.3780000000006,-1.6828136,7.43,0
67,1,2,0.905090488010526,1.29869028254673,2.08621387152447,5.37334331730731,284,19.9940000000006,-1.6828136,7.43,0
68,1,2,0.900599178577481,1.298910486791,2.08621387152447,5.52592228302095,284,19.9940000000006,-1.6828136,7.43,0
69,1,2,0.895394793612895,1.29912539258979,2.08621387152447,5.53169863131758,284,19.9940000000006,-1.6828136,7.43,0
70,1,3,0.926664104292933,1.3817740005018,1.04310693576224,17.3852017778592,242,21.0020000000004,-8.93926069,21.5,7
71,1,5,0.487894132310117,1.12524081310278,1.34990309333936,13.5949909677563,242,27.2490000000007,-8.93926069,21.5,7
72,1,4,0.286166632160844,1.14507909354968,1.62601963515878,15.0858409450126,242,24.2709999999997,-8.93926069,21.5,7
73,1,2,0.455496117345157,1.12652891573724,1.34990309333936,8.69849317021042,242,19.5030000000006,-8.93926069,21.5,7
74,0,0,0.179060463833077,1.04572224927457,2.30097118182846,18.7259139726366,242,19.5039999999999,-8.93926069,21.5,7
75,0,0,0.388742500429314,1.21670820316686,2.30097118182846,15.5819843914115,239,13.8885570000002,-1.239999915,7.068,0
76,1,2,0.878854754515668,2.11773894877576,1.04310693576224,27.9933406878992,239,8.29917000000023,-1.239999915,7.068,0
"""