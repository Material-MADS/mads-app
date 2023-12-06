#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
#          Last Update: Q3 2023
# ________________________________________________________________________________________________
# Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
# ________________________________________________________________________________________________
# Description: Serverside (Django) rest api utils for the 'Analysis' page involving
#              'Cadsies - Custom Mini App' components
# ------------------------------------------------------------------------------------------------
# Notes:  This is one of the REST API parts of the 'analysis' interface of the website that
#         allows serverside work for the 'Cadsies - Custom Mini App' component.
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
def get_cadsies_stuff(data):
    # something = data['view']['settings']['options']['something']
    result = data["data"]

    return result
#-------------------------------------------------------------------------------------------------

# If Custom Error Message is needed use the following:
# result['status'] = 'error'
# result['detail'] = "This is the Custom Error Message"
