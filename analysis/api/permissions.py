#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
#          Last Update: Q3 2023
# ________________________________________________________________________________________________
# Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
#          Jun Fujima (Former Lead Developer) [2018-2021]
# ________________________________________________________________________________________________
# Description: Serverside (Django) Provided rest api for the 'Analysis' page involving
#              permissions
# ------------------------------------------------------------------------------------------------
# Notes:  This is one of the REST API part of the serverside module that allows the user to
#         interact with the 'analysis' interface of the website. (DB and server Python methods)
# ------------------------------------------------------------------------------------------------
# References: rest framework, logging libs and 'analysis' folder's 'rules'
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
import logging
from rest_framework import permissions
import rules

logger = logging.getLogger(__name__)

#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed following rule 'can_read_datasource',

        if request.method in permissions.SAFE_METHODS:
            return rules.test_rule('can_read_workspace', request.user, obj)

        # Write permissions are only allowed to the owner of the snippet.
        return obj.owner == request.user
#-------------------------------------------------------------------------------------------------
