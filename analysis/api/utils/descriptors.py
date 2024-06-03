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
from doptools.chem import ChythonCircus
from chython import smiles
import pandas as pd

logger = logging.getLogger(__name__)
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
def get_descriptors(data):
    print("called with arg", data['view']['settings'])
    smiles_columns = data['view']['settings']['featureColumns']
    target_column = data['view']['settings']['targetColumn']
    method = data['view']['settings']['method']
    method_args = data['view']['settings']['methodArguments']

    dataset = data['data']
    df = pd.DataFrame(dataset)
    df_smiles = df[smiles_columns]
    mols = [y for x in df_smiles if (y := smiles(x))]
    # TODO later: error if a SMILES is not read
    df_target = df[target_column]
    y = df_target.values

    if method == 'Circus':
        augmentor = ChythonCircus(int(method_args['arg1']), int(method_args['arg2']))
        aa = augmentor.fit_transform(mols)
        print("Features names", augmentor.get_feature_names())
        desc = pd.DataFrame(aa)
        desc2 = desc.to_dict('records')

    result = {'data': data, 'data_desc': desc2}


    return result

#-------------------------------------------------------------------------------------------------
