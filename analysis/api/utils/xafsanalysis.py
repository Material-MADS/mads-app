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
        Oxide008 = StringIO(Train_Oxide_008) #if Larch feature -> Train_Oxide_008, own code feature -> Train_Oxide_008_new
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
        Oxide006 = StringIO(Train_006) #if Larch feature -> Train_006, own code feature -> Train_006_new
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

        logger.info(k_new)
        logger.info(chi_new)

        logger.info(r_new)
        logger.info(chir_mag_new)

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
        Oxide008 = StringIO(Train_Oxide_008_new) #if Larch feature -> Train_Oxide_008, own code feature -> Train_Oxide_008_new
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
        Oxide006 = StringIO(Train_006_new) #if Larch feature -> Train_006, own code feature -> Train_006_new
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

#-----------------------------------------------------------------
#This is old version (use Larch ver. 0.9.68 to calculate feature of training data)
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

#-----------------------------------------------------------------
#This is new version (use my own code to calculate feature of training data)
Train_Oxide_008_new = """
Data_Number,Oxide,Valence,Peak_E0_μt,Peak_Max_μt,Max_y_xposition,Max_y,vdw_radius_alvarez,Peak_Width,gs_energy,fusion_enthalpy,num_unfilled
218,0,0,0.648223509470218,1.09011375462078,2.45436926061703,32.9957691210056,215,54.0236550000009,-5.13777457,16.74,0
220,0,0,0.670588879758158,1.1024228305893,2.20893233455532,2.61807292706756,215,47.9634820000028,-5.13777457,16.74,0
225,0,0,0.162628477563356,1.09557537217944,2.45436926061703,1.13708277954042,240,50.7699999999986,-5.54632457,17.48,2
226,0,0,0.666951336806906,1.05830402777138,3.5895150436524,0.575574838541815,245,47.5,-10.84610777,37.48,6
229,1,3,1.01796468023521,1.65050320300873,2.6384469551633,18.0574411450752,240,17.9400000000005,-7.080389145,16.2,3
231,1,3,0.32824872465685,1.22238893709394,1.65669925091649,1.72238907537206,238,17.5400000000009,-3.68065482,13.6,1
233,1,3,0.834377877573965,1.2897367928171,1.62601963515878,9.82413916539752,238,9.20000000000073,-3.68065482,13.6,1
236,0,0,0.443816380505478,1.18716961059148,2.23961195031304,12.3454839512919,239,14.0400000000009,-1.239999915,7.068,0
248,1,3,1.06144740827273,1.8167241030398,2.51572849213245,2.68012455132058,240,16.8299999999999,-5.54632457,17.48,2
249,1,4,1.40898537521126,1.77212714392372,1.74873809818963,1.78655137130394,245,21.4099999999999,-9.02056525,12.91,5
250,1,3,1.07600923681999,1.59507033099641,2.33165079758617,1.52798613600529,245,19.4200000000001,-9.02056525,12.91,5
252,1,3,0.420018666801535,1.45658232273235,2.69980618667873,2.79934851733456,245,15.7699999999995,-9.02056525,12.91,5
253,1,3,1.32140203831902,1.66049163047349,1.93281579273591,3.13804105928374,245,21.2400000000007,-9.50571654,21,6
257,1,4,1.14994132421376,1.57713329169353,1.74873809818963,1.19675234358382,246,18.5900000000001,-7.77522712,14.15,8
258,1,3,1.04305587278213,1.77207369288299,1.96349540849362,1.41226612478408,244,20.2200000000003,-8.28548436,13.81,4
260,0,0,0.229847031413096,1.01224935893786,2.20893233455532,39.2319412992635,240,25.5299999999997,-7.080389145,16.2,3
261,0,0,0.192395914833359,1.05571645731258,2.33165079758617,7.62851532194112,245,19.9099999999999,-9.02056525,12.91,5
262,0,0,0.19935126296815,1.07697226894601,2.20893233455532,43.3632791683267,240,51.2600000000002,-5.54632457,17.48,2
263,0,0,0.816988864598487,1.03789846711242,2.48504887637474,22.1948022630761,256,17.4399999999987,-10.09332153,30,7
264,1,4,0.716030972355243,1.24295954786844,1.07378655151995,8.35823992314122,256,36.6599999999999,-10.09332153,30,7
265,0,0,0.250424636965642,1.06419965154168,2.54640810789016,16.4883588909081,246,19.4099999999999,-7.77522712,14.15,8
274,0,0,0.157602951801571,1.00713865348054,2.17825271879761,35.7041928630386,240,25.3463016299993,-7.080389145,16.2,3
275,1,4,0.786567205376552,1.06465918507526,3.46679658062155,15.3304130306977,288,62.4000000000015,-4.77656965,5.46,22
276,1,3,0.396443288953031,1.02030472349765,1.68737886667421,4.36085918612667,253,31.0499999999993,-2.76539356,11.3,1
278,1,3,0.475721811165353,1.27324800822656,1.59534001940107,12.3640585201811,246,22.8500000000004,-7.77522712,14.15,8
279,1,4,1.0240303533085,1.40216689678409,1.10446616727766,14.368319600697,246,23.5900000000001,-7.77522712,14.15,8
285,1,3,0.888566376062396,1.15577038693528,2.45436926061703,14.8719776774129,256,27.6892100000005,-10.09332153,30,7
287,1,4,0.987953001407487,1.49490860153545,1.59534001940107,14.7624078244935,242,35.0499999999993,-3.96104709,7.15,4
288,1,3,0.911260764799021,1.53850340172854,2.60776733940559,27.5431307562961,240,18.1399999999994,-5.54632457,17.48,2
299,1,4,0.537805591172134,1.26951407665733,1.38058270909708,11.2689431466218,245,77.5800000000008,-9.02056525,12.91,5
302,1,3,0.718076646874891,1.21071181039652,1.77941771394734,1.47906772134438,215,29.1700000000019,-5.13777457,16.74,0
304,1,3,0.381781101540532,1.14501099838544,3.00660234425586,0.439175421795577,245,19.2600000000002,-9.02056525,12.91,5
305,0,0,0.17108520123048,1.0593205186107,2.20893233455532,0.886974539741626,245,17.8400000000001,-9.02056525,12.91,5
306,1,3,0.517110907885238,1.54831607632181,2.42368964485931,1.47823999668002,245,15.7399999999998,-9.02056525,12.91,5
308,1,4,0.926718593962462,1.3378605125333,1.4419419406125,6.57647770616985,242,29.6099999999969,-3.96104709,7.15,4
309,0,0,0.665774977166647,1.05639882880078,1.99417502425133,0.250604515123469,242,30,-3.96104709,7.15,4
310,1,3,0.4133464265596,1.22420406629094,1.04310693576224,13.6771310136854,245,29.1199999999999,-9.02056525,12.91,5
314,0,0,0.604809441518716,1.00652074256485,2.97592272849814,1.33646198420181,243,34.2099999999991,-2.66680196,3.291,5
315,0,0,0.695454224934819,1.02748212672725,2.6384469551633,0.741378967877837,243,26.0200000000004,-2.66680196,3.291,5
316,0,0,0.659709237976183,1.00243662747291,3.00660234425586,0.99425127593627,243,35.9900000000016,-2.66680196,3.291,5
317,0,0,0.615408583141493,1.00259669168611,2.94524311274043,1.16466115703217,243,35.9900000000016,-2.66680196,3.291,5
318,0,0,0.628802133217758,1.02698805204491,2.94524311274043,1.6712240285564,243,34.2200000000012,-2.66680196,3.291,5
319,0,0,0.604123508396222,1.05120801022676,3.25203927031756,0.89042399963703,243,25.6699999999983,-2.66680196,3.291,5
320,0,0,0.657501666295924,1.01946686289774,2.94524311274043,2.17235320593296,243,34.2200000000012,-2.66680196,3.291,5
322,0,0,0.732847984335568,1.04225051341834,2.73048580243644,0.979320576501966,243,27.0999999999985,-2.66680196,3.291,5
324,0,0,0.666413563565454,1.03690153559084,2.69980618667873,1.29015491215601,243,27.4500000000007,-2.66680196,3.291,5
325,0,0,0.623305148208561,1.01704116622997,2.97592272849814,3.9311798962949,243,34.9300000000003,-2.66680196,3.291,5
326,0,0,0.573279890581509,1.03790307246162,2.97592272849814,1.48928949598541,243,26.3799999999974,-2.66680196,3.291,5
327,0,0,0.622629562756274,1.01840788843044,3.22135965455985,6.44318638033802,243,34.9300000000003,-2.66680196,3.291,5
328,1,3,1.06609152546089,1.699522285374,2.66912657092102,0.622558170016506,244,19.96,-8.28548436,13.81,4
330,0,0,0.727538873064388,1.09184821711412,2.36233041334389,52.6742677041477,244,56.25,-7.25364552,26.59,3
331,1,3,0.406294379923383,1.44405760120857,2.79184503395187,12.8131706864555,245,19.6999999999998,-9.02056525,12.91,5
333,1,3,0.940576882961556,1.39735710518081,1.87145656122048,1.43872690936906,244,27.489999999998,-7.25364552,26.59,3
334,0,0,0.616181621722841,1.08806315149648,2.45436926061703,32.7507968747222,215,55,-5.13777457,16.74,0
335,0,0,0.625318464468491,1.09092638949198,2.45436926061703,44.4462169561026,215,54,-5.13777457,16.74,0
336,0,0,0.63266383382034,1.09472821922022,2.45436926061703,62.7615409697604,215,54,-5.13777457,16.74,0
337,0,0,0.61858363998779,1.09562674492118,2.45436926061703,68.9590460447577,215,55,-5.13777457,16.74,0
338,0,0,0.625151180532644,1.09608220703135,2.45436926061703,72.7840574898626,215,54,-5.13777457,16.74,0
339,0,0,0.621398838448013,1.09672072221554,2.45436926061703,76.3531100296906,215,55,-5.13777457,16.74,0
342,1,3,0.791812273413685,1.48033728141185,2.6384469551633,14.5471230866547,244,21.21,-8.28548436,13.81,4
347,0,0,0.736698770360978,1.08902050920947,2.3930100291016,40.3590465514557,245,51.2000000000007,-10.84610777,37.48,6
348,0,0,0.758620288032283,1.01069493477921,2.3930100291016,57.9509283463894,245,24,-10.84610777,37.48,6
351,0,0,0.439421629359639,1.10254642715191,2.30097118182846,1.75361063144327,246,50.0600000000013,-9.19463357,38.59,4
352,1,4,0.891423230335424,1.44000211861199,1.59534001940107,1.72056410604009,246,28.0200000000004,-9.19463357,38.59,4
354,1,3,0.940576882961556,1.39735710518081,1.87145656122048,1.43872690936906,244,27.489999999998,-7.25364552,26.59,3
355,1,4,0.914258110538099,1.17218031843609,2.42368964485931,12.3072450502478,256,27.3148999999976,-10.09332153,30,7
356,1,3,1.60757253156451,2.52261796946545,2.33165079758617,1.92254994364209,240,16.4200000000001,-7.080389145,16.2,3
359,0,0,0.154271896139418,1.07837809625011,1.84077694546277,0.922885580811414,245,21,-9.50571654,21,6
360,1,3,1.06609152546089,1.699522285374,2.66912657092102,0.622558170016506,244,19.96,-8.28548436,13.81,4
361,0,0,0.17640285401371,1.05756507391782,2.20893233455532,0.875610996873071,245,18.1700000000001,-9.02056525,12.91,5
362,1,4,0.379651503334921,1.09802116616494,3.12932080728671,0.39117595494683,245,21.3400000000001,-9.02056525,12.91,5
364,1,3,0.510886742316516,1.57207818559689,1.16582539879309,13.6022671596578,245,21.5900000000001,-9.50571654,21,6
367,1,4,0.685314323281523,1.0746040732876,1.59534001940107,8.04193428312754,245,43.2400000000016,-10.84610777,37.48,6
372,1,4,0.738274984326746,1.24254156327199,2.97592272849814,1.07259290073953,256,34.2353300000032,-10.09332153,30,7
378,1,4,0.775762196198747,1.24556150508122,1.59534001940107,6.11225557617256,256,37.5275899999979,-10.09332153,30,7
381,1,4,0.675035916024098,1.04304538478884,2.33165079758617,0.643688612382133,245,41.7011084199985,-10.84610777,37.48,6
382,1,3,0.820475095015139,1.10367886344342,3.09864119152899,16.3494533527734,215,32.101980970001,-5.13777457,16.74,0
383,1,3,0.869210097958066,1.19015710315976,1.84077694546277,1.54283774421741,215,24.2845268199999,-5.13777457,16.74,0
384,0,0,0.225450682045051,1.07513581970043,2.27029156607075,72.6655743243577,238,49.0300000000007,-3.68065482,13.6,1
385,0,0,0.23115219975694,1.05839190947751,2.33165079758617,6.46524210362651,245,49.5,-9.02056525,12.91,5
387,0,0,0.228496477846251,1.06491234599654,2.36233041334389,11.0835721285163,245,18.9899999999998,-9.02056525,12.91,5
388,0,0,0.17726386175017,1.08887460157312,2.20893233455532,80.3182374421855,240,51.4799999999996,-5.54632457,17.48,2
390,0,0,0.741627103823272,1.12191608023617,2.3930100291016,54.2673417363731,244,54.7299999999996,-7.25364552,26.59,3
391,0,0,0.593855912256219,1.05237830603271,2.17825271879761,33.5053416938381,244,20.0199999999995,-8.28548436,13.81,4
392,0,0,0.151651558642971,1.06302071043711,2.20893233455532,49.4727497522809,244,20.5,-8.28548436,13.81,4
400,1,4,1.01120877164123,1.52600835387648,3.43611696486384,14.9125182910079,242,38,-3.96104709,7.15,4
401,1,3,0.805721704786446,1.29935787739143,1.71805848243192,6.67658477038723,242,41,-3.96104709,7.15,4
402,0,0,0.703783782435726,1.1055212900687,2.76116541819415,4.85474650107803,242,32,-3.96104709,7.15,4
406,0,0,0.417524462779496,1.07612460850075,2.6384469551633,14.0991527960288,253,87.0600000000013,-2.76539356,11.3,1
407,0,0,0.365770456217259,1.09585015987708,2.66912657092102,3.9445087115936,253,44.5200000000004,-2.76539356,11.3,1
698,1,3,0.715622888361309,1.74977740912991,2.91456349698272,17.4957812527291,239,13.1496299999999,-1.239999915,7.068,0
707,1,4,0.439321898962819,1.01321503846788,1.34990309333936,6.89097546020016,245,30.1912430000002,-9.50571654,21,6
719,1,4,1.04145375240004,1.62777244615979,1.62601963515878,16.6574296148494,242,31.4571929999984,-3.96104709,7.15,4
736,1,4,1.07094126339687,1.5111853732857,1.04310693576224,16.0295707481218,246,49.879747,-7.77522712,14.15,8
737,0,0,0.490708157251592,1.07100202482148,2.6384469551633,13.6969976586531,253,85.515625,-2.76539356,11.3,1
748,1,3,0.891970710559586,1.44502265055522,1.62601963515878,8.67147480250284,247,25.7091549999968,-4.11736234,19.79,3
777,0,0,0.760526336568413,1.06314349372011,2.51572849213245,18.2312532524821,256,48.754488999999,-10.09332153,30,7
787,1,4,1.05756577950444,1.50432683046243,1.59534001940107,9.23863034723479,247,27.9752589999989,-4.11736234,19.79,3
821,0,0,0.784127054762231,0.977375721660834,2.36233041334389,53.210950825413,244,31.5202539999991,-7.25364552,26.59,3
841,1,3,0.870411889458811,1.15324888879208,3.12932080728671,15.647614807304,215,33.1192689999989,-5.13777457,16.74,0
842,1,3,0.900691961164381,1.32409519710951,3.06796157577128,13.8679882989078,243,31.1671100000021,-2.66680196,3.291,5
861,0,0,0.457310727881086,1.20875462757821,2.33165079758617,10.5800323611219,239,13.8571679999986,-1.239999915,7.068,0
902,0,0,0.746366890307719,1.11866852575938,2.94524311274043,2.44492490260164,243,23.6663110000009,-2.66680196,3.291,5
906,0,0,0.557682155910496,0.98763888076073,2.6384469551633,10.6418395497204,253,96.7881570000027,-11.85139954,36.57,7
906,0,0,0.501090229071968,0.97526268752667,2.6384469551633,10.1617541592119,253,94.3518679999979,-11.85139954,36.57,7
906,0,0,0.598828676313759,0.940684398239723,2.6384469551633,10.6331845659228,253,82.2379660000006,-11.85139954,36.57,7
906,0,0,0.633263980339497,0.947929267100623,2.6384469551633,11.1410148813905,253,84.8009270000039,-11.85139954,36.57,7
906,0,0,0.524815165870153,1.00036403926518,2.6384469551633,9.96937307326751,253,101.790857,-11.85139954,36.57,7
916,0,0,0.160048216173978,1.05170269704756,2.30097118182846,18.5936213721288,242,19.996255,-8.93926069,21.5,7
934,1,3,0.578817935606939,1.05335708865791,1.62601963515878,5.23221482376926,253,41.6347769999993,-2.76539356,11.3,1
944,1,3,0.516333732217075,1.01708006758569,1.65669925091649,4.43618373309704,253,33.5435550000002,-2.76539356,11.3,1
957,0,0,0.848220902587162,1.02683325480294,2.51572849213245,18.1561018907631,256,23.5720899999978,-10.09332153,30,7
971,1,3,0.934324401881002,1.85730432214252,2.6384469551633,21.4444686821748,240,16.8069990000004,-7.080389145,16.2,3
982,1,4,0.662263711850162,1.23434680603281,1.07378655151995,8.44097388637605,256,29.2072440000011,-10.09332153,30,7
1020,1,3,0.678899003642801,1.02120791708747,2.11689348728218,1.62308392892758,303,46.1593869999997,-1.92352226,7.12,0
1065,1,3,0.360873975088898,1.20629271766356,1.50330117212793,6.67746658833193,238,18.6819180000002,-3.68065482,13.6,1
1114,1,4,0.693332134251062,1.24985199974953,1.04310693576224,8.8872004870952,256,36.815208,-10.09332153,30,7
1116,1,4,1.15513041941124,1.48372926592471,1.04310693576224,15.9224309375814,246,38.1566579999999,-7.77522712,14.15,8
1145,1,3,0.633598114631292,1.05031040483446,3.62019465941011,3.6788913439235,298,55.4260219999996,-4.927546185,6.2,9
1154,1,3,0.896157660753572,1.28141450919171,2.60776733940559,16.1321047790248,244,29.0625499999987,-7.25364552,26.59,3
1161,0,0,0.74505152457483,1.06856490837606,2.3930100291016,39.0062610139173,245,51.7412569999979,-10.84610777,37.48,6
1176,1,4,0.838163632855786,1.3912964144429,3.06796157577128,9.67674565035598,252,26.9149849999994,-8.545958555,21,8
1262,1,3,1.17515141251948,1.53253435456412,1.59534001940107,13.9857905087212,245,26.1353950000002,-9.50571654,21,6
1263,1,3,1.09749604584792,1.65903072691764,2.66912657092102,13.5848879785874,245,17.7606310000001,-9.02056525,12.91,5
1266,1,3,0.56730917968159,1.0709585303615,1.59534001940107,5.13748619189785,253,40.5438159999976,-2.76539356,11.3,1
1268,0,0,0.138246456050519,1.07549571014423,2.20893233455532,28.9089316224279,245,21.314421,-9.50571654,21,6
1288,0,0,0.699992932288521,1.05690364884351,1.50330117212793,2.43335153811272,243,28.6234600000025,-2.66680196,3.291,5
1292,1,4,0.975707209206997,1.40662105655069,1.38058270909708,8.48397061658064,247,35.6944750000002,-4.11736234,19.79,3
1302,1,4,0.72617868765012,1.28343496848935,3.3440781175907,14.4367249284607,245,38.1860340000021,-10.84610777,37.48,6
1318,1,3,0.936333521828641,1.41134709781247,1.59534001940107,11.4535472298806,238,19.2734079999991,-3.68065482,13.6,1
1320,1,3,0.586789391500418,0.950296628572316,3.28271888607527,6.79135291107194,280,72.443220000001,-1.47410408,7.66,0
1320,1,3,0.65199404507762,0.93889227535231,3.25203927031756,6.01228771489487,280,69.8977720000039,-1.47410408,7.66,0
1320,1,3,0.580476976201969,0.951999392285583,3.28271888607527,7.0608221334666,280,77.6203299999979,-1.47410408,7.66,0
1320,1,3,0.607116530805371,0.950803447151282,3.25203927031756,7.75164823907907,280,71.5894459999981,-1.47410408,7.66,0
1320,1,3,0.622461322823049,0.941048160943292,3.28271888607527,6.14140011833582,280,69.7907130000021,-1.47410408,7.66,0
1335,0,0,0.253339223916101,1.07108310384498,2.23961195031304,29.0905183666306,238,25.9634640000004,-3.68065482,13.6,1
1348,1,4,0.814874222521871,1.24397425555614,1.07378655151995,7.80750019973777,256,36.189878000001,-10.09332153,30,7
1356,1,3,0.585002618421348,0.987847788408925,3.31339850183298,8.03552959372445,279,60.7602909999987,-4.629217697,10.15,5
1356,1,3,0.584293274561294,0.983496451430321,3.31339850183298,8.32280626970254,279,58.3719629999978,-4.629217697,10.15,5
1356,1,3,0.557956944634005,0.989576827371091,3.3440781175907,7.92296379506714,279,61.6629359999934,-4.629217697,10.15,5
1368,1,4,0.608445972626992,1.07547461008452,3.49747619637926,5.42777720481481,288,54.6424610000031,-4.77656965,5.46,22
1381,0,0,0.848664412477008,1.0628544365227,2.85320426546729,13.1236516153125,252,22.0380379999988,-8.545958555,21,8
1391,0,0,0.1498896682075,1.05586874047792,2.20893233455532,35.7465586722654,244,20.5542940000005,-8.28548436,13.81,4
1399,0,0,0.702676749157109,1.11261911235036,2.66912657092102,7.56868916911022,247,24.7653939999982,-4.11736234,19.79,3
1420,1,4,0.966486064521173,1.2865690952829,3.19068003880213,23.6009203798508,246,28.9856260000015,-9.19463357,38.59,4
1431,0,0,0.792770708360182,0.98940062473247,2.45436926061703,33.6672750214554,215,30.0809670000017,-5.13777457,16.74,0
1461,0,0,0.468176628142371,0.918071266839778,2.54640810789016,23.6482406321117,257,93.7027079999971,-12.95880062,52.31,6
1461,0,0,0.637945871509334,0.94893673427609,2.51572849213245,21.7967584489193,257,104.150775999995,-12.95880062,52.31,6
1461,0,0,0.502838700923769,0.854503486131844,2.51572849213245,23.2792046726675,257,86.8876199999941,-12.95880062,52.31,6
1461,0,0,0.488488454795195,0.868188898136334,2.51572849213245,22.9130613264019,257,88.2228319999995,-12.95880062,52.31,6
1461,0,0,0.667116689876474,0.972719835212176,2.48504887637474,23.1448533996282,257,111.595813000007,-12.95880062,52.31,6
1461,0,0,0.522628503312189,0.949429157164814,2.51572849213245,22.9379822238004,257,99.7950730000011,-12.95880062,52.31,6
1461,0,0,0.573474652683495,0.993201514416955,2.51572849213245,22.7019357155918,257,114.937030000001,-12.95880062,52.31,6
1461,0,0,0.668831883852232,0.932697761017474,2.51572849213245,23.1942995035142,257,100.477718000009,-12.95880062,52.31,6
1461,0,0,0.45148292692473,0.97773651867546,2.54640810789016,24.5303476392177,257,104.465152999997,-12.95880062,52.31,6
1461,0,0,0.556156105942358,0.802925520986215,2.51572849213245,23.4699569144046,257,82.2544839999901,-12.95880062,52.31,6
1468,1,4,0.470073122613873,1.25710322723615,1.34990309333936,4.76010056339649,242,53.9475140000004,-8.93926069,21.5,7
1478,1,4,0.685828517492333,1.26149531957598,1.04310693576224,11.4826691628006,256,28.1242280000006,-10.09332153,30,7
1485,0,0,0.188966279659193,1.00749488712413,2.17825271879761,39.2746618168519,240,25.9792579999994,-7.080389145,16.2,3
1491,1,3,0.519896259171524,1.36798825829004,1.53398078788564,10.8287442695402,246,55.8328890000003,-7.77522712,14.15,8
1509,0,0,0.803028968464098,1.13511275278534,2.36233041334389,53.9904012062198,244,53.9269889999996,-7.25364552,26.59,3
1539,1,3,1.0036211821812,1.43838602824937,2.69980618667873,10.9843797032177,245,18.866978,-9.02056525,12.91,5
1547,1,4,0.633028141969421,0.971896466972717,1.71805848243192,3.07062994921354,253,86.7372449999966,-11.85139954,36.57,7
1547,1,4,0.454953210582737,0.980339344268531,1.31922347758165,3.72784280025553,253,86.2075039999909,-11.85139954,36.57,7
1547,1,4,0.633349380400187,0.977206040689985,3.65087427516783,2.92862367248126,253,86.575674000007,-11.85139954,36.57,7
1547,1,4,0.555167321615783,0.953662303224417,1.28854386182394,2.87849795751907,253,79.8660839999939,-11.85139954,36.57,7
1547,1,4,0.508882064840686,0.964494234812254,1.28854386182394,3.37444277537662,253,82.3310190000047,-11.85139954,36.57,7
1547,1,4,0.552691544053828,0.976884524014422,1.68737886667421,2.96248304348083,253,88.3254370000068,-11.85139954,36.57,7
1547,1,4,0.741288809758521,0.945928335564628,1.28854386182394,3.38688751124398,253,79.6948929999926,-11.85139954,36.57,7
1547,1,4,0.550252235439931,0.972133078596364,1.28854386182394,4.04606176827616,253,84.7033290000109,-11.85139954,36.57,7
1551,1,3,1.21585850891549,1.35884858006838,1.16582539879309,10.7089025204391,246,73.2032610000006,-7.77522712,14.15,8
1563,1,3,0.828352294277737,1.25642021768655,2.60776733940559,15.7953045294236,244,32.8552340000024,-7.25364552,26.59,3
1583,0,0,0.206578255755723,1.06113905055409,2.36233041334389,7.60939013385468,245,19.435536,-9.02056525,12.91,5
1589,1,3,0.391958850706134,1.17704329871605,2.66912657092102,23.3100812045076,256,27.7753100000009,-10.09332153,30,7
1592,1,3,0.924588508405641,1.49314800497358,1.59534001940107,12.2523196468268,238,17.4247639999994,-3.68065482,13.6,1
1620,0,0,0.81166121481849,1.14334704892955,2.76116541819415,5.15349420324149,242,27.3482120000008,-3.96104709,7.15,4
1622,1,4,0.617977327114415,1.10538461388299,3.22135965455985,7.21206256673981,245,42.8443259999986,-10.84610777,37.48,6
1636,0,0,0.263061732672242,1.07491560504979,2.23961195031304,29.0531836778414,238,48.5163810000013,-3.68065482,13.6,1
1637,1,3,0.950368766995174,1.2290339978154,2.6384469551633,23.6834090857202,256,27.2771350000003,-10.09332153,30,7
1659,1,3,0.978596910026217,1.72093521924035,2.6384469551633,18.238396359916,240,17.8406839999998,-7.080389145,16.2,3
1675,1,3,0.918836740387293,1.80421843622949,2.60776733940559,32.3607941326909,240,16.8457660000004,-5.54632457,17.48,2
1682,1,3,0.64556775110254,1.70895339539089,2.88388388122501,17.4970979240244,239,13.3170380000011,-1.239999915,7.068,0
1703,1,3,1.01290341474102,1.76939879658253,2.60776733940559,31.3213761652728,240,16.8632809999999,-5.54632457,17.48,2
1704,0,0,0.279171969476713,1.04236256832053,2.54640810789016,15.5697329467463,246,20.3709440000002,-7.77522712,14.15,8
1741,0,0,0.75808480109557,1.0756637764596,2.85320426546729,13.0611187006698,252,39.2279830000007,-8.545958555,21,8
1744,1,4,0.577719997581599,0.963395166753592,1.50330117212793,6.79443208778214,257,101.145579000004,-12.95880062,52.31,6
1744,1,4,0.585255721819646,0.947831673437092,1.47262155637022,6.73700718093493,257,96.3869689999992,-12.95880062,52.31,6
1744,1,4,0.612199778638419,0.946199463625432,2.27029156607075,6.80277851917307,257,91.197027000002,-12.95880062,52.31,6
1744,1,4,0.664336029808184,0.941361409379861,2.23961195031304,6.10667747447796,257,91.1709080000001,-12.95880062,52.31,6
1744,1,4,0.587421251992082,0.95943628223433,1.50330117212793,6.7529654601689,257,101.312708999991,-12.95880062,52.31,6
1744,1,4,0.59850916292325,0.923540164485422,1.47262155637022,6.76760885424616,257,92.4782699999923,-12.95880062,52.31,6
1744,1,4,0.591903291356179,0.953097260038406,2.23961195031304,6.16895469817756,257,98.1954879999976,-12.95880062,52.31,6
1744,1,4,0.629448485462519,0.959648697153422,2.23961195031304,6.35861980706398,257,96.0024649999978,-12.95880062,52.31,6
1744,1,4,0.541935431255447,0.958610015995193,1.56466040364335,5.91681361697697,257,98.7945680000121,-12.95880062,52.31,6
1744,1,4,0.631534430513037,0.960624344164093,2.23961195031304,5.99620468928031,257,101.090085999997,-12.95880062,52.31,6
1747,1,3,0.952368028522347,1.37043061280382,3.22135965455985,5.54385472224959,242,29.362089000002,-3.96104709,7.15,4
1759,0,0,0.66433299827489,1.05686309169927,2.6384469551633,7.29816842147071,247,34.426277999999,-4.11736234,19.79,3
1778,1,4,1.02548139208637,1.57950206076449,1.38058270909708,10.4904243753144,247,29.9767649999994,-4.11736234,19.79,3
1790,1,3,0.580050901833218,1.01142474688557,3.52815581213697,4.42276564861617,295,57.5184169999993,-4.76235134,7.14,10
1793,1,3,0.408438626635075,1.03083884393827,1.62601963515878,4.6411152701941,253,31.720057999999,-2.76539356,11.3,1
1797,1,4,0.393656501020604,1.34986588615116,1.04310693576224,13.9156290621873,245,22.2486699999999,-9.02056525,12.91,5
1810,1,3,0.538226201375692,1.42895016499089,1.62601963515878,10.9389170386137,242,31.8189359999997,-8.93926069,21.5,7
1875,1,4,0.385240257206332,1.14057417809874,1.56466040364335,6.57918471219544,242,29.7911399999994,-8.93926069,21.5,7
1906,1,3,0.55141345313761,1.00428795727365,3.37475773334841,8.38528216750179,287,62.3134129999962,-1.82958684,9.21,7
1906,1,3,0.592647712688768,1.00385527856327,3.3440781175907,7.22300813731682,287,62.2376480000021,-1.82958684,9.21,7
1928,1,3,0.603345225303817,0.967960538876056,3.28271888607527,7.68790777781302,283,69.3185989999984,-4.563633745,19.9,2
1928,1,3,0.633245422483384,0.965696618084591,3.28271888607527,7.31700021837907,283,70.659845000002,-4.563633745,19.9,2
1928,1,3,0.625841821508603,0.971201271767198,3.28271888607527,7.31628258673976,283,70.0791129999998,-4.563633745,19.9,2
1928,1,3,0.582182157380855,0.927746099951767,3.28271888607527,7.65218546169091,283,62.1667159999997,-4.563633745,19.9,2
1995,1,3,0.884134466913452,1.26244051624188,1.77941771394734,5.50965105118688,242,36.5169829999977,-3.96104709,7.15,4
1998,0,0,0.719274753553801,1.07419189449462,2.69980618667873,4.11209645233541,242,35.245984000001,-3.96104709,7.15,4
2006,1,4,0.823672628938438,1.26477277314737,3.3440781175907,14.5333807275913,245,31.9515290000018,-10.84610777,37.48,6
2025,1,4,0.967598127947302,1.47079267215992,1.04310693576224,18.46276080563,247,36.0628959999995,-4.11736234,19.79,3
2036,1,4,0.807150465747125,1.46847801786661,1.65669925091649,18.1063339630039,242,37.6507559999991,-3.96104709,7.15,4
2055,1,4,0.816244279862095,1.41797151967354,3.06796157577128,9.96854276038159,252,26.0401329999986,-8.545958555,21,8
2060,0,0,0.795702946418147,1.01303945198554,2.36233041334389,39.1418319556755,245,23.8369159999966,-10.84610777,37.48,6
2070,0,0,0.383794375132631,1.08215471909521,2.6384469551633,14.1020725001935,253,51.8058469999996,-2.76539356,11.3,1
2077,1,3,0.845526549554251,1.22492585795239,2.57708772364788,9.63870342721415,256,29.3491919999979,-10.09332153,30,7
2086,1,3,0.901869495449624,1.17180381445318,3.12932080728671,16.4439259868663,215,29.409507999997,-5.13777457,16.74,0
2092,1,3,0.674100813335784,1.1946379842709,2.57708772364788,9.53872800918081,256,29.8358210000006,-10.09332153,30,7
2094,1,3,0.471212759178416,1.18555612745498,1.47262155637022,6.7339523222795,238,18.6913779999995,-3.68065482,13.6,1
2109,0,0,0.440823363748441,1.19799607592302,2.30097118182846,10.8352825771145,239,14.2516300000007,-1.239999915,7.068,0
2114,1,4,1.17849880207041,1.47230217756794,1.04310693576224,15.4110486800406,246,21.4505589999999,-7.77522712,14.15,8
2139,1,4,0.593659563012325,1.24059984088391,3.22135965455985,23.0165216523754,246,31.4873130000014,-9.19463357,38.59,4
2155,1,4,0.753499461998422,1.09988189376892,3.19068003880213,6.7836843129995,245,42.3079690000013,-10.84610777,37.48,6
2169,0,0,0.397568308289265,1.10180938735749,2.48504887637474,33.6819893548189,215,54.492588000001,-5.13777457,16.74,0
2179,0,0,0.145421862140902,1.00831960994043,2.20893233455532,39.5678330781446,240,25.2629800000004,-7.080389145,16.2,3
2195,1,4,0.553320666492195,0.967569587453383,1.28854386182394,3.90815379571035,257,98.685197999992,-12.95880062,52.31,6
2195,1,4,0.530097119794708,0.913671336672448,1.34990309333936,6.24044335115014,257,89.6699019999942,-12.95880062,52.31,6
2195,1,4,0.589342771315035,0.94899716416247,1.31922347758165,5.34709465597081,257,94.9291369999992,-12.95880062,52.31,6
2195,1,4,0.706518540887116,0.939681668153634,1.25786424606623,5.62024534886363,257,94.4708380000084,-12.95880062,52.31,6
2195,1,4,0.663315946504186,0.974539926648943,1.31922347758165,5.18965115298383,257,102.943752000007,-12.95880062,52.31,6
2195,1,4,0.491127156950842,0.970408763847779,1.34990309333936,6.02674174097631,257,96.139388999989,-12.95880062,52.31,6
2195,1,4,0.593085662471891,0.983662831873732,1.34990309333936,6.33773760602686,257,104.563026000003,-12.95880062,52.31,6
2195,1,4,0.576838360290173,0.951266098789072,1.34990309333936,4.99379978580007,257,94.4986980000103,-12.95880062,52.31,6
2195,1,4,0.693444931577103,0.909058231127195,1.34990309333936,5.35465360721202,257,89.9346930000029,-12.95880062,52.31,6
2195,1,4,0.579916496715756,0.972761470435398,1.34990309333936,3.85184098192721,257,100.586519999997,-12.95880062,52.31,6
2204,1,3,0.89700768767964,1.43710829134819,3.09864119152899,13.9770786246221,243,26.5881929999996,-2.66680196,3.291,5
2215,1,3,1.00916848514919,1.49727972035089,2.69980618667873,9.31626975226948,244,17.7045509999998,-8.28548436,13.81,4
2223,1,3,0.874753321253665,1.32812547979526,1.04310693576224,11.2791031556916,247,34.384697999998,-4.11736234,19.79,3
1,1,3,1.22183584186161,2.22561128610428,1.38058270909708,16.456217726563,188,14.3929999999982,-4.650889115,24.44,3
2,1,3,1.30701021062449,2.22484536038187,1.38058270909708,16.1939574872452,188,15.0049999999992,-4.650889115,24.44,3
3,1,3,1.38892882075872,2.2271919139462,1.38058270909708,16.4195057929963,188,14.6990000000005,-4.650889115,24.44,3
5,1,3,1.30896291144031,1.87177097011026,1.38058270909708,14.7970436428032,188,15.0079999999998,-4.650889115,24.44,3
6,1,3,1.34047998096391,1.87099922647468,1.38058270909708,14.7357171261927,188,15.0079999999998,-4.650889115,24.44,3
7,1,4,1.65498880159709,2.47283614574569,1.04310693576224,28.7851028492878,188,15.628999999999,-4.650889115,24.44,3
8,1,4,1.66007607047813,2.48019584070094,1.04310693576224,28.8002986140069,188,15.628999999999,-4.650889115,24.44,3
9,1,4,1.72247162185264,2.48321257385199,1.04310693576224,28.2148732826182,188,15.628999999999,-4.650889115,24.44,3
10,1,4,1.71761578637739,2.4861970244399,1.04310693576224,27.7814307936134,188,15.3230000000003,-4.650889115,24.44,3
11,1,4,1.77482261546855,2.49833367508567,1.04310693576224,27.2209738885636,188,15.3230000000003,-4.650889115,24.44,3
12,1,4,1.75755621560857,2.49698210338994,1.04310693576224,27.4923582039636,188,15.3230000000003,-4.650889115,24.44,3
13,1,3,1.20253452974549,1.48980489028124,1.56466040364335,14.631743430812,245,20.7970000000005,-9.50571654,21,6
14,1,3,1.20339286642423,1.4891088449862,1.59534001940107,14.7256088768735,245,20.7970000000005,-9.50571654,21,6
15,1,3,1.20394380751913,1.49121972567032,1.59534001940107,14.9104545092642,245,20.7970000000005,-9.50571654,21,6
16,1,3,0.491365068809227,1.36386417087757,2.57708772364788,17.4885159119962,245,53.8329999999996,-9.50571654,21,6
17,1,3,1.18058350127538,1.53198451346841,1.56466040364335,13.7616415254565,245,22.299,-9.50571654,21,6
18,1,3,1.15703089176452,1.53086705119416,1.56466040364335,14.7426088690727,245,22.299,-9.50571654,21,6
19,1,3,1.17269865758473,1.5320896796591,1.56466040364335,14.3067064147994,245,22.299,-9.50571654,21,6
20,1,4,1.13200660136261,1.42575197146099,1.28854386182394,16.939885841828,245,52.8530000000001,-9.50571654,21,6
21,1,4,1.13495028835083,1.42886339558735,1.25786424606623,14.0554050607032,245,52.8530000000001,-9.50571654,21,6
22,1,4,1.1417270703352,1.43615297482754,1.28854386182394,15.4222827774566,245,52.8530000000001,-9.50571654,21,6
23,1,4,1.12400098486957,1.43761239807495,1.28854386182394,15.3538511522141,245,52.8530000000001,-9.50571654,21,6
24,1,4,1.12725641750181,1.43469987423913,1.28854386182394,13.2375958312964,245,52.8530000000001,-9.50571654,21,6
25,1,4,1.14017509060779,1.43237857686263,1.28854386182394,12.1705489669857,245,52.8530000000001,-9.50571654,21,6
26,1,3,0.698148838072392,1.1007040319041,3.03728196001357,47.2026162625705,249,68.9830000000002,-0.812174225,6.21,0
27,1,3,0.667826374038181,1.10607643190911,3.03728196001357,50.4354649583927,249,67.0780000000013,-0.812174225,6.21,0
28,1,3,0.636652618265708,1.1075023188234,3.06796157577128,50.8508961052055,249,68.9880000000012,-0.812174225,6.21,0
29,1,3,0.785529889669098,1.32297162846048,1.04310693576224,14.6622666793015,238,14.3760000000002,-3.68065482,13.6,1
30,1,3,1.06276939609129,1.63977459633225,2.60776733940559,31.8293439121557,240,15.5020000000004,-5.54632457,17.48,2
31,1,3,1.06836103013588,1.63965223767704,2.60776733940559,31.986588571672,240,15.5010000000002,-5.54632457,17.48,2
32,1,3,1.35974187145799,2.09225932767074,1.38058270909708,19.1667768617979,188,15.1579999999994,-4.650889115,24.44,3
33,1,3,1.4103605235796,2.089905633654,1.38058270909708,18.8955124157076,188,14.3979999999992,-4.650889115,24.44,3
34,1,3,1.12852673163043,2.09947305560536,1.38058270909708,20.3154273525433,188,14.3979999999992,-4.650889115,24.44,3
35,1,4,1.53311455028418,2.3098347072556,1.04310693576224,32.1347744035803,188,14.393,-4.650889115,24.44,3
36,1,4,1.57768640495412,2.30963042643303,1.04310693576224,31.6861832002455,188,14.393,-4.650889115,24.44,3
37,1,4,1.26244329176714,2.31051099189216,1.04310693576224,35.4118781018679,188,14.393,-4.650889115,24.44,3
38,1,3,0.463619817053019,1.30374680998502,1.65669925091649,22.7248110652394,245,22.7240000000002,-9.50571654,21,6
39,1,3,0.470821716206868,1.38341532149557,1.65669925091649,22.7699877307246,245,25.9549999999999,-9.50571654,21,6
40,1,3,0.480947152640905,1.30548038209654,1.65669925091649,22.771195403156,245,21.9700000000003,-9.50571654,21,6
41,1,3,0.807249486598992,1.50921378005165,1.04310693576224,24.4744026307234,244,19.6298000000006,-8.28548436,13.81,4
42,1,3,0.969815436991341,1.48893516789701,1.04310693576224,11.5495516040294,244,17.0465999999997,-8.28548436,13.81,4
43,0,0,0.167853232170412,1.07052167233009,2.20893233455532,37.1291211154228,244,20.4376999999995,-8.28548436,13.81,4
44,1,3,0.936665812167917,1.31913175279474,2.33165079758617,1.1834132645374,245,19.0150000000003,-9.02056525,12.91,5
45,1,3,0.944182552043934,1.32930360088072,2.33165079758617,1.15695335234935,245,19.3190000000004,-9.02056525,12.91,5
46,1,3,0.993885164493728,1.34571255834711,2.33165079758617,1.12642121282186,245,19.0150000000003,-9.02056525,12.91,5
47,1,4,0.507855999444201,1.17635496448272,1.84077694546277,1.07016072137774,245,20.3320000000003,-9.02056525,12.91,5
48,1,4,0.557282539311111,1.19524963980283,1.81009732970506,1.11228823337108,245,20.3320000000003,-9.02056525,12.91,5
49,1,4,0.554171996962972,1.18953052003643,1.81009732970506,1.066548628672,245,20.3320000000003,-9.02056525,12.91,5
50,1,3,0.489376777028028,1.30266342607704,2.73048580243644,1.88336961979409,245,15.6719999999996,-9.02056525,12.91,5
51,1,3,0.496948672510778,1.30883875558635,2.76116541819415,1.96567739909847,245,15.6700000000001,-9.02056525,12.91,5
52,1,3,0.419312193624042,1.32482978579161,2.76116541819415,1.98100387480177,245,15.973,-9.02056525,12.91,5
53,0,0,0.180710631979984,1.10478333312699,2.20893233455532,40.0686296427026,240,167.393,-7.080389145,16.2,3
54,0,0,0.297883239389936,1.07447656051143,2.23961195031304,28.3999740924418,238,49.4590000000007,-3.68065482,13.6,1
55,0,0,0.156059033719588,1.06015032633779,2.23961195031304,32.8250819384117,244,20.6999999999998,-8.28548436,13.81,4
56,0,0,0.273232493211414,1.07017970209681,2.23961195031304,30.731434600586,238,48.2140613329993,-3.68065482,13.6,1
57,0,0,0.146012635422361,1.04522803082791,2.23961195031304,37.5098937636308,244,43.025928,-8.28548436,13.81,4
58,0,0,0.194602367039851,1.04982190067331,2.23961195031304,17.5271623734952,242,20.2600170000005,-8.93926069,21.5,7
59,0,0,0.271526437306286,1.06718368998921,2.23961195031304,30.1783681472573,238,48.8089999999993,-3.68065482,13.6,1
60,0,0,0.142066272245668,1.05884758671518,2.23961195031304,34.024809581312,244,20,-8.28548436,13.81,4
61,0,0,0.174803661025069,1.08227330596185,2.20893233455532,44.4778796689689,240,50.8089999999993,-5.54632457,17.48,2
62,0,0,0.173435634009798,1.08213606921133,2.20893233455532,44.4741205106422,240,50.8089999999993,-5.54632457,17.48,2
63,0,0,0.789202461189196,1.08734975970646,2.36233041334389,41.6800119055157,245,49.9318170000006,-10.84610777,37.48,6
64,1,3,0.453575299092035,1.34780771388108,3.43611696486384,13.7164975621354,284,19.996000000001,-1.6828136,7.43,0
65,1,3,0.457364298759492,1.34954099221252,3.43611696486384,14.4976378484343,284,21.0290000000005,-1.6828136,7.43,0
66,1,3,0.591048451360753,1.3507239763526,3.40543734910612,13.3117132789074,284,21.3780000000006,-1.6828136,7.43,0
67,1,3,0.796599153851462,1.30077693981802,2.08621387152447,6.03565723462505,284,19.9940000000006,-1.6828136,7.43,0
68,1,3,0.791701939093953,1.30103382734294,2.08621387152447,6.18908679402263,284,19.9940000000006,-1.6828136,7.43,0
69,1,3,0.787602944337007,1.30121208075237,2.08621387152447,6.1860056906517,284,19.9940000000006,-1.6828136,7.43,0
70,1,3,0.926077863414396,1.38482586921206,1.04310693576224,17.5239054555534,242,20.7430000000004,-8.93926069,21.5,7
71,1,4,0.371321566882038,1.12244802820948,1.34990309333936,13.776264351585,242,27.2490000000007,-8.93926069,21.5,7
72,1,4,0.454939046651275,1.12808675292385,1.34990309333936,8.71650699027837,242,19.5030000000006,-8.93926069,21.5,7
73,1,3,0.243294817653832,1.14359440002386,1.62601963515878,15.3607835886368,242,24.2709999999997,-8.93926069,21.5,7
74,0,0,0.174022630137531,1.04600283152613,2.30097118182846,18.8408100783139,242,19.5039999999999,-8.93926069,21.5,7
75,0,0,0.412511609298239,1.2163819317866,2.30097118182846,15.5139652792127,239,13.9745790000015,-1.239999915,7.068,0
76,1,3,0.959316705724921,2.11326895398026,1.04310693576224,26.8106530212795,239,8.39916000000085,-1.239999915,7.068,0
"""


Train_006_new = """
Data_Number,Oxide,Valence,Peak_E0_μt,Peak_Max_μt,Max_y_xposition,Max_y,vdw_radius_alvarez,Peak_Width,gs_energy,fusion_enthalpy,num_unfilled
218,0,0,0.648223509470218,1.09011375462078,2.45436926061703,32.9957691210056,215,54.0236550000009,-5.13777457,16.74,0
220,0,0,0.670588879758158,1.1024228305893,2.20893233455532,2.61807292706756,215,47.9634820000028,-5.13777457,16.74,0
225,0,0,0.162628477563356,1.09557537217944,2.45436926061703,1.13708277954042,240,50.7699999999986,-5.54632457,17.48,2
226,0,0,0.666951336806906,1.05830402777138,3.5895150436524,0.575574838541815,245,47.5,-10.84610777,37.48,6
229,1,2,1.01796468023521,1.65050320300873,2.6384469551633,18.0574411450752,240,17.9400000000005,-7.080389145,16.2,3
231,1,1,0.32824872465685,1.22238893709394,1.65669925091649,1.72238907537206,238,17.5400000000009,-3.68065482,13.6,1
233,1,2,0.834377877573965,1.2897367928171,1.62601963515878,9.82413916539752,238,9.20000000000073,-3.68065482,13.6,1
236,0,0,0.443816380505478,1.18716961059148,2.23961195031304,12.3454839512919,239,14.0400000000009,-1.239999915,7.068,0
248,1,2,1.06144740827273,1.8167241030398,2.51572849213245,2.68012455132058,240,16.8299999999999,-5.54632457,17.48,2
249,1,4,1.40898537521126,1.77212714392372,1.74873809818963,1.78655137130394,245,21.4099999999999,-9.02056525,12.91,5
250,1,3,1.07600923681999,1.59507033099641,2.33165079758617,1.52798613600529,245,19.4200000000001,-9.02056525,12.91,5
252,1,2,0.420018666801535,1.45658232273235,2.69980618667873,2.79934851733456,245,15.7699999999995,-9.02056525,12.91,5
253,1,3,1.32140203831902,1.66049163047349,1.93281579273591,3.13804105928374,245,21.2400000000007,-9.50571654,21,6
257,1,4,1.14994132421376,1.57713329169353,1.74873809818963,1.19675234358382,246,18.5900000000001,-7.77522712,14.15,8
258,1,3,1.04305587278213,1.77207369288299,1.96349540849362,1.41226612478408,244,20.2200000000003,-8.28548436,13.81,4
260,0,0,0.229847031413096,1.01224935893786,2.20893233455532,39.2319412992635,240,25.5299999999997,-7.080389145,16.2,3
261,0,0,0.192395914833359,1.05571645731258,2.33165079758617,7.62851532194112,245,19.9099999999999,-9.02056525,12.91,5
262,0,0,0.19935126296815,1.07697226894601,2.20893233455532,43.3632791683267,240,51.2600000000002,-5.54632457,17.48,2
263,0,0,0.816988864598487,1.03789846711242,2.48504887637474,22.1948022630761,256,17.4399999999987,-10.09332153,30,7
264,1,5,0.716030972355243,1.24295954786844,1.07378655151995,8.35823992314122,256,36.6599999999999,-10.09332153,30,7
265,0,0,0.250424636965642,1.06419965154168,2.54640810789016,16.4883588909081,246,19.4099999999999,-7.77522712,14.15,8
274,0,0,0.157602951801571,1.00713865348054,2.17825271879761,35.7041928630386,240,25.3463016299993,-7.080389145,16.2,3
275,1,4,0.786567205376552,1.06465918507526,3.46679658062155,15.3304130306977,288,62.4000000000015,-4.77656965,5.46,22
276,1,1,0.396443288953031,1.02030472349765,1.68737886667421,4.36085918612667,253,31.0499999999993,-2.76539356,11.3,1
278,1,3,0.475721811165353,1.27324800822656,1.59534001940107,12.3640585201811,246,22.8500000000004,-7.77522712,14.15,8
279,1,4,1.0240303533085,1.40216689678409,1.10446616727766,14.368319600697,246,23.5900000000001,-7.77522712,14.15,8
285,1,3,0.888566376062396,1.15577038693528,2.45436926061703,14.8719776774129,256,27.6892100000005,-10.09332153,30,7
287,1,4,0.987953001407487,1.49490860153545,1.59534001940107,14.7624078244935,242,35.0499999999993,-3.96104709,7.15,4
288,1,2,0.911260764799021,1.53850340172854,2.60776733940559,27.5431307562961,240,18.1399999999994,-5.54632457,17.48,2
299,1,4,0.537805591172134,1.26951407665733,1.38058270909708,11.2689431466218,245,77.5800000000008,-9.02056525,12.91,5
302,1,2,0.718076646874891,1.21071181039652,1.77941771394734,1.47906772134438,215,29.1700000000019,-5.13777457,16.74,0
304,1,3,0.381781101540532,1.14501099838544,3.00660234425586,0.439175421795577,245,19.2600000000002,-9.02056525,12.91,5
305,0,0,0.17108520123048,1.0593205186107,2.20893233455532,0.886974539741626,245,17.8400000000001,-9.02056525,12.91,5
306,1,2,0.517110907885238,1.54831607632181,2.42368964485931,1.47823999668002,245,15.7399999999998,-9.02056525,12.91,5
308,1,4,0.926718593962462,1.3378605125333,1.4419419406125,6.57647770616985,242,29.6099999999969,-3.96104709,7.15,4
309,0,0,0.665774977166647,1.05639882880078,1.99417502425133,0.250604515123469,242,30,-3.96104709,7.15,4
310,1,3,0.4133464265596,1.22420406629094,1.04310693576224,13.6771310136854,245,29.1199999999999,-9.02056525,12.91,5
314,0,0,0.604809441518716,1.00652074256485,2.97592272849814,1.33646198420181,243,34.2099999999991,-2.66680196,3.291,5
315,0,0,0.695454224934819,1.02748212672725,2.6384469551633,0.741378967877837,243,26.0200000000004,-2.66680196,3.291,5
316,0,0,0.659709237976183,1.00243662747291,3.00660234425586,0.99425127593627,243,35.9900000000016,-2.66680196,3.291,5
317,0,0,0.615408583141493,1.00259669168611,2.94524311274043,1.16466115703217,243,35.9900000000016,-2.66680196,3.291,5
318,0,0,0.628802133217758,1.02698805204491,2.94524311274043,1.6712240285564,243,34.2200000000012,-2.66680196,3.291,5
319,0,0,0.604123508396222,1.05120801022676,3.25203927031756,0.89042399963703,243,25.6699999999983,-2.66680196,3.291,5
320,0,0,0.657501666295924,1.01946686289774,2.94524311274043,2.17235320593296,243,34.2200000000012,-2.66680196,3.291,5
322,0,0,0.732847984335568,1.04225051341834,2.73048580243644,0.979320576501966,243,27.0999999999985,-2.66680196,3.291,5
324,0,0,0.666413563565454,1.03690153559084,2.69980618667873,1.29015491215601,243,27.4500000000007,-2.66680196,3.291,5
325,0,0,0.623305148208561,1.01704116622997,2.97592272849814,3.9311798962949,243,34.9300000000003,-2.66680196,3.291,5
326,0,0,0.573279890581509,1.03790307246162,2.97592272849814,1.48928949598541,243,26.3799999999974,-2.66680196,3.291,5
327,0,0,0.622629562756274,1.01840788843044,3.22135965455985,6.44318638033802,243,34.9300000000003,-2.66680196,3.291,5
328,1,3,1.06609152546089,1.699522285374,2.66912657092102,0.622558170016506,244,19.96,-8.28548436,13.81,4
330,0,0,0.727538873064388,1.09184821711412,2.36233041334389,52.6742677041477,244,56.25,-7.25364552,26.59,3
331,1,2,0.406294379923383,1.44405760120857,2.79184503395187,12.8131706864555,245,19.6999999999998,-9.02056525,12.91,5
333,1,3,0.940576882961556,1.39735710518081,1.87145656122048,1.43872690936906,244,27.489999999998,-7.25364552,26.59,3
334,0,0,0.616181621722841,1.08806315149648,2.45436926061703,32.7507968747222,215,55,-5.13777457,16.74,0
335,0,0,0.625318464468491,1.09092638949198,2.45436926061703,44.4462169561026,215,54,-5.13777457,16.74,0
336,0,0,0.63266383382034,1.09472821922022,2.45436926061703,62.7615409697604,215,54,-5.13777457,16.74,0
337,0,0,0.61858363998779,1.09562674492118,2.45436926061703,68.9590460447577,215,55,-5.13777457,16.74,0
338,0,0,0.625151180532644,1.09608220703135,2.45436926061703,72.7840574898626,215,54,-5.13777457,16.74,0
339,0,0,0.621398838448013,1.09672072221554,2.45436926061703,76.3531100296906,215,55,-5.13777457,16.74,0
342,1,3,0.791812273413685,1.48033728141185,2.6384469551633,14.5471230866547,244,21.21,-8.28548436,13.81,4
347,0,0,0.736698770360978,1.08902050920947,2.3930100291016,40.3590465514557,245,51.2000000000007,-10.84610777,37.48,6
348,0,0,0.758620288032283,1.01069493477921,2.3930100291016,57.9509283463894,245,24,-10.84610777,37.48,6
351,0,0,0.439421629359639,1.10254642715191,2.30097118182846,1.75361063144327,246,50.0600000000013,-9.19463357,38.59,4
352,1,4,0.891423230335424,1.44000211861199,1.59534001940107,1.72056410604009,246,28.0200000000004,-9.19463357,38.59,4
354,1,3,0.940576882961556,1.39735710518081,1.87145656122048,1.43872690936906,244,27.489999999998,-7.25364552,26.59,3
355,1,4,0.914258110538099,1.17218031843609,2.42368964485931,12.3072450502478,256,27.3148999999976,-10.09332153,30,7
356,1,2,1.60757253156451,2.52261796946545,2.33165079758617,1.92254994364209,240,16.4200000000001,-7.080389145,16.2,3
359,0,0,0.154271896139418,1.07837809625011,1.84077694546277,0.922885580811414,245,21,-9.50571654,21,6
360,1,3,1.06609152546089,1.699522285374,2.66912657092102,0.622558170016506,244,19.96,-8.28548436,13.81,4
361,0,0,0.17640285401371,1.05756507391782,2.20893233455532,0.875610996873071,245,18.1700000000001,-9.02056525,12.91,5
362,1,4,0.379651503334921,1.09802116616494,3.12932080728671,0.39117595494683,245,21.3400000000001,-9.02056525,12.91,5
364,1,3,0.510886742316516,1.57207818559689,1.16582539879309,13.6022671596578,245,21.5900000000001,-9.50571654,21,6
367,1,6,0.685314323281523,1.0746040732876,1.59534001940107,8.04193428312754,245,43.2400000000016,-10.84610777,37.48,6
372,1,5,0.738274984326746,1.24254156327199,2.97592272849814,1.07259290073953,256,34.2353300000032,-10.09332153,30,7
378,1,5,0.775762196198747,1.24556150508122,1.59534001940107,6.11225557617256,256,37.5275899999979,-10.09332153,30,7
381,1,6,0.675035916024098,1.04304538478884,2.33165079758617,0.643688612382133,245,41.7011084199985,-10.84610777,37.48,6
382,1,2,0.820475095015139,1.10367886344342,3.09864119152899,16.3494533527734,215,32.101980970001,-5.13777457,16.74,0
383,1,2,0.869210097958066,1.19015710315976,1.84077694546277,1.54283774421741,215,24.2845268199999,-5.13777457,16.74,0
384,0,0,0.225450682045051,1.07513581970043,2.27029156607075,72.6655743243577,238,49.0300000000007,-3.68065482,13.6,1
385,0,0,0.23115219975694,1.05839190947751,2.33165079758617,6.46524210362651,245,49.5,-9.02056525,12.91,5
387,0,0,0.228496477846251,1.06491234599654,2.36233041334389,11.0835721285163,245,18.9899999999998,-9.02056525,12.91,5
388,0,0,0.17726386175017,1.08887460157312,2.20893233455532,80.3182374421855,240,51.4799999999996,-5.54632457,17.48,2
390,0,0,0.741627103823272,1.12191608023617,2.3930100291016,54.2673417363731,244,54.7299999999996,-7.25364552,26.59,3
391,0,0,0.593855912256219,1.05237830603271,2.17825271879761,33.5053416938381,244,20.0199999999995,-8.28548436,13.81,4
392,0,0,0.151651558642971,1.06302071043711,2.20893233455532,49.4727497522809,244,20.5,-8.28548436,13.81,4
400,1,4,1.01120877164123,1.52600835387648,3.43611696486384,14.9125182910079,242,38,-3.96104709,7.15,4
401,1,2,0.805721704786446,1.29935787739143,1.71805848243192,6.67658477038723,242,41,-3.96104709,7.15,4
402,0,0,0.703783782435726,1.1055212900687,2.76116541819415,4.85474650107803,242,32,-3.96104709,7.15,4
406,0,0,0.417524462779496,1.07612460850075,2.6384469551633,14.0991527960288,253,87.0600000000013,-2.76539356,11.3,1
407,0,0,0.365770456217259,1.09585015987708,2.66912657092102,3.9445087115936,253,44.5200000000004,-2.76539356,11.3,1
698,1,2,0.715622888361309,1.74977740912991,2.91456349698272,17.4957812527291,239,13.1496299999999,-1.239999915,7.068,0
707,1,6,0.439321898962819,1.01321503846788,1.34990309333936,6.89097546020016,245,30.1912430000002,-9.50571654,21,6
719,1,4,1.04145375240004,1.62777244615979,1.62601963515878,16.6574296148494,242,31.4571929999984,-3.96104709,7.15,4
736,1,4,1.07094126339687,1.5111853732857,1.04310693576224,16.0295707481218,246,49.879747,-7.77522712,14.15,8
737,0,0,0.490708157251592,1.07100202482148,2.6384469551633,13.6969976586531,253,85.515625,-2.76539356,11.3,1
748,1,3,0.891970710559586,1.44502265055522,1.62601963515878,8.67147480250284,247,25.7091549999968,-4.11736234,19.79,3
777,0,0,0.760526336568413,1.06314349372011,2.51572849213245,18.2312532524821,256,48.754488999999,-10.09332153,30,7
787,1,4,1.05756577950444,1.50432683046243,1.59534001940107,9.23863034723479,247,27.9752589999989,-4.11736234,19.79,3
821,0,0,0.784127054762231,0.977375721660834,2.36233041334389,53.210950825413,244,31.5202539999991,-7.25364552,26.59,3
841,1,2,0.870411889458811,1.15324888879208,3.12932080728671,15.647614807304,215,33.1192689999989,-5.13777457,16.74,0
842,1,3,0.900691961164381,1.32409519710951,3.06796157577128,13.8679882989078,243,31.1671100000021,-2.66680196,3.291,5
861,0,0,0.457310727881086,1.20875462757821,2.33165079758617,10.5800323611219,239,13.8571679999986,-1.239999915,7.068,0
902,0,0,0.746366890307719,1.11866852575938,2.94524311274043,2.44492490260164,243,23.6663110000009,-2.66680196,3.291,5
906,0,0,0.557682155910496,0.98763888076073,2.6384469551633,10.6418395497204,253,96.7881570000027,-11.85139954,36.57,7
906,0,0,0.501090229071968,0.97526268752667,2.6384469551633,10.1617541592119,253,94.3518679999979,-11.85139954,36.57,7
906,0,0,0.598828676313759,0.940684398239723,2.6384469551633,10.6331845659228,253,82.2379660000006,-11.85139954,36.57,7
906,0,0,0.633263980339497,0.947929267100623,2.6384469551633,11.1410148813905,253,84.8009270000039,-11.85139954,36.57,7
906,0,0,0.524815165870153,1.00036403926518,2.6384469551633,9.96937307326751,253,101.790857,-11.85139954,36.57,7
916,0,0,0.160048216173978,1.05170269704756,2.30097118182846,18.5936213721288,242,19.996255,-8.93926069,21.5,7
934,1,2,0.578817935606939,1.05335708865791,1.62601963515878,5.23221482376926,253,41.6347769999993,-2.76539356,11.3,1
944,1,1,0.516333732217075,1.01708006758569,1.65669925091649,4.43618373309704,253,33.5435550000002,-2.76539356,11.3,1
957,0,0,0.848220902587162,1.02683325480294,2.51572849213245,18.1561018907631,256,23.5720899999978,-10.09332153,30,7
971,1,2,0.934324401881002,1.85730432214252,2.6384469551633,21.4444686821748,240,16.8069990000004,-7.080389145,16.2,3
982,1,4,0.662263711850162,1.23434680603281,1.07378655151995,8.44097388637605,256,29.2072440000011,-10.09332153,30,7
1020,1,2,0.678899003642801,1.02120791708747,2.11689348728218,1.62308392892758,303,46.1593869999997,-1.92352226,7.12,0
1065,1,1,0.360873975088898,1.20629271766356,1.50330117212793,6.67746658833193,238,18.6819180000002,-3.68065482,13.6,1
1114,1,5,0.693332134251062,1.24985199974953,1.04310693576224,8.8872004870952,256,36.815208,-10.09332153,30,7
1116,1,4,1.15513041941124,1.48372926592471,1.04310693576224,15.9224309375814,246,38.1566579999999,-7.77522712,14.15,8
1145,1,3,0.633598114631292,1.05031040483446,3.62019465941011,3.6788913439235,298,55.4260219999996,-4.927546185,6.2,9
1154,1,3,0.896157660753572,1.28141450919171,2.60776733940559,16.1321047790248,244,29.0625499999987,-7.25364552,26.59,3
1161,0,0,0.74505152457483,1.06856490837606,2.3930100291016,39.0062610139173,245,51.7412569999979,-10.84610777,37.48,6
1176,1,4,0.838163632855786,1.3912964144429,3.06796157577128,9.67674565035598,252,26.9149849999994,-8.545958555,21,8
1262,1,3,1.17515141251948,1.53253435456412,1.59534001940107,13.9857905087212,245,26.1353950000002,-9.50571654,21,6
1263,1,2,1.09749604584792,1.65903072691764,2.66912657092102,13.5848879785874,245,17.7606310000001,-9.02056525,12.91,5
1266,1,2,0.56730917968159,1.0709585303615,1.59534001940107,5.13748619189785,253,40.5438159999976,-2.76539356,11.3,1
1268,0,0,0.138246456050519,1.07549571014423,2.20893233455532,28.9089316224279,245,21.314421,-9.50571654,21,6
1288,0,0,0.699992932288521,1.05690364884351,1.50330117212793,2.43335153811272,243,28.6234600000025,-2.66680196,3.291,5
1292,1,4,0.975707209206997,1.40662105655069,1.38058270909708,8.48397061658064,247,35.6944750000002,-4.11736234,19.79,3
1302,1,4,0.72617868765012,1.28343496848935,3.3440781175907,14.4367249284607,245,38.1860340000021,-10.84610777,37.48,6
1318,1,2,0.936333521828641,1.41134709781247,1.59534001940107,11.4535472298806,238,19.2734079999991,-3.68065482,13.6,1
1320,1,3,0.586789391500418,0.950296628572316,3.28271888607527,6.79135291107194,280,72.443220000001,-1.47410408,7.66,0
1320,1,3,0.65199404507762,0.93889227535231,3.25203927031756,6.01228771489487,280,69.8977720000039,-1.47410408,7.66,0
1320,1,3,0.580476976201969,0.951999392285583,3.28271888607527,7.0608221334666,280,77.6203299999979,-1.47410408,7.66,0
1320,1,3,0.607116530805371,0.950803447151282,3.25203927031756,7.75164823907907,280,71.5894459999981,-1.47410408,7.66,0
1320,1,3,0.622461322823049,0.941048160943292,3.28271888607527,6.14140011833582,280,69.7907130000021,-1.47410408,7.66,0
1335,0,0,0.253339223916101,1.07108310384498,2.23961195031304,29.0905183666306,238,25.9634640000004,-3.68065482,13.6,1
1348,1,5,0.814874222521871,1.24397425555614,1.07378655151995,7.80750019973777,256,36.189878000001,-10.09332153,30,7
1356,1,3,0.585002618421348,0.987847788408925,3.31339850183298,8.03552959372445,279,60.7602909999987,-4.629217697,10.15,5
1356,1,3,0.584293274561294,0.983496451430321,3.31339850183298,8.32280626970254,279,58.3719629999978,-4.629217697,10.15,5
1356,1,3,0.557956944634005,0.989576827371091,3.3440781175907,7.92296379506714,279,61.6629359999934,-4.629217697,10.15,5
1368,1,4,0.608445972626992,1.07547461008452,3.49747619637926,5.42777720481481,288,54.6424610000031,-4.77656965,5.46,22
1381,0,0,0.848664412477008,1.0628544365227,2.85320426546729,13.1236516153125,252,22.0380379999988,-8.545958555,21,8
1391,0,0,0.1498896682075,1.05586874047792,2.20893233455532,35.7465586722654,244,20.5542940000005,-8.28548436,13.81,4
1399,0,0,0.702676749157109,1.11261911235036,2.66912657092102,7.56868916911022,247,24.7653939999982,-4.11736234,19.79,3
1420,1,4,0.966486064521173,1.2865690952829,3.19068003880213,23.6009203798508,246,28.9856260000015,-9.19463357,38.59,4
1431,0,0,0.792770708360182,0.98940062473247,2.45436926061703,33.6672750214554,215,30.0809670000017,-5.13777457,16.74,0
1461,0,0,0.468176628142371,0.918071266839778,2.54640810789016,23.6482406321117,257,93.7027079999971,-12.95880062,52.31,6
1461,0,0,0.637945871509334,0.94893673427609,2.51572849213245,21.7967584489193,257,104.150775999995,-12.95880062,52.31,6
1461,0,0,0.502838700923769,0.854503486131844,2.51572849213245,23.2792046726675,257,86.8876199999941,-12.95880062,52.31,6
1461,0,0,0.488488454795195,0.868188898136334,2.51572849213245,22.9130613264019,257,88.2228319999995,-12.95880062,52.31,6
1461,0,0,0.667116689876474,0.972719835212176,2.48504887637474,23.1448533996282,257,111.595813000007,-12.95880062,52.31,6
1461,0,0,0.522628503312189,0.949429157164814,2.51572849213245,22.9379822238004,257,99.7950730000011,-12.95880062,52.31,6
1461,0,0,0.573474652683495,0.993201514416955,2.51572849213245,22.7019357155918,257,114.937030000001,-12.95880062,52.31,6
1461,0,0,0.668831883852232,0.932697761017474,2.51572849213245,23.1942995035142,257,100.477718000009,-12.95880062,52.31,6
1461,0,0,0.45148292692473,0.97773651867546,2.54640810789016,24.5303476392177,257,104.465152999997,-12.95880062,52.31,6
1461,0,0,0.556156105942358,0.802925520986215,2.51572849213245,23.4699569144046,257,82.2544839999901,-12.95880062,52.31,6
1468,1,4,0.470073122613873,1.25710322723615,1.34990309333936,4.76010056339649,242,53.9475140000004,-8.93926069,21.5,7
1478,1,4,0.685828517492333,1.26149531957598,1.04310693576224,11.4826691628006,256,28.1242280000006,-10.09332153,30,7
1485,0,0,0.188966279659193,1.00749488712413,2.17825271879761,39.2746618168519,240,25.9792579999994,-7.080389145,16.2,3
1491,1,3,0.519896259171524,1.36798825829004,1.53398078788564,10.8287442695402,246,55.8328890000003,-7.77522712,14.15,8
1509,0,0,0.803028968464098,1.13511275278534,2.36233041334389,53.9904012062198,244,53.9269889999996,-7.25364552,26.59,3
1539,1,3,1.0036211821812,1.43838602824937,2.69980618667873,10.9843797032177,245,18.866978,-9.02056525,12.91,5
1547,1,5,0.633028141969421,0.971896466972717,1.71805848243192,3.07062994921354,253,86.7372449999966,-11.85139954,36.57,7
1547,1,5,0.454953210582737,0.980339344268531,1.31922347758165,3.72784280025553,253,86.2075039999909,-11.85139954,36.57,7
1547,1,5,0.633349380400187,0.977206040689985,3.65087427516783,2.92862367248126,253,86.575674000007,-11.85139954,36.57,7
1547,1,5,0.555167321615783,0.953662303224417,1.28854386182394,2.87849795751907,253,79.8660839999939,-11.85139954,36.57,7
1547,1,5,0.508882064840686,0.964494234812254,1.28854386182394,3.37444277537662,253,82.3310190000047,-11.85139954,36.57,7
1547,1,5,0.552691544053828,0.976884524014422,1.68737886667421,2.96248304348083,253,88.3254370000068,-11.85139954,36.57,7
1547,1,5,0.741288809758521,0.945928335564628,1.28854386182394,3.38688751124398,253,79.6948929999926,-11.85139954,36.57,7
1547,1,5,0.550252235439931,0.972133078596364,1.28854386182394,4.04606176827616,253,84.7033290000109,-11.85139954,36.57,7
1551,1,2,1.21585850891549,1.35884858006838,1.16582539879309,10.7089025204391,246,73.2032610000006,-7.77522712,14.15,8
1563,1,3,0.828352294277737,1.25642021768655,2.60776733940559,15.7953045294236,244,32.8552340000024,-7.25364552,26.59,3
1583,0,0,0.206578255755723,1.06113905055409,2.36233041334389,7.60939013385468,245,19.435536,-9.02056525,12.91,5
1589,1,2,0.391958850706134,1.17704329871605,2.66912657092102,23.3100812045076,256,27.7753100000009,-10.09332153,30,7
1592,1,2,0.924588508405641,1.49314800497358,1.59534001940107,12.2523196468268,238,17.4247639999994,-3.68065482,13.6,1
1620,0,0,0.81166121481849,1.14334704892955,2.76116541819415,5.15349420324149,242,27.3482120000008,-3.96104709,7.15,4
1622,1,6,0.617977327114415,1.10538461388299,3.22135965455985,7.21206256673981,245,42.8443259999986,-10.84610777,37.48,6
1636,0,0,0.263061732672242,1.07491560504979,2.23961195031304,29.0531836778414,238,48.5163810000013,-3.68065482,13.6,1
1637,1,2,0.950368766995174,1.2290339978154,2.6384469551633,23.6834090857202,256,27.2771350000003,-10.09332153,30,7
1659,1,2,0.978596910026217,1.72093521924035,2.6384469551633,18.238396359916,240,17.8406839999998,-7.080389145,16.2,3
1675,1,2,0.918836740387293,1.80421843622949,2.60776733940559,32.3607941326909,240,16.8457660000004,-5.54632457,17.48,2
1682,1,2,0.64556775110254,1.70895339539089,2.88388388122501,17.4970979240244,239,13.3170380000011,-1.239999915,7.068,0
1703,1,2,1.01290341474102,1.76939879658253,2.60776733940559,31.3213761652728,240,16.8632809999999,-5.54632457,17.48,2
1704,0,0,0.279171969476713,1.04236256832053,2.54640810789016,15.5697329467463,246,20.3709440000002,-7.77522712,14.15,8
1741,0,0,0.75808480109557,1.0756637764596,2.85320426546729,13.0611187006698,252,39.2279830000007,-8.545958555,21,8
1744,1,4,0.577719997581599,0.963395166753592,1.50330117212793,6.79443208778214,257,101.145579000004,-12.95880062,52.31,6
1744,1,4,0.585255721819646,0.947831673437092,1.47262155637022,6.73700718093493,257,96.3869689999992,-12.95880062,52.31,6
1744,1,4,0.612199778638419,0.946199463625432,2.27029156607075,6.80277851917307,257,91.197027000002,-12.95880062,52.31,6
1744,1,4,0.664336029808184,0.941361409379861,2.23961195031304,6.10667747447796,257,91.1709080000001,-12.95880062,52.31,6
1744,1,4,0.587421251992082,0.95943628223433,1.50330117212793,6.7529654601689,257,101.312708999991,-12.95880062,52.31,6
1744,1,4,0.59850916292325,0.923540164485422,1.47262155637022,6.76760885424616,257,92.4782699999923,-12.95880062,52.31,6
1744,1,4,0.591903291356179,0.953097260038406,2.23961195031304,6.16895469817756,257,98.1954879999976,-12.95880062,52.31,6
1744,1,4,0.629448485462519,0.959648697153422,2.23961195031304,6.35861980706398,257,96.0024649999978,-12.95880062,52.31,6
1744,1,4,0.541935431255447,0.958610015995193,1.56466040364335,5.91681361697697,257,98.7945680000121,-12.95880062,52.31,6
1744,1,4,0.631534430513037,0.960624344164093,2.23961195031304,5.99620468928031,257,101.090085999997,-12.95880062,52.31,6
1747,1,2,0.952368028522347,1.37043061280382,3.22135965455985,5.54385472224959,242,29.362089000002,-3.96104709,7.15,4
1759,0,0,0.66433299827489,1.05686309169927,2.6384469551633,7.29816842147071,247,34.426277999999,-4.11736234,19.79,3
1778,1,5,1.02548139208637,1.57950206076449,1.38058270909708,10.4904243753144,247,29.9767649999994,-4.11736234,19.79,3
1790,1,3,0.580050901833218,1.01142474688557,3.52815581213697,4.42276564861617,295,57.5184169999993,-4.76235134,7.14,10
1793,1,1,0.408438626635075,1.03083884393827,1.62601963515878,4.6411152701941,253,31.720057999999,-2.76539356,11.3,1
1797,1,4,0.393656501020604,1.34986588615116,1.04310693576224,13.9156290621873,245,22.2486699999999,-9.02056525,12.91,5
1810,1,3,0.538226201375692,1.42895016499089,1.62601963515878,10.9389170386137,242,31.8189359999997,-8.93926069,21.5,7
1875,1,5,0.385240257206332,1.14057417809874,1.56466040364335,6.57918471219544,242,29.7911399999994,-8.93926069,21.5,7
1906,1,3,0.55141345313761,1.00428795727365,3.37475773334841,8.38528216750179,287,62.3134129999962,-1.82958684,9.21,7
1906,1,3,0.592647712688768,1.00385527856327,3.3440781175907,7.22300813731682,287,62.2376480000021,-1.82958684,9.21,7
1928,1,3,0.603345225303817,0.967960538876056,3.28271888607527,7.68790777781302,283,69.3185989999984,-4.563633745,19.9,2
1928,1,3,0.633245422483384,0.965696618084591,3.28271888607527,7.31700021837907,283,70.659845000002,-4.563633745,19.9,2
1928,1,3,0.625841821508603,0.971201271767198,3.28271888607527,7.31628258673976,283,70.0791129999998,-4.563633745,19.9,2
1928,1,3,0.582182157380855,0.927746099951767,3.28271888607527,7.65218546169091,283,62.1667159999997,-4.563633745,19.9,2
1995,1,2,0.884134466913452,1.26244051624188,1.77941771394734,5.50965105118688,242,36.5169829999977,-3.96104709,7.15,4
1998,0,0,0.719274753553801,1.07419189449462,2.69980618667873,4.11209645233541,242,35.245984000001,-3.96104709,7.15,4
2006,1,4,0.823672628938438,1.26477277314737,3.3440781175907,14.5333807275913,245,31.9515290000018,-10.84610777,37.48,6
2025,1,5,0.967598127947302,1.47079267215992,1.04310693576224,18.46276080563,247,36.0628959999995,-4.11736234,19.79,3
2036,1,4,0.807150465747125,1.46847801786661,1.65669925091649,18.1063339630039,242,37.6507559999991,-3.96104709,7.15,4
2055,1,4,0.816244279862095,1.41797151967354,3.06796157577128,9.96854276038159,252,26.0401329999986,-8.545958555,21,8
2060,0,0,0.795702946418147,1.01303945198554,2.36233041334389,39.1418319556755,245,23.8369159999966,-10.84610777,37.48,6
2070,0,0,0.383794375132631,1.08215471909521,2.6384469551633,14.1020725001935,253,51.8058469999996,-2.76539356,11.3,1
2077,1,3,0.845526549554251,1.22492585795239,2.57708772364788,9.63870342721415,256,29.3491919999979,-10.09332153,30,7
2086,1,2,0.901869495449624,1.17180381445318,3.12932080728671,16.4439259868663,215,29.409507999997,-5.13777457,16.74,0
2092,1,3,0.674100813335784,1.1946379842709,2.57708772364788,9.53872800918081,256,29.8358210000006,-10.09332153,30,7
2094,1,1,0.471212759178416,1.18555612745498,1.47262155637022,6.7339523222795,238,18.6913779999995,-3.68065482,13.6,1
2109,0,0,0.440823363748441,1.19799607592302,2.30097118182846,10.8352825771145,239,14.2516300000007,-1.239999915,7.068,0
2114,1,4,1.17849880207041,1.47230217756794,1.04310693576224,15.4110486800406,246,21.4505589999999,-7.77522712,14.15,8
2139,1,4,0.593659563012325,1.24059984088391,3.22135965455985,23.0165216523754,246,31.4873130000014,-9.19463357,38.59,4
2155,1,6,0.753499461998422,1.09988189376892,3.19068003880213,6.7836843129995,245,42.3079690000013,-10.84610777,37.48,6
2169,0,0,0.397568308289265,1.10180938735749,2.48504887637474,33.6819893548189,215,54.492588000001,-5.13777457,16.74,0
2179,0,0,0.145421862140902,1.00831960994043,2.20893233455532,39.5678330781446,240,25.2629800000004,-7.080389145,16.2,3
2195,1,6,0.553320666492195,0.967569587453383,1.28854386182394,3.90815379571035,257,98.685197999992,-12.95880062,52.31,6
2195,1,6,0.530097119794708,0.913671336672448,1.34990309333936,6.24044335115014,257,89.6699019999942,-12.95880062,52.31,6
2195,1,6,0.589342771315035,0.94899716416247,1.31922347758165,5.34709465597081,257,94.9291369999992,-12.95880062,52.31,6
2195,1,6,0.706518540887116,0.939681668153634,1.25786424606623,5.62024534886363,257,94.4708380000084,-12.95880062,52.31,6
2195,1,6,0.663315946504186,0.974539926648943,1.31922347758165,5.18965115298383,257,102.943752000007,-12.95880062,52.31,6
2195,1,6,0.491127156950842,0.970408763847779,1.34990309333936,6.02674174097631,257,96.139388999989,-12.95880062,52.31,6
2195,1,6,0.593085662471891,0.983662831873732,1.34990309333936,6.33773760602686,257,104.563026000003,-12.95880062,52.31,6
2195,1,6,0.576838360290173,0.951266098789072,1.34990309333936,4.99379978580007,257,94.4986980000103,-12.95880062,52.31,6
2195,1,6,0.693444931577103,0.909058231127195,1.34990309333936,5.35465360721202,257,89.9346930000029,-12.95880062,52.31,6
2195,1,6,0.579916496715756,0.972761470435398,1.34990309333936,3.85184098192721,257,100.586519999997,-12.95880062,52.31,6
2204,1,3,0.89700768767964,1.43710829134819,3.09864119152899,13.9770786246221,243,26.5881929999996,-2.66680196,3.291,5
2215,1,2,1.00916848514919,1.49727972035089,2.69980618667873,9.31626975226948,244,17.7045509999998,-8.28548436,13.81,4
2223,1,3,0.874753321253665,1.32812547979526,1.04310693576224,11.2791031556916,247,34.384697999998,-4.11736234,19.79,3
1,1,3,1.22183584186161,2.22561128610428,1.38058270909708,16.456217726563,188,14.3929999999982,-4.650889115,24.44,3
2,1,3,1.30701021062449,2.22484536038187,1.38058270909708,16.1939574872452,188,15.0049999999992,-4.650889115,24.44,3
3,1,3,1.38892882075872,2.2271919139462,1.38058270909708,16.4195057929963,188,14.6990000000005,-4.650889115,24.44,3
5,1,3,1.30896291144031,1.87177097011026,1.38058270909708,14.7970436428032,188,15.0079999999998,-4.650889115,24.44,3
6,1,3,1.34047998096391,1.87099922647468,1.38058270909708,14.7357171261927,188,15.0079999999998,-4.650889115,24.44,3
7,1,5,1.65498880159709,2.47283614574569,1.04310693576224,28.7851028492878,188,15.628999999999,-4.650889115,24.44,3
8,1,5,1.66007607047813,2.48019584070094,1.04310693576224,28.8002986140069,188,15.628999999999,-4.650889115,24.44,3
9,1,5,1.72247162185264,2.48321257385199,1.04310693576224,28.2148732826182,188,15.628999999999,-4.650889115,24.44,3
10,1,5,1.71761578637739,2.4861970244399,1.04310693576224,27.7814307936134,188,15.3230000000003,-4.650889115,24.44,3
11,1,5,1.77482261546855,2.49833367508567,1.04310693576224,27.2209738885636,188,15.3230000000003,-4.650889115,24.44,3
12,1,5,1.75755621560857,2.49698210338994,1.04310693576224,27.4923582039636,188,15.3230000000003,-4.650889115,24.44,3
13,1,3,1.20253452974549,1.48980489028124,1.56466040364335,14.631743430812,245,20.7970000000005,-9.50571654,21,6
14,1,3,1.20339286642423,1.4891088449862,1.59534001940107,14.7256088768735,245,20.7970000000005,-9.50571654,21,6
15,1,3,1.20394380751913,1.49121972567032,1.59534001940107,14.9104545092642,245,20.7970000000005,-9.50571654,21,6
16,1,3,0.491365068809227,1.36386417087757,2.57708772364788,17.4885159119962,245,53.8329999999996,-9.50571654,21,6
17,1,3,1.18058350127538,1.53198451346841,1.56466040364335,13.7616415254565,245,22.299,-9.50571654,21,6
18,1,3,1.15703089176452,1.53086705119416,1.56466040364335,14.7426088690727,245,22.299,-9.50571654,21,6
19,1,3,1.17269865758473,1.5320896796591,1.56466040364335,14.3067064147994,245,22.299,-9.50571654,21,6
20,1,4,1.13200660136261,1.42575197146099,1.28854386182394,16.939885841828,245,52.8530000000001,-9.50571654,21,6
21,1,4,1.13495028835083,1.42886339558735,1.25786424606623,14.0554050607032,245,52.8530000000001,-9.50571654,21,6
22,1,4,1.1417270703352,1.43615297482754,1.28854386182394,15.4222827774566,245,52.8530000000001,-9.50571654,21,6
23,1,4,1.12400098486957,1.43761239807495,1.28854386182394,15.3538511522141,245,52.8530000000001,-9.50571654,21,6
24,1,4,1.12725641750181,1.43469987423913,1.28854386182394,13.2375958312964,245,52.8530000000001,-9.50571654,21,6
25,1,4,1.14017509060779,1.43237857686263,1.28854386182394,12.1705489669857,245,52.8530000000001,-9.50571654,21,6
26,1,2,0.698148838072392,1.1007040319041,3.03728196001357,47.2026162625705,249,68.9830000000002,-0.812174225,6.21,0
27,1,2,0.667826374038181,1.10607643190911,3.03728196001357,50.4354649583927,249,67.0780000000013,-0.812174225,6.21,0
28,1,2,0.636652618265708,1.1075023188234,3.06796157577128,50.8508961052055,249,68.9880000000012,-0.812174225,6.21,0
29,1,2,0.785529889669098,1.32297162846048,1.04310693576224,14.6622666793015,238,14.3760000000002,-3.68065482,13.6,1
30,1,3,1.06276939609129,1.63977459633225,2.60776733940559,31.8293439121557,240,15.5020000000004,-5.54632457,17.48,2
31,1,3,1.06836103013588,1.63965223767704,2.60776733940559,31.986588571672,240,15.5010000000002,-5.54632457,17.48,2
32,1,3,1.35974187145799,2.09225932767074,1.38058270909708,19.1667768617979,188,15.1579999999994,-4.650889115,24.44,3
33,1,3,1.4103605235796,2.089905633654,1.38058270909708,18.8955124157076,188,14.3979999999992,-4.650889115,24.44,3
34,1,3,1.12852673163043,2.09947305560536,1.38058270909708,20.3154273525433,188,14.3979999999992,-4.650889115,24.44,3
35,1,5,1.53311455028418,2.3098347072556,1.04310693576224,32.1347744035803,188,14.393,-4.650889115,24.44,3
36,1,5,1.57768640495412,2.30963042643303,1.04310693576224,31.6861832002455,188,14.393,-4.650889115,24.44,3
37,1,5,1.26244329176714,2.31051099189216,1.04310693576224,35.4118781018679,188,14.393,-4.650889115,24.44,3
38,1,3,0.463619817053019,1.30374680998502,1.65669925091649,22.7248110652394,245,22.7240000000002,-9.50571654,21,6
39,1,3,0.470821716206868,1.38341532149557,1.65669925091649,22.7699877307246,245,25.9549999999999,-9.50571654,21,6
40,1,3,0.480947152640905,1.30548038209654,1.65669925091649,22.771195403156,245,21.9700000000003,-9.50571654,21,6
41,1,3,0.807249486598992,1.50921378005165,1.04310693576224,24.4744026307234,244,19.6298000000006,-8.28548436,13.81,4
42,1,2,0.969815436991341,1.48893516789701,1.04310693576224,11.5495516040294,244,17.0465999999997,-8.28548436,13.81,4
43,0,0,0.167853232170412,1.07052167233009,2.20893233455532,37.1291211154228,244,20.4376999999995,-8.28548436,13.81,4
44,1,3,0.936665812167917,1.31913175279474,2.33165079758617,1.1834132645374,245,19.0150000000003,-9.02056525,12.91,5
45,1,3,0.944182552043934,1.32930360088072,2.33165079758617,1.15695335234935,245,19.3190000000004,-9.02056525,12.91,5
46,1,3,0.993885164493728,1.34571255834711,2.33165079758617,1.12642121282186,245,19.0150000000003,-9.02056525,12.91,5
47,1,4,0.507855999444201,1.17635496448272,1.84077694546277,1.07016072137774,245,20.3320000000003,-9.02056525,12.91,5
48,1,4,0.557282539311111,1.19524963980283,1.81009732970506,1.11228823337108,245,20.3320000000003,-9.02056525,12.91,5
49,1,4,0.554171996962972,1.18953052003643,1.81009732970506,1.066548628672,245,20.3320000000003,-9.02056525,12.91,5
50,1,2,0.489376777028028,1.30266342607704,2.73048580243644,1.88336961979409,245,15.6719999999996,-9.02056525,12.91,5
51,1,2,0.496948672510778,1.30883875558635,2.76116541819415,1.96567739909847,245,15.6700000000001,-9.02056525,12.91,5
52,1,2,0.419312193624042,1.32482978579161,2.76116541819415,1.98100387480177,245,15.973,-9.02056525,12.91,5
53,0,0,0.180710631979984,1.10478333312699,2.20893233455532,40.0686296427026,240,167.393,-7.080389145,16.2,3
54,0,0,0.297883239389936,1.07447656051143,2.23961195031304,28.3999740924418,238,49.4590000000007,-3.68065482,13.6,1
55,0,0,0.156059033719588,1.06015032633779,2.23961195031304,32.8250819384117,244,20.6999999999998,-8.28548436,13.81,4
56,0,0,0.273232493211414,1.07017970209681,2.23961195031304,30.731434600586,238,48.2140613329993,-3.68065482,13.6,1
57,0,0,0.146012635422361,1.04522803082791,2.23961195031304,37.5098937636308,244,43.025928,-8.28548436,13.81,4
58,0,0,0.194602367039851,1.04982190067331,2.23961195031304,17.5271623734952,242,20.2600170000005,-8.93926069,21.5,7
59,0,0,0.271526437306286,1.06718368998921,2.23961195031304,30.1783681472573,238,48.8089999999993,-3.68065482,13.6,1
60,0,0,0.142066272245668,1.05884758671518,2.23961195031304,34.024809581312,244,20,-8.28548436,13.81,4
61,0,0,0.174803661025069,1.08227330596185,2.20893233455532,44.4778796689689,240,50.8089999999993,-5.54632457,17.48,2
62,0,0,0.173435634009798,1.08213606921133,2.20893233455532,44.4741205106422,240,50.8089999999993,-5.54632457,17.48,2
63,0,0,0.789202461189196,1.08734975970646,2.36233041334389,41.6800119055157,245,49.9318170000006,-10.84610777,37.48,6
64,1,2,0.453575299092035,1.34780771388108,3.43611696486384,13.7164975621354,284,19.996000000001,-1.6828136,7.43,0
65,1,2,0.457364298759492,1.34954099221252,3.43611696486384,14.4976378484343,284,21.0290000000005,-1.6828136,7.43,0
66,1,2,0.591048451360753,1.3507239763526,3.40543734910612,13.3117132789074,284,21.3780000000006,-1.6828136,7.43,0
67,1,2,0.796599153851462,1.30077693981802,2.08621387152447,6.03565723462505,284,19.9940000000006,-1.6828136,7.43,0
68,1,2,0.791701939093953,1.30103382734294,2.08621387152447,6.18908679402263,284,19.9940000000006,-1.6828136,7.43,0
69,1,2,0.787602944337007,1.30121208075237,2.08621387152447,6.1860056906517,284,19.9940000000006,-1.6828136,7.43,0
70,1,3,0.926077863414396,1.38482586921206,1.04310693576224,17.5239054555534,242,20.7430000000004,-8.93926069,21.5,7
71,1,5,0.371321566882038,1.12244802820948,1.34990309333936,13.776264351585,242,27.2490000000007,-8.93926069,21.5,7
72,1,4,0.454939046651275,1.12808675292385,1.34990309333936,8.71650699027837,242,19.5030000000006,-8.93926069,21.5,7
73,1,2,0.243294817653832,1.14359440002386,1.62601963515878,15.3607835886368,242,24.2709999999997,-8.93926069,21.5,7
74,0,0,0.174022630137531,1.04600283152613,2.30097118182846,18.8408100783139,242,19.5039999999999,-8.93926069,21.5,7
75,0,0,0.412511609298239,1.2163819317866,2.30097118182846,15.5139652792127,239,13.9745790000015,-1.239999915,7.068,0
76,1,2,0.959316705724921,2.11326895398026,1.04310693576224,26.8106530212795,239,8.39916000000085,-1.239999915,7.068,0
"""