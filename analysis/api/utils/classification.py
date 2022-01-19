#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
# ________________________________________________________________________________________________
# Authors: Jun Fujima (Former Lead Developer) [2018-2021]
#          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
# ________________________________________________________________________________________________
# Description: Serverside (Django) rest api utils for the 'Analysis' page involving
#              classification components
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
from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier

logger = logging.getLogger(__name__)

#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
def get_classification(data):
    feature_columns  = data['view']['settings']['featureColumns']
    target_column = data['view']['settings']['targetColumn']
    method = data['view']['settings']['method']

    dataset = data['data']
    df = pd.DataFrame(dataset)

    df_train = df[feature_columns]
    X = df_train.values

    df_target = df[target_column]
    y = df_target.values

    model = None

    if method == 'RandomForest':
        model = RandomForestClassifier(n_estimators=10, random_state=0)
    else: #  KNeighbors
        model = KNeighborsClassifier(n_neighbors=3)

    model.fit(X, y)
    y_predict = model.predict(X)
    p_name = target_column + '--predicted'

    data = {}

    data[target_column] = y
    data[p_name] = y_predict

    return data, model
#-------------------------------------------------------------------------------------------------
