import logging
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.mixture import GaussianMixture



logger = logging.getLogger(__name__)

def get_clusters(data):
    feature_columns  = data['view']['settings']['featureColumns']
    method = data['view']['settings']['method']
    num_of_clusters = data['view']['settings']['numberOfClusters']

    dataset = data['data']
    df = pd.DataFrame(dataset)

    logger.info(df)

    df_target = df[feature_columns]

    X = df_target.values
    cif = None
    if (method == 'KMeans'):
        clf = KMeans(n_clusters=int(num_of_clusters))
    else:
        clf = GaussianMixture(n_components=int(num_of_clusters))

    clf.fit(X)
    y = clf.predict(X)

    logger.info(y)

    result = {}
    result['cluster'] = y

    return result
