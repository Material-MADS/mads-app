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
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.linear_model import Lasso
from sklearn.ensemble import RandomForestRegressor
from sklearn.ensemble import ExtraTreesRegressor
from sklearn.neural_network import MLPRegressor
from sklearn.kernel_ridge import KernelRidge
from sklearn.svm import SVR
from sklearn.model_selection import cross_validate, train_test_split, KFold

logger = logging.getLogger(__name__)
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
def get_regression(data):
    feature_columns = data['view']['settings']['featureColumns']
    target_column = data['view']['settings']['targetColumn']
    method = data['view']['settings']['method']
    method_args = data['view']['settings']['methodArguments']
    cvMethod = data['view']['settings']['cvmethod']
    cvMethod_args = data['view']['settings']['cvmethodArg']

    dataset = data['data']
    df = pd.DataFrame(dataset)
    df_train = df[feature_columns]
    X = df_train.values
    df_target = df[target_column]
    y = df_target.values

    reg = None
    cv_model = None

    if method == 'Linear':
        reg = LinearRegression(fit_intercept=True)
        cv_model = LinearRegression(fit_intercept=True)
    elif method == 'Lasso':
        reg = Lasso()
        cv_model = Lasso()
    elif method == 'SVR':
        reg = SVR(C=float(method_args['arg1']), gamma=float(method_args['arg2']))
        cv_model = SVR(C=float(method_args['arg1']), gamma=float(method_args['arg2']))
    elif method == 'RandomForest':
        reg = RandomForestRegressor(random_state=int(method_args['arg1']), n_estimators=int(method_args['arg2']))
        cv_model = RandomForestRegressor(random_state=int(method_args['arg1']), n_estimators=int(method_args['arg2']))
    elif method == 'ExtraTrees':
        reg = ExtraTreesRegressor(random_state=int(method_args['arg1']), n_estimators=int(method_args['arg2']))
        cv_model = ExtraTreesRegressor(random_state=int(method_args['arg1']), n_estimators=int(method_args['arg2']))
    elif method == 'MLP':
        reg = MLPRegressor(random_state=int(method_args['arg1']), max_iter=int(method_args['arg2']))
        cv_model = MLPRegressor(random_state=int(method_args['arg1']), max_iter=int(method_args['arg2']))
    else: # KernelRidge
        reg = KernelRidge(alpha=float(method_args['arg1']))
        cv_model = KernelRidge(alpha=float(method_args['arg1']))

    data = {}
    d1 = {}
    d2 = {}
    scores = None
    y_predict = None
    p_name = target_column + '--Predicted'
    scoring = {
        'r2': 'r2',
        'mae': 'neg_mean_absolute_error',
    }

    if cvMethod == 'TrainTestSplit':
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size = float(cvMethod_args), random_state = 2)
        reg.fit(X_train, y_train)
        y_predict = reg.predict(X_test)
        train_x=[]
        for i in X_train:
            train_x.append(reg.predict([i])[0])

        train_y=[]
        for j in y_train:
            train_y.append(j)

        test_x=[]
        for ii in X_test:
            test_x.append(reg.predict([ii])[0])

        test_y=[]
        for jj in y_test:
            test_y.append(jj)

        scores = cross_validate(cv_model, X_train, y_train, scoring=scoring)
        d1[target_column] = train_y
        d1[p_name] = train_x
        d2[target_column] = test_y
        d2[p_name] = test_x

    else: # KFold
        kf = KFold(shuffle=True, random_state=0, n_splits=int(cvMethod_args))
        reg.fit(X, y)
        y_predict = reg.predict(X)
        scores = cross_validate(cv_model, X, y, cv=kf, scoring=scoring)
        d1[target_column] = y
        d1[p_name] = y_predict
        d2[target_column] = []
        d2[p_name] = []

    data['scores'] = scores
    data['d1'] = d1
    data['d2'] = d2

    return data, reg
#-------------------------------------------------------------------------------------------------
