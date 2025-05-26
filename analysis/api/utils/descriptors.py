#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
#          Last Update: Q3 2024
# ________________________________________________________________________________________________
# Authors: Philippe Gantzer (Component Developer) [2024-]
#          Mikael Nicander Kuwahara (Lead Developer) [2021-]
# ________________________________________________________________________________________________
# Description: Serverside (Django) rest api utils for the 'Analysis' page involving
#              'descriptors' components
# ------------------------------------------------------------------------------------------------
# Notes:  This is one of the REST API parts of the 'analysis' interface of the website that
#         allows serverside work for the 'descriptors' component.
# ------------------------------------------------------------------------------------------------
# References: logging, numpy and pandas libs; optimizer component
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
import logging
import pandas as pd
from .optimizer import get_descriptors_and_transformer, split_dataset

logger = logging.getLogger(__name__)
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
def get_descriptors(data):
    target_column = data['view']['settings']['targetColumn']

    df = pd.DataFrame(data['data'])
    df_target = df[target_column]

    raw_desc, _ = get_descriptors_and_transformer(data, df, df_target)
    raw_desc[target_column] = df_target

    return {'data': data, 'data_desc': raw_desc.to_dict('records')}

#-------------------------------------------------------------------------------------------------
