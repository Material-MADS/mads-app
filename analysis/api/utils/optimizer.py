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
from optimizer.optimizer import launch_study
from optimizer.config import methods
from optimizer.preparer import calculate_descriptor_table
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


def raise_error(message):
    result = {'status': 'error', 'detail': message}
    return result, None


def get_descriptors_and_transformer(data):
    smiles_columns = data['view']['settings']['featureColumns']
    method = data['view']['settings']['method']
    if method not in methods_dict.keys():
        return raise_error("Descriptors type is not allowed")
    descriptors_name = methods_dict[method][0]

    method_args = data['view']['settings']['methodArguments']
    if 'arg1' in method_args.keys() and len(methods_dict[method][1]) >= 1:
        methods_dict[method][1][list(methods_dict[method][1].keys())[0]] = int(method_args['arg1'])
    if 'arg2' in method_args.keys() and len(methods_dict[method][1]) >= 2:
        methods_dict[method][1][list(methods_dict[method][1].keys())[1]] = int(method_args['arg2'])
    parameters_dict = methods_dict[method][1]

    df = pd.DataFrame(data['data'])
    df_smiles = df[smiles_columns]
    mols = []
    for x in df_smiles:
        mol = smiles(x)
        if mol:
            try:
                mol.canonicalize(fix_tautomers=False)
            except:
                mol.canonicalize(fix_tautomers=False)
            mols.append(mol)
        else:
            raise_error("The SMILES string " + str(x) + " could not be parsed")

    property_name = data['view']['settings']['targetColumn']
    df_target = df[property_name]
    indices = list(df_target[pd.notnull(df_target)].index)
    df_target = np.array(df_target)
    if len(indices) != len(mols):
        raise_error("Some molecule don't have a property value")
    input_dict = {'structures': np.array(mols),
                  'prop1': {'indices': indices,
                            'property': df_target,
                            'property_name': property_name}}

    result = calculate_descriptor_table(input_dict, descriptors_name, parameters_dict)
    return result['prop1']['table'], result['prop1']['calculator']  # descriptors, transformer


def get_model(data):
    raw_desc, _ = get_descriptors_and_transformer(data)
    desc = pd.DataFrame(raw_desc).to_dict('records')
    for_opt = {'desc1': csr_matrix(raw_desc.values)}

    df = pd.DataFrame(data['data'])
    df_target = df[data['view']['settings']['targetColumn']]
    y = df_target.values

    target_column = data['view']['settings']['targetColumn']
    p_name = target_column + '--Predicted'

    ml_method = data['view']['settings']['MLmethod']
    if ml_method not in ["SVR", "RFR"]:  # "XGBR"]:
        raise_error("ML method not supported")
    cv_splits = int(data['view']['settings']['CVsplits'])
    cv_repeats = int(data['view']['settings']['CVrepeats'])
    trials = int(data['view']['settings']['trials'])

    st, stats = launch_study(for_opt, pd.DataFrame(df_target), "", ml_method, trials, cv_splits,
                             cv_repeats, 5, 60, (0, 1), False)
    print("STUDY RESULTS", st)
    rebuild_trial = st.sort_values(by='score', ascending=False).iloc[0]
    print("BEST:", rebuild_trial['trial'])

    scores_df = stats[rebuild_trial['trial']]['score'].iloc[0]
    scores = {"R2": format(scores_df.R2, '.3f'),
              "RMSE": format(scores_df.RMSE, '.3f'),
              "MAE": format(scores_df.MAE, '.3f'), }

    # Training set (CV predictions)
    d1 = {target_column: y,
          p_name: np.mean(stats[rebuild_trial['trial']]['predictions'].iloc[:, 2:], axis=1), }

    # Test set
    d2 = {target_column: [],
          p_name: [], }

    result = {'data': data, 'data_desc': desc, 'scores': scores, 'd1': d1, 'd2': d2}

    params = rebuild_trial[rebuild_trial.index[list(rebuild_trial.index).index('method')+1:]].to_dict()
    params["method"] = rebuild_trial['method']
    params["scaling"] = rebuild_trial['scaling']
    result['params'] = params

    return result, None


def get_model_rebuild(data):
    method = data['view']['params'].pop('method')
    scaling = data['view']['params'].pop('scaling')

    raw_desc, desc_transformer = get_descriptors_and_transformer(data)
    pipeline_steps = [('descriptors_calculation', desc_transformer)]

    if scaling == 'scaled':
        pipeline_steps.append(('scaler', MinMaxScaler()))
    pipeline_steps.append(('variance', VarianceThreshold()))

    params = data['view']['params']
    model = eval(methods[method])
    pipeline_steps.append(('model', model))

    pipeline = Pipeline(pipeline_steps)

    df = pd.DataFrame(data['data'])
    df_target = df[data['view']['settings']['targetColumn']]
    y = df_target.values
    pipeline[1:].fit(raw_desc, y)

    print("Rebuild pipeline is", pipeline)

    return None, pipeline

#-------------------------------------------------------------------------------------------------
