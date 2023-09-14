#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
#          Last Update: Q3 2023
# ________________________________________________________________________________________________
# Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
#          Jun Fujima (Former Lead Developer) [2018-2021]
# ________________________________________________________________________________________________
# Description: Serverside (Django) Provided rest api for the 'Prediction' page involving
#              serializers
# ------------------------------------------------------------------------------------------------
# Notes:  This is one of the REST API part of the serverside module that allows the user to
#         interact with the 'prediction' interface of the website. (DB and server Python methods)
# ------------------------------------------------------------------------------------------------
# References: rest framework, logging libs and 'prediction' folder's 'models'
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
from rest_framework import serializers

from ..models import PretrainedModel

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
class PretrainedModelSimpleSerializer(serializers.ModelSerializer):

    class Meta:
        model = PretrainedModel
        fields = [
            'id', 'name', 'owner', 'description', 'accessibility',
            'shared_users', 'shared_groups',
        ]
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class PretrainedModelSerializer(serializers.ModelSerializer):
    """Serializer for PretrainedModel"""

    metadata = JSONSerializerField()

    class Meta:
        model = PretrainedModel
        fields = [
            'id', 'name', 'owner', 'description', 'accessibility',
            'shared_users', 'shared_groups', 'metadata',
        ]
#-------------------------------------------------------------------------------------------------
