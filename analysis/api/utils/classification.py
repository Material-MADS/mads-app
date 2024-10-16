#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
#          Last Update: Q3 2023
# ________________________________________________________________________________________________
# Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
#          Jun Fujima (Former Lead Developer) [2018-2021]
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
from sklearn.ensemble import RandomForestClassifier
from sklearn.ensemble import ExtraTreesClassifier
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.linear_model import SGDClassifier
from sklearn.linear_model import RidgeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.neural_network import MLPClassifier

logger = logging.getLogger(__name__)

#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
def get_classification(data):
    logger.info('AAAAAAAAAAAAAAAAAAAAAAAAAAAAa')
    feature_columns  = data['view']['settings']['featureColumns']
    target_column = data['view']['settings']['targetColumn']
    method = data['view']['settings']['method']
    method_args = data['view']['settings']['methodArguments']

    dataset = data['data']
    df = pd.DataFrame(dataset)

    df_train = df[feature_columns]
    X = df_train.values

    df_target = df[target_column]
    y = df_target.values

    model = None

    if method == 'RandomForest':
        model = RandomForestClassifier(random_state=int(method_args['arg1']), n_estimators=int(method_args['arg2']))
    elif method == 'SVC':
        model = SVC(C=float(method_args['arg1']), gamma=float(method_args['arg2']))
    elif method == 'ExtraTrees':
        model = ExtraTreesClassifier(random_state=int(method_args['arg1']), n_estimators=int(method_args['arg2']))
    elif method == 'GradientBoosting':
        model = GradientBoostingClassifier()
    elif method == 'KNeighbors':
        model = KNeighborsClassifier(n_neighbors=3)
    elif method == 'SGD':
        model = SGDClassifier()
    elif method == 'MLP':
        model = MLPClassifier(random_state=int(method_args['arg1']), max_iter=int(method_args['arg2']))
    else: #  Ridge
        model = RidgeClassifier(alpha=float(method_args['arg1']))

    model.fit(X, y)
    y_predict = model.predict(X)
    p_name = target_column + '--predicted'

    data = {}

    data[target_column] = y
    data[p_name] = y_predict

    return data, model
#-------------------------------------------------------------------------------------------------
