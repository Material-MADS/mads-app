#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
#          Last Update: Q3 2023
# ________________________________________________________________________________________________
# Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
# ________________________________________________________________________________________________
# Description: Serverside (Django) rest api utils for the 'Analysis' page involving
#              'pie' components
# ------------------------------------------------------------------------------------------------
# Notes:  This is one of the REST API parts of the 'analysis' interface of the website that
#         allows serverside work for the 'pie' component.
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
def get_pie(data):
    includeNoneVals = False
    if "undefinedIsIncluded" in data['view']['settings']:
        includeNoneVals = data['view']['settings']['undefinedIsIncluded']
    bins = data['view']['settings']['bins']
    result = {}
    if type(data['data'][0]) is str:
        if(None in data['data']):
            if includeNoneVals:
                data['data'] = ['Undefined' if v is None else v for v in data['data']]
            else:
                data['data'] = [x for x in data['data'] if x is not None]

        unique_elements, counts_elements = np.unique(data['data'], return_counts=True)
        result['values'] = counts_elements
        result['dimensions'] = [str(ue) for ue in unique_elements]
    else:
        if(None in data['data']):
            if includeNoneVals:
                data['data'] = ['Undefined' if v is None else v for v in data['data']]
            else:
                data['data'] = [x for x in data['data'] if x is not None]
        unique_elements, counts_elements = np.unique(data['data'], return_counts=True)
        if bins == 0 or bins == len(unique_elements):
            result['values'] = counts_elements
            result['dimensions'] = [str(ue) for ue in unique_elements]
        else:
            hist, bin_edges = np.histogram(data['data'], bins=bins)
            result['values'] = hist

            floatsExists = False
            for x in bin_edges:
                if not (x.is_integer()):
                    floatsExists = True
                    break
            if floatsExists:
                result['dimensions'] = ["{:.2f}".format(x) + " - " + "{:.2f}".format(bin_edges[idx+1])  for idx, x in enumerate(bin_edges) if (idx+1) < (len(bin_edges))]
            else:
                result['dimensions'] = ["{:0.0f}".format(x) for x in bin_edges]

            x_array = np.array(data['data'])
            indices = []
            l = len(bin_edges)
            for i in range(l - 1):
                left = bin_edges[i]
                right = bin_edges[i + 1]
                ids = []
                if i == l - 2:
                    ids = list(np.where((left <= x_array) & (x_array <= right))[0])
                else:
                    ids = list(np.where((left <= x_array) & (x_array < right))[0])
                indices.append(ids)
            result['indices'] = indices

    return result
#-------------------------------------------------------------------------------------------------
