#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
#          Last Update: Q3 2023
# ________________________________________________________________________________________________
# Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
#          Jun Fujima (Former Lead Developer) [2018-2021]
# ________________________________________________________________________________________________
# Description: Serverside (Django) Provided apps for the 'Prediction' page
# ------------------------------------------------------------------------------------------------
# Notes: This is entrance initiation part of the serverside module that allows the user to
#        interact with the 'prediction' interface of the website. (DB and server Python methods)
# ------------------------------------------------------------------------------------------------
# References: Django platform libraries
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
from django.apps import AppConfig

#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class PredictionConfig(AppConfig):
    name = 'prediction'
#-------------------------------------------------------------------------------------------------
