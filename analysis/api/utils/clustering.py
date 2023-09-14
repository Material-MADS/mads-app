#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
#          Last Update: Q3 2023
# ________________________________________________________________________________________________
# Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
#          Jun Fujima (Former Lead Developer) [2018-2021]
# ________________________________________________________________________________________________
# Description: Serverside (Django) rest api utils for the 'Analysis' page involving
#              'clustering' components
# ------------------------------------------------------------------------------------------------
# Notes:  This is one of the REST API parts of the 'analysis' interface of the website that
#         allows serverside work for the 'clustering' component.
# ------------------------------------------------------------------------------------------------
# References: logging, numpy, pandas and sklearn libs
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
import logging
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.mixture import GaussianMixture

logger = logging.getLogger(__name__)
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
def get_clusters(data):
    vis_type = data['view']['settings']['visType']

    result = {}
    result['vis_type'] = vis_type

    feature_columns = data['view']['settings']['featureColumns']
    num_of_clusters = int(data['view']['settings']['numberOfClusters'])
    if num_of_clusters > 10:
        num_of_clusters = 10

    dataset = data['data']
    df = pd.DataFrame(dataset)
    df_target = df[feature_columns]
    X = df_target.values

    if(vis_type == "Bar Chart"):
        method = data['view']['settings']['method']

        cif = None
        if (method == 'KMeans'):
            clf = KMeans(n_clusters=num_of_clusters)
        else:
            clf = GaussianMixture(n_components=num_of_clusters)

        clf.fit(X)
        y = clf.predict(X)

        result['cluster'] = y
    else:
        kmean = KMeans(n_clusters=num_of_clusters)
        kmean.fit(X)
        y = kmean.predict(X)

        result['cluster'] = y
        result['data'] = data['data']


    return result
#-------------------------------------------------------------------------------------------------
