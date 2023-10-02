#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
#          Last Update: Q3 2023
# ________________________________________________________________________________________________
# Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
#          Jun Fujima (Former Lead Developer) [2018-2021]
# ________________________________________________________________________________________________
# Description: Serverside (Django) Provided validators for the 'datamanagement' page
# ------------------------------------------------------------------------------------------------
# Notes: This is one part of the serverside module that allows the user to interact with the
#        'datamanagement' interface of the website. (DB and server Python methods)
# ------------------------------------------------------------------------------------------------
# References: Django platform libraries
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
from django.core.exceptions import ValidationError

#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
def validate_users_hidden(value):
    """Raise a ValidationError if the value includes unregistered users.
    """
    msg = 'The user is not registered.'
    raise ValidationError(msg, 'test')
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
def validate_groups_hidden(value):
    pass
#-------------------------------------------------------------------------------------------------
