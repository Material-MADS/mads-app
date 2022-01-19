#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
# ________________________________________________________________________________________________
# Authors: Jun Fujima (Former Lead Developer) [2018-2021]
#          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
# ________________________________________________________________________________________________
# Description: Serverside (Django) Provided rest api for the 'datamanagement' page involving
#              serializers
# ------------------------------------------------------------------------------------------------
# Notes:  This is one of the REST API part of the serverside module that allows the user to
#         interact with the 'datamanagement' interface of the website. (DB & server Python methods)
# ------------------------------------------------------------------------------------------------
# References: rest framework libs and 'datamanagement' folder's 'models'
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
from rest_framework import serializers
from ..models import DataSource

#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class DataSourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataSource
        fields = ['id', 'name', 'owner', 'description', 'file', 'accessibility', 'shared_users', 'shared_groups']
#-------------------------------------------------------------------------------------------------
