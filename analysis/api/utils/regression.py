#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
# ________________________________________________________________________________________________
# Authors: Jun Fujima (Former Lead Developer) [2018-2021]
#          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
# ________________________________________________________________________________________________
# Description: Serverside (Django) rest api utils for the 'Analysis' page involving
#              regression components
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
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.linear_model import Lasso
from sklearn.ensemble import RandomForestRegressor
from sklearn.svm import SVR
from sklearn.model_selection import cross_validate, KFold

logger = logging.getLogger(__name__)
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
def get_regression(data):
    feature_columns  = data['view']['settings']['featureColumns']
    target_column = data['view']['settings']['targetColumn']
    folds = data['view']['settings']['folds']
    method = data['view']['settings']['method']

    print('-----')
    print(folds)

    dataset = data['data']
    df = pd.DataFrame(dataset)

    df_train = df[feature_columns]
    X = df_train.values

    df_target = df[target_column]
    y = df_target.values

    reg = None
    cv_model = None

    if method == 'Linear':
        reg = LinearRegression(fit_intercept=True, normalize=False)
        cv_model = LinearRegression(fit_intercept=True, normalize=False)
    elif method == 'Lasso':
        reg = Lasso()
        cv_model = Lasso()
    elif method == 'SVR':
        reg = SVR()
        cv_model = SVR()
    else: # RandomForest
        reg = RandomForestRegressor(n_estimators=10, random_state=0)
        cv_model = RandomForestRegressor(n_estimators=10, random_state=0)

    reg.fit(X, y)
    y_predict = reg.predict(X)
    p_name = target_column + '--predicted'

    data = {}

    data[target_column] = y
    # logger.info(y_predict)
    data[p_name] = y_predict


    # cross validation
    kf = KFold(shuffle=True, random_state=0, n_splits=folds)
    scoring = {
        'r2': 'r2',
        'mae': 'neg_mean_absolute_error',
    }

    scores = cross_validate(cv_model, X, y, cv=kf, scoring=scoring)
    print(scores)
    data['scores'] = scores

    return data, reg
#-------------------------------------------------------------------------------------------------
