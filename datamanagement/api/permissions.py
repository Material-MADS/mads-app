#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
# ________________________________________________________________________________________________
# Authors: Jun Fujima (Former Lead Developer) [2018-2021]
#          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
# ________________________________________________________________________________________________
# Description: Serverside (Django) Provided rest api for the 'datamanagement' page involving
#              permissions
# ------------------------------------------------------------------------------------------------
# Notes:  This is one of the REST API part of the serverside module that allows the user to
#         interact with the 'datamanagement' interface of the website. (DB & server Python methods)
# ------------------------------------------------------------------------------------------------
# References: rest framework libs and 'datamanagement' folder's 'rules'
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
from rest_framework import permissions
import rules

#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed following rule 'can_read_datasource',

        if request.method in permissions.SAFE_METHODS:
            return rules.test_rule('can_read_datasource', request.user, obj)

        # Write permissions are only allowed to the owner of the snippet.
        return obj.owner == request.user
#-------------------------------------------------------------------------------------------------
