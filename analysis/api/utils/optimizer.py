#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
#          Last Update: Q3 2023
# ________________________________________________________________________________________________
# Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
#          Jun Fujima (Former Lead Developer) [2018-2021]
# ________________________________________________________________________________________________
# Description: Serverside (Django) rest api utils for the 'Analysis' page involving
#              'regression' components
# ------------------------------------------------------------------------------------------------
# Notes:  This is one of the REST API parts of the 'analysis' interface of the website that
#         allows serverside work for the 'regression' component.
# ------------------------------------------------------------------------------------------------
# References: logging, numpy, pandas and sklearn libs
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
import logging
import numpy as np
from doptools.optimizer import launch_study, methods, calculate_descriptor_table
from doptools.chem.solvents import available_solvents
from chython import smiles
import pandas as pd
from scipy.sparse import csr_matrix
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import MinMaxScaler
from sklearn.feature_selection import VarianceThreshold
from sklearn.svm import SVR
from sklearn.ensemble import RandomForestRegressor

logger = logging.getLogger(__name__)
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
methods_dict = {'Morgan_fingerprints': ['morgan', {'nBits': 1024, 'radius': 2}],
                'Morgan_features': ['morganfeatures', {'nBits': 1024, 'radius': 2}],
                'RDKit_Fingerprints': ['rdkfp', {'nBits': 1024, 'radius': 3}],
                'RDKit_Linear_Fingerprints': ['rdkfplinear', {'nBits': 1024, 'radius': 3}],
                'Layered': ['layered', {'nBits': 1024, 'radius': 3}],
                'Avalon': ['avalon', {'nBits': 1024}],
                'Torsion': ['torsion', {'nBits': 1024}],
                'Atom_Pairs': ['atompairs', {'nBits': 1024}],
                'Circus': ['circus', {'lower': 1, 'upper': 2}],
                'Linear_fragments': ['chyline', {'lower': 2, 'upper': 5}],
                'Mordred_2D': ['mordred2d', {}],
                }


def get_descriptors_and_transformer(data, df, df_target):
    method = data['view']['settings']['method']
    if method not in methods_dict.keys():
        raise ValueError("Descriptors type is not allowed")
    descriptors_name = methods_dict[method][0]

    method_args = data['view']['settings']['methodArguments']
    if 'arg1' in method_args.keys() and len(methods_dict[method][1]) >= 1:
        methods_dict[method][1][list(methods_dict[method][1].keys())[0]] = int(method_args['arg1'])
    if 'arg2' in method_args.keys() and len(methods_dict[method][1]) >= 2:
        methods_dict[method][1][list(methods_dict[method][1].keys())[1]] = int(method_args['arg2'])
    parameters_dict = methods_dict[method][1]
    if 'lower' in parameters_dict and 'upper' in parameters_dict \
       and int(method_args['arg1']) > int(method_args['arg1']):
        raise ValueError("Lower value is higher than Upper value in Descriptors settings")

    mols = pd.DataFrame({x: smiles2mols(df[x].to_list()) for x in data['view']['settings']['featureColumns']})
    indices = list(df_target[pd.notnull(df_target)].index)
    df_target = np.array(df_target)
    if len(indices) != len(mols):
        raise ValueError("Some molecule don't have a property value")
    input_dict = {'structures': mols,
                  'prop1': {'indices': indices,
                            'property': df_target,
                            'property_name': data['view']['settings']['targetColumn']}}
    if 'numericalFeatureColumns' in data['view']['settings'] and data['view']['settings']['numericalFeatureColumns']:
        df_nfc = df[data['view']['settings']['numericalFeatureColumns']]
        try:
            if not np.array_equal(df_nfc, df_nfc.astype(float)):
                raise ValueError()
        except ValueError:
            raise ValueError("Some values are not numerical in Numerical column(s): ", ", ".join(str(x) for x in df_nfc.columns))
        input_dict['passthrough'] = df_nfc

    if 'solventColumn' in data['view']['settings'] and data['view']['settings']['solventColumn']:
        df_sc = df[data['view']['settings']['solventColumn']]
        bad_solvents = [x for x in df_sc if x not in available_solvents]
        if bad_solvents:
            display_solvents = (", ".join(bad_solvents) if len(bad_solvents) < 11
        else ", ".join(bad_solvents[:10])+f", ...and {len(bad_solvents) - 10} more")
            raise ValueError(f"Unknown solvent(s): {display_solvents}. Please refer to solvents supported in DOPtools.")
        input_dict['solvents'] = df_sc

    result = calculate_descriptor_table(input_dict, descriptors_name, parameters_dict)
    return result['prop1']['table'], result['prop1']['calculator']  # descriptors, transformer


def split_dataset(data):
    df = pd.DataFrame(data['data'])
    if 'external_validation' in data['view']['settings'] and data['view']['settings']['external_validation'] \
       and 'external_validation_from' in data['view']['settings'] \
       and data['view']['settings']['external_validation_from']:
        separate_from = int(data['view']['settings']['external_validation_from'])
        if separate_from > int(len(df)):
            raise ValueError("External validation stating ID is higher than the number of available data !")
        df_train = df.iloc[:separate_from]
        df_test = df.iloc[separate_from:]
    else:
        df_train = df
        df_test = None
    return df_train, df_test


def smiles2mols(smiles_list):
    mols = []
    for x in smiles_list:
        mol = smiles(x)
        if mol:
            try:
                mol.canonicalize(fix_tautomers=False)
            except:  # Magic trick of chython
                mol.canonicalize(fix_tautomers=False)
            mols.append(mol)
        else:
            raise ValueError("The SMILES string " + str(x) + " could not be parsed")
    return mols


def get_model(data):
    target_column = data['view']['settings']['targetColumn']
    p_name = target_column + '--Predicted'

    df_train, df_test = split_dataset(data)
    df_target = df_train[target_column]
    y_train = df_target.values

    raw_desc, _ = get_descriptors_and_transformer(data, df_train, df_target)
    # desc = pd.DataFrame(raw_desc).to_dict('records')
    for_opt = {'desc1': csr_matrix(raw_desc.values)}

    ml_method = data['view']['settings']['MLmethod']
    if ml_method not in ["SVR", "RFR"]:  # "XGBR"]:
        raise ValueError("ML method not supported")
    cv_splits = int(data['view']['settings']['CVsplits'])
    if cv_splits > int(len(df_train)):
        raise ValueError("The number of #CV splits is higher than the number of available data")
    cv_repeats = int(data['view']['settings']['CVrepeats'])
    trials = int(data['view']['settings']['trials'])

    st, stats = launch_study(for_opt, pd.DataFrame(df_target), "", ml_method, trials, cv_splits,
                             cv_repeats, 5, 60, (0, 1), False)
    rebuild_trial = st.sort_values(by='score', ascending=False).iloc[0]
    print("Required/done/best", trials, len(st), rebuild_trial['trial'])
    print("BEST:", rebuild_trial)

    scores_df = stats[rebuild_trial['trial']]['score'].iloc[0]
    scores = {"R2": format(scores_df.R2, '.3f'),
              "RMSE": format(scores_df.RMSE, '.3f'),
              "MAE": format(scores_df.MAE, '.3f'), }

    params = rebuild_trial[rebuild_trial.index[list(rebuild_trial.index).index('method') + 1:]].to_dict()
    params["method"] = rebuild_trial['method']
    params["scaling"] = rebuild_trial['scaling']
    result = {'data': data, 'scores': scores, 'params': params}

    # Training set (CV predictions)
    result['d1'] = {target_column: y_train,
                    p_name: np.mean(stats[rebuild_trial['trial']]['predictions'].iloc[:, 2:], axis=1), }

    # Test set if specified
    if df_test is None:
        result['d2'] = {target_column: [], p_name: [], }
        result['first_test'] = len(y_train)

    else:
        data_rebuild = data.copy()
        data_rebuild['view']['params'] = params
        _, model = get_model_rebuild(data_rebuild)
        dict_pred = {x: smiles2mols(df_test[x].to_list()) for x in data['view']['settings']['featureColumns']}
        if 'numericalFeatureColumns' in data['view']['settings'] and data['view']['settings']['numericalFeatureColumns']:
            dict_pred.update({x: df_test[x].to_list() for x in data['view']['settings']['numericalFeatureColumns']})
        if 'solventColumn' in data['view']['settings'] and data['view']['settings']['solventColumn']:
            dict_pred.update({data['view']['settings']['solventColumn']: df_test[data['view']['settings']['solventColumn']].to_list()})
        df_pred = pd.DataFrame(dict_pred)

        res = model.predict(df_pred)
        y_test = df_test[target_column].values
        result['d2'] = {target_column: y_test, p_name: res, }
        result['params']["method"] = rebuild_trial['method']  # Has to give it again since removed by rebuilder
        result['params']["scaling"] = rebuild_trial['scaling']
        result['first_test'] = int(data['view']['settings']['external_validation_from'])

    return result, None


def get_model_rebuild(data):
    method = data['view']['params'].pop('method')
    scaling = data['view']['params'].pop('scaling')

    target_column = data['view']['settings']['targetColumn']
    df_train, _ = split_dataset(data)
    df_target = df_train[target_column]
    y_train = df_target.values

    raw_desc, desc_transformer = get_descriptors_and_transformer(data, df_train, df_target)
    pipeline_steps = [('descriptors_calculation', desc_transformer)]

    if scaling == 'scaled':
        pipeline_steps.append(('scaler', MinMaxScaler()))
    pipeline_steps.append(('variance', VarianceThreshold()))

    params = data['view']['params']
    pipeline_steps.append(('model', eval(methods[method])))

    pipeline = Pipeline(pipeline_steps)

    pipeline[1:].fit(raw_desc, y_train)

    return None, pipeline

#-------------------------------------------------------------------------------------------------
