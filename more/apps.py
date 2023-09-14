#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
#          Last Update: Q3 2023
# ________________________________________________________________________________________________
# Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
#          Jun Fujima (Former Lead Developer) [2018-2021]
# ________________________________________________________________________________________________
# Description: Modules for Serverside 'more' object (Django)
#              'more' contains a list of links to useful web sites and info as well as links to
#              CADS manuals as pdf documents
# ------------------------------------------------------------------------------------------------
# Notes: This is the apps config part of the 'more' object as served from the Django server
# ------------------------------------------------------------------------------------------------
# References: Django platform libraries
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
from django.apps import AppConfig
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class MoreConfig(AppConfig):
    name = 'more'

#-------------------------------------------------------------------------------------------------
