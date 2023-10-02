#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
#          Last Update: Q3 2023
# ________________________________________________________________________________________________
# Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
# ________________________________________________________________________________________________
# Description: Serverside (Django) rest api utils for the 'Analysis' page involving
#              'statistics' component
# ------------------------------------------------------------------------------------------------
# Notes:  This is one of the REST API parts of the 'analysis' interface of the website that
#         allows serverside work for the 'statistics' component.
# ------------------------------------------------------------------------------------------------
# References: logging, numpy libs
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
import logging
import pandas as pd
import numpy as np

logger = logging.getLogger(__name__)

#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
def get_statistics(data):
    selected_columns = data["view"]["settings"]["featureColumns"]
    dataset = data["data"]
    stats_name = "Stats"

    df = pd.DataFrame(dataset)
    statistics = df.describe().round(5)
    statistics.insert(0, stats_name, statistics.index,)

    result = {}
    result["columns"] = [stats_name] + selected_columns
    result["data"] = statistics.to_dict(orient="records")

    return result
#-------------------------------------------------------------------------------------------------
