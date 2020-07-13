import logging
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier

logger = logging.getLogger(__name__)



def get_classification(data):
    feature_columns  = data['view']['settings']['featureColumns']
    target_column = data['view']['settings']['targetColumn']
    method = data['view']['settings']['method']

    dataset = data['data']
    df = pd.DataFrame(dataset)

    df_train = df[feature_columns]
    X = df_train.as_matrix()

    df_target = df[target_column]
    y = df_target.as_matrix()

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
    # logger.info(y_predict)
    data[p_name] = y_predict

    return data, model
