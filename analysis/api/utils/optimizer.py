#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
#          Last Update: Q2 2025
# ________________________________________________________________________________________________
# Authors: Philippe Gantzer [2024-]
#          Pavel Sidorov [2024-]
# ________________________________________________________________________________________________
# Description: Serverside (Django) rest api utils for the 'Analysis' page involving
#              DOPtools' 'optimizer (regression/classification)' components
# ------------------------------------------------------------------------------------------------
# Notes:  This is one of the REST API parts of the 'analysis' interface of the website that
#         allows serverside work for the DOPtools' 'optimizer' components.
# ------------------------------------------------------------------------------------------------
# References: doptools, logging, numpy, pandas and sklearn libs
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
import logging
import numpy as np
from doptools.optimizer import launch_study, calculate_descriptor_table, get_raw_model
from doptools.chem.solvents import available_solvents
from doptools.cli.plotter import prepare_classification_plot
from chython import smiles
import pandas as pd
from scipy.sparse import csr_matrix
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import MinMaxScaler, LabelEncoder
from sklearn.feature_selection import VarianceThreshold
import re

logger = logging.getLogger(__name__)
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
methods_dict = {'Morgan_fingerprints': {'name': 'morgan',
                                        'args': {'nBits': 1024, 'radius': 2},
                                        'args_parse': {'arg1': 'nBits', 'arg2': 'radius'}},
                'Morgan_features': {'name': 'morganfeatures',
                                    'args': {'nBits': 1024, 'radius': 2},
                                    'args_parse': {'arg1': 'nBits', 'arg2': 'radius'}},
                'RDKit_Fingerprints': {'name': 'rdkfp',
                                       'args': {'nBits': 1024, 'radius': 3},
                                       'args_parse': {'arg1': 'nBits', 'arg2': 'radius'}},
                'RDKit_Linear_Fingerprints': {'name': 'rdkfplinear',
                                              'args': {'nBits': 1024, 'radius': 3},
                                              'args_parse': {'arg1': 'nBits', 'arg2': 'radius'}},
                'Layered': {'name': 'layered',
                            'args': {'nBits': 1024, 'radius': 3},
                            'args_parse': {'arg1': 'nBits', 'arg2': 'radius'}},
                'Avalon': {'name': 'avalon',
                           'args': {'nBits': 1024},
                           'args_parse': {'arg1': 'nBits'}},
                'Torsion': {'name': 'torsion',
                            'args': {'nBits': 1024},
                            'args_parse': {'arg1': 'nBits'}},
                'Atom_Pairs': {'name': 'atompairs',
                               'args': {'nBits': 1024},
                               'args_parse': {'arg1': 'nBits'}},
                'Circus': {'name': 'circus',
                           'args': {'lower': 1, 'upper': 2, 'keep_stereo': 'no'},
                           'args_parse': {'arg1': 'lower', 'arg2': 'upper', 'arg3': 'keep_stereo'}},
                'Linear_fragments': {'name': 'chyline',
                                     'args': {'lower': 2, 'upper': 5},
                                     'args_parse': {'arg1': 'lower', 'arg2': 'upper'}},
                'Mordred_2D': {'name': 'mordred2d',
                               'args': {},
                               'args_parse': {}},
                }


def get_descriptors_and_transformer(data, df, df_target):
    method = data['view']['settings']['method']
    if method not in methods_dict:
        raise ValueError("Descriptors type is not allowed")

    method_args = data['view']['settings']['methodArguments']
    parameters_dict = methods_dict[method]['args'].copy()
    for form_arg in method_args:
        if form_arg in methods_dict[method]['args_parse']:
            parameters_dict[methods_dict[method]['args_parse'][form_arg]] = int(method_args[form_arg]) \
                                                                            if str(method_args[form_arg]).isdigit() \
                                                                            else str(method_args[form_arg])

    if 'lower' in parameters_dict and 'upper' in parameters_dict and int(method_args['arg1']) > int(method_args['arg1']):
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
        bad_solvents = [str(x) for x in df_sc if str(x) not in available_solvents]
        if bad_solvents:
            display_solvents = (", ".join(bad_solvents) if len(bad_solvents) < 11 else
                                ", ".join(bad_solvents[:10])+f", ...and {len(bad_solvents) - 10} more")
            raise ValueError(f"Unknown solvent(s): {display_solvents}. Please refer to solvents supported in DOPtools.")
        input_dict['solvents'] = df_sc

    result = calculate_descriptor_table(input_dict, methods_dict[method]['name'], parameters_dict)
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
        try:
            mol = smiles(x)
            if mol:
                try:
                    mol.canonicalize(fix_tautomers=False)
                except:  # Magic trick of chython
                    mol.canonicalize(fix_tautomers=False)
                mols.append(mol)
            else:
                raise ValueError()
        except:
            raise ValueError("The SMILES string " + str(x) + " could not be parsed")
    return mols


def get_model(data):
    ml_method = data['view']['settings']['MLmethod']
    if ml_method not in ["SVR", "RFR", "SVC", "RFC"]:  # "XGBR"]:
        raise ValueError("ML method not supported")

    target_column = data['view']['settings']['targetColumn']
    p_name = target_column + '--Predicted'
    p_target = None

    if ml_method.endswith('C'):
        LE = LabelEncoder()
        data['data'][target_column] = LE.fit_transform([str(x) for x in data['data'][target_column]])
        LE_is_required = not (np.all([x.isdigit() for x in LE.classes_])
                              and np.all([float(x) for x in LE.classes_] == list(range(len(LE.classes_)))))
        try:
            p_target = LE.transform([str(data['view']['settings']['positiveLabel'])])[0]
        except ValueError:
            raise ValueError("The provided Positive label is not within the Property/Target column values.")
    else:
        LE_is_required = False

    df_train, df_test = split_dataset(data)
    df_target = df_train[target_column]
    y_train = df_target.values

    raw_desc, _ = get_descriptors_and_transformer(data, df_train, df_target)
    for_opt = {'desc1': csr_matrix(raw_desc.values)}

    cv_splits = int(data['view']['settings']['CVsplits'])
    if cv_splits > int(len(df_train)):
        raise ValueError("The number of #CV splits is higher than the number of available data")
    cv_repeats = int(data['view']['settings']['CVrepeats'])
    trials = int(data['view']['settings']['trials'])

    try:
        st, stats = launch_study(for_opt, pd.DataFrame(df_target), "", ml_method, trials, cv_splits,
                                 cv_repeats, 5, 60, (0, 1), False)
        if not len(stats):
            raise StopIteration() #StopIteration can also be raised by launch_study above
    except StopIteration:
        raise ValueError("No solution found. Try increasing iterations number or change parameters.")
    rebuild_trial = st.sort_values(by='score', ascending=False).iloc[0]
    print("Required/done/best", trials, len(st), rebuild_trial['trial'])
    print("BEST:", rebuild_trial)

    scores_df = stats[rebuild_trial['trial']]['score'].iloc[0]
    cv = {}
    if ml_method.endswith("R"):
        scores_labels = ['R2', 'RMSE', 'MAE']
    else:
        cv['roc_repeats'], cv['roc_mean'] = prepare_classification_plot(stats[rebuild_trial['trial']]['predictions'], p_target)
        scores_labels = ['ROC_AUC', 'ACC', 'BAC', 'F1', 'MCC']

    scores = {x: format(scores_df[x], '.3f') for x in scores_labels}

    params = rebuild_trial[rebuild_trial.index[list(rebuild_trial.index).index('method') + 1:]].to_dict()
    params["method"] = rebuild_trial['method']
    params["scaling"] = rebuild_trial['scaling']
    result = {'data': data, 'scores': scores, 'cv': cv, 'params': params, 'processed': True}

    # Training set (CV predictions)
    if ml_method.endswith("R"):
        result['d1'] = {target_column: y_train,
                        p_name: np.mean(stats[rebuild_trial['trial']]['predictions'].iloc[:, 2:], axis=1),
                        p_name+"_uncertain": np.std(stats[rebuild_trial['trial']]['predictions'].iloc[:, 2:], axis=1),}
        result['d1_detailed'] = stats[rebuild_trial['trial']]['predictions'].to_dict(orient='records')
    else:
        if LE_is_required:
            result['params']['label encoding'] = ', '.join(['{}={}'.format(x,y) for x,y in zip(LE.classes_, range(len(LE.classes_)))])
        preds = stats[rebuild_trial['trial']]['predictions'].copy()
        preds.columns = [re.sub(r"(class_)([^.]+)",
                                lambda m: f"{m.group(1)}{LE.inverse_transform([int(m.group(2)) if str(m.group(2)).isdigit() else str(m.group(2)) ])[0]}", x)
                         for x in preds.columns]
        for col in preds.columns:
            if re.match(fr"{target_column}(\.predicted.class.+|\.observed)", col):
                preds[col] = LE.inverse_transform(preds[col])

        result['d1'] = list(preds.to_dict(orient='index').values())

    # Test set if specified
    if df_test is None:
        result['d2'] = {target_column: [], p_name: [], } if ml_method.endswith("R") else []
        result['first_test'] = len(y_train)

    else:
        data_rebuild = data.copy()
        data_rebuild['view']['params'] = params.copy()
        _, model = get_model_rebuild(data_rebuild)
        dict_pred = {x: smiles2mols(df_test[x].to_list()) for x in data['view']['settings']['featureColumns']}
        if len(dict_pred.keys()) == 1 and not data['view']['settings']['numericalFeatureColumns'] and not data['view']['settings']['solventColumn']:
            _, df_pred = next(iter(dict_pred.items()))
        else:
            if data['view']['settings']['numericalFeatureColumns']:
                dict_pred.update({x: df_test[x].to_list() for x in data['view']['settings']['numericalFeatureColumns']})
            if data['view']['settings']['solventColumn']:
                dict_pred.update({data['view']['settings']['solventColumn']: df_test[data['view']['settings']['solventColumn']].to_list()})
            df_pred = pd.DataFrame(dict_pred)

        res = model.predict(df_pred)
        result['first_test'] = int(data['view']['settings']['external_validation_from'])
        if ml_method.endswith("R"):
            result['d2'] = {target_column: df_test[target_column].values, p_name: res, }
        else:
            df_test.rename(columns={target_column: target_column+".observed"}, inplace=True)
            df_test[target_column + ".observed"] = LE.inverse_transform(df_test[target_column + ".observed"])
            df_test[target_column + ".predicted"] = LE.inverse_transform(res)
            result['d2'] = list(df_test.to_dict(orient='index').values())

    return result, None


def get_model_rebuild(data):
    params = data['view']['params'].copy()
    method = params.pop('method')
    scaling = params.pop('scaling')
    if 'label encoding' in params:
        params.pop('label encoding')

    target_column = data['view']['settings']['targetColumn']
    df_train, _ = split_dataset(data)
    df_target = df_train[target_column]
    y_train = df_target.values

    raw_desc, desc_transformer = get_descriptors_and_transformer(data, df_train, df_target)
    pipeline_steps = [('descriptors_calculation', desc_transformer)]

    if scaling == 'scaled':
        pipeline_steps.append(('scaler', MinMaxScaler()))
    pipeline_steps.append(('variance', VarianceThreshold()))

    pipeline_steps.append(('model', get_raw_model(method, params)))

    pipeline = Pipeline(pipeline_steps)

    pipeline[1:].fit(raw_desc, y_train)

    return None, pipeline

#-------------------------------------------------------------------------------------------------
