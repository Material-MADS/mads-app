#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
#          Last Update: Q3 2023
# ________________________________________________________________________________________________
# Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
#          Jun Fujima (Former Lead Developer) [2018-2021]
# ________________________________________________________________________________________________
# Description: Management modules for Serverside User object
# ------------------------------------------------------------------------------------------------
# Notes: This is the object that manages the authentication of the user object on the Django
#        server side
# ------------------------------------------------------------------------------------------------
# References: Django platform libraries and six lib for python 2 and 3 compatibility
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
from django.contrib.auth.tokens import PasswordResetTokenGenerator
import six
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class TokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, user, timestamp):
        return (
            six.text_type(user.pk) + six.text_type(timestamp) +
            six.text_type(user.is_active)
        )
#-------------------------------------------------------------------------------------------------

account_activation_token = TokenGenerator()
