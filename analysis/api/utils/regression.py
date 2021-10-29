import logging
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.linear_model import Lasso
from sklearn.ensemble import RandomForestRegressor
from sklearn.svm import SVR
from sklearn.model_selection import cross_validate, KFold


logger = logging.getLogger(__name__)

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

    # for i in range(len(y)):
    #     d = {}
    #     d[target_column] = y[i]
    #     d[p_name] = y_predict[i]
    #     data.append(d)

    # logger.info(data[0])


    # columns = [target_column, p_name]

    # df_pred = pd.DataFrame(y, y_predict).reset_index()
    # df_pred = pd.DataFrame(y)
    # df_pred[target_column + '_predicted'] = y_predict

    # df_pred.columns = columns

    # df_result = df_pred

    # logger.info(df_result)

    # data = []
    # for index, row in df_result.iterrows():
    #     d = {target_column: row[index],


    # result = {}
    # result[data] = data


    return data, reg
