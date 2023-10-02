#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
#          Last Update: Q3 2023
# ________________________________________________________________________________________________
# Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
#          Jun Fujima (Former Lead Developer) [2018-2021]
# ________________________________________________________________________________________________
# Description: Serverside (Django) Provided admin configs for the 'Analysis' page
# ------------------------------------------------------------------------------------------------
# Notes: This is one part of the serverside module that allows the user to interact with the
#        'analysis' interface of the website. (DB and server Python methods)
# ------------------------------------------------------------------------------------------------
# References: Django platform libraries, markdown libs and 'analysis'-folder's 'models'
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
from django.contrib import admin

from markdownx.admin import MarkdownxModelAdmin

from .models import Workspace
# from .models import VisComponent
# from .models import ComponentInstance

#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class WorkspaceAdmin(MarkdownxModelAdmin):
    list_display = ('name', 'created', 'modified')
    search_fields = ('name',)
    ordering = ('name',)
    filter_horizontal = ('shared_users', 'shared_groups',)
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
# class VisComponentAdmin(MarkdownxModelAdmin):
#     list_display = ('name', 'created', 'modified')
#     search_fields = ('name',)
#     ordering = ('name',)
#     filter_horizontal = ('shared_users', 'shared_groups',)
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
# class ComponentInstanceAdmin(MarkdownxModelAdmin):
#     list_display = ('name', 'created', 'modified')
#     search_fields = ('name',)
#     ordering = ('name',)
#     filter_horizontal = ('shared_users', 'shared_groups',)
#-------------------------------------------------------------------------------------------------


admin.site.register(Workspace, WorkspaceAdmin)
# admin.site.register(VisComponent, VisComponentAdmin)
# admin.site.register(ComponentInstance, ComponentInstanceAdmin)
