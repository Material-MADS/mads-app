import logging
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split


logger = logging.getLogger(__name__)

def get_feature_importance(data):
    train_columns = data['view']['settings']['featureColumns']
    target_columns = data['view']['settings']['targetColumn']

    dataset = data['data']
    df = pd.DataFrame(dataset)

    logger.info(df)


    # print(df.iloc[indices])
    # if indices is not None:
    #     df = df.iloc[indices]

    df_train = df[train_columns]
    X = df_train.as_matrix()

    df_target = df[target_columns]
    # y = df_target.as_matrix()
    y = np.ravel(np.array(df_target))

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=0)

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
        # print('\t{0:20s} : {1:>.6f}'.format(feat, fti[i]))
        #results.append({'feature': feat, 'importance': fti[i]})
        features.append(feat)
        importance.append(fti[i])

    result['features'] = features
    result['importance'] = importance

    # return json.dumps(results)
    logger.info(result)


    return result
