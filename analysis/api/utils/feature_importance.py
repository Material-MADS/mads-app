#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
# ________________________________________________________________________________________________
# Authors: Jun Fujima (Former Lead Developer) [2018-2021]
#          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
# ________________________________________________________________________________________________
# Description: Serverside (Django) rest api utils for the 'Analysis' page involving
#              feature importance components
# ------------------------------------------------------------------------------------------------
# Notes:  This is one of the REST API parts of the 'analysis' interface of the website that
#         allows serverside work for the 'feature importance' component.
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
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split

logger = logging.getLogger(__name__)

#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
def get_feature_importance(data):
    train_columns = data['view']['settings']['featureColumns']
    target_columns = data['view']['settings']['targetColumn']

    dataset = data['data']
    df = pd.DataFrame(dataset)

    # logger.info(df)

    df_train = df[train_columns]
    X = df_train.values

    df_target = df[target_columns]
    y = np.ravel(np.array(df_target))

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=0)

    model = None
    try:
        model = RandomForestClassifier(n_estimators=10, random_state=0)
        model.fit(X_train, y_train)
    except ValueError:
        model = RandomForestRegressor(n_estimators=10, random_state=0)
        model.fit(X_train, y_train)

    fti = model.feature_importances_

    result = {}
    features = []
    importance = []

    for i, feat in enumerate(train_columns):
        features.append(feat)
        importance.append(fti[i])

    result['features'] = features
    result['importance'] = importance

    # logger.info(result)

    return result
#-------------------------------------------------------------------------------------------------
