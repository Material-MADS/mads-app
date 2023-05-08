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
import pandas as pd

logger = logging.getLogger(__name__)

#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
def get_histogram(data):
    # logger.info(data)
    dummy_value = 999999999999
    x = data['data']
    bins = data['view']['settings']['bins']

    x_df = pd.DataFrame(x, dtype="float64")
    x_dropna = x_df.dropna()

    hist, bin_edges = np.histogram(x_dropna.values, bins=bins)

    result = {}
    result['hist'] = hist
    result['binEdges'] = bin_edges

    x_replace_na = x_df.fillna(dummy_value)
    x_array = x_replace_na.values
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
        indices.append(ids)

    result['indices'] = indices

    return result
#-------------------------------------------------------------------------------------------------

#-------------------------------------------------------------------------------------------------
def get_histograms(data):
    selected_columns = data["view"]["settings"]["targetColumns"]
    dataset = data["data"]
    df = pd.DataFrame(dataset , dtype="float64")
    df = df[selected_columns]
    result = {"data":{}}
    count = 0
    for i in selected_columns:
        for j in selected_columns:
            if i == j:
                t_df = df[i].dropna()
                target_data = {"view":{"settings":{}}}
                target_data["data"] = df[i]
                target_data["view"]["settings"]["bins"] = data["view"]["settings"]["bins"]
                result["data"][count] = get_histogram(target_data)
                # logger.info(result["data"][count])
                count += 1
    result["columns"] = selected_columns

    return result
#-------------------------------------------------------------------------------------------------
