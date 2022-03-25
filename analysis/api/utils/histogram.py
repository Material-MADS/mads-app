#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
# ________________________________________________________________________________________________
# Authors: Jun Fujima (Former Lead Developer) [2018-2021]
#          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
# ________________________________________________________________________________________________
# Description: Serverside (Django) rest api utils for the 'Analysis' page involving
#              histogram components
# ------------------------------------------------------------------------------------------------
# Notes:  This is one of the REST API parts of the 'analysis' interface of the website that
#         allows serverside work for the 'histogram' component.
# ------------------------------------------------------------------------------------------------
# References: logging, numpy libs
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
import logging
import numpy as np

logger = logging.getLogger(__name__)

#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
def get_histogram(data):
    # logger.info(data)

    x = data['data']
    bins = data['view']['settings']['bins']

    logger.info(x)
    logger.info(bins)

    hist, bin_edges = np.histogram(x, bins=bins)

    result = {}
    result['hist'] = hist
    result['binEdges'] = bin_edges

    x_array = np.array(x)
    indices = []

    l = len(bin_edges)
    for i in range(l - 1):
        left = bin_edges[i]
        right = bin_edges[i + 1]
        # logger.info(left)
        # logger.info(right)
        ids = []
        if i == l - 2:
            ids = list(np.where((left <= x_array) & (x_array <= right))[0])
        else:
            ids = list(np.where((left <= x_array) & (x_array < right))[0])
        # logger.info(ids)
        indices.append(ids)
    result['indices'] = indices

    return result
#-------------------------------------------------------------------------------------------------
