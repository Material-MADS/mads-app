#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
# ________________________________________________________________________________________________
# Authors: Jun Fujima (Former Lead Developer) [2018-2021]
#          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
# ________________________________________________________________________________________________
# Description: Serverside (Django) Provided admin configs for the 'Prediction' page
# ------------------------------------------------------------------------------------------------
# Notes: This is one part of the serverside module that allows the user to interact with the
#        'prediction' interface of the website. (DB and server Python methods)
# ------------------------------------------------------------------------------------------------
# References: Django platform libraries, markdown libs and 'prediction'-folder's 'models'
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
from django.contrib import admin
from markdownx.admin import MarkdownxModelAdmin
from .models import PretrainedModel

#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class PretrainedModelAdmin(MarkdownxModelAdmin):
    list_display = ('name', 'created', 'modified')
    search_fields = ('name',)
    ordering = ('name',)
    filter_horizontal = ('shared_users', 'shared_groups',)
#-------------------------------------------------------------------------------------------------

admin.site.register(PretrainedModel, PretrainedModelAdmin)
