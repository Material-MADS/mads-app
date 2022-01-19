#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
# ________________________________________________________________________________________________
# Authors: Jun Fujima (Former Lead Developer) [2018-2021]
#          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
# ________________________________________________________________________________________________
# Description: Serverside (Django) Provided rest api for the 'Analysis' page involving
#              serializers
# ------------------------------------------------------------------------------------------------
# Notes:  This is one of the REST API part of the serverside module that allows the user to
#         interact with the 'analysis' interface of the website. (DB and server Python methods)
# ------------------------------------------------------------------------------------------------
# References: rest framework, logging libs and 'analysis' folder's 'models'
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
from rest_framework import serializers

from ..models import Workspace
from ..models import VisComponent
from ..models import ComponentInstance

import logging
logger = logging.getLogger(__name__)

#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class JSONSerializerField(serializers.Field):
    """Serializer for JSONField"""

    def to_internal_value(self, data):
        return data

    def to_representation(self, value):
        return value
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class WorkspaceSimpleSerializer(serializers.ModelSerializer):

    class Meta:
        model = Workspace
        fields = [
            'id', 'name', 'owner', 'description', 'accessibility',
            'shared_users', 'shared_groups',
        ]
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class WorkspaceSerializer(serializers.ModelSerializer):

    contents = JSONSerializerField()
    is_owned = serializers.SerializerMethodField()

    def get_is_owned(self, obj):
        request = self.context.get('request', None)

        if request is not None:
            user = request.user
            return user == obj.owner

        return "error"

    class Meta:
        model = Workspace
        fields = [
            'id', 'name', 'owner', 'description', 'accessibility',
            'shared_users', 'shared_groups', 'contents',
            'is_owned',
        ]
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class VisComponentSerializer(serializers.ModelSerializer):
    class Meta:
        model = VisComponent
        fields = [
            'id', 'name', 'owner', 'description', 'accessibility',
            'shared_users', 'shared_groups', 'contents'
        ]
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class ComponentInstanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComponentInstance
        fields = [
            'id', 'name', 'owner', 'description', 'accessibility',
            'shared_users', 'shared_groups', 'contents'
        ]
#-------------------------------------------------------------------------------------------------
