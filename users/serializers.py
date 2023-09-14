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
# Notes: This is the serializing object for the user object on the Django server side
# ------------------------------------------------------------------------------------------------
# References: Django platform libraries and serializer lib
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
from rest_framework import serializers
from .models import User
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class CustomUserDetailsSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ('email',)
        read_only_fields = ('email',)
#-------------------------------------------------------------------------------------------------
