#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
#          Last Update: Q3 2023
# ________________________________________________________________________________________________
# Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
#          Jun Fujima (Former Lead Developer) [2018-2021]
# ________________________________________________________________________________________________
# Description: Serverside (Django) Provided urls for the 'analysis' page
# ------------------------------------------------------------------------------------------------
# Notes: This is one part of the serverside module that allows the user to interact with the
#        'analysis' interface of the website. (DB and server Python methods)
# ------------------------------------------------------------------------------------------------
# References: Django platform libraries, routing, schemas libs and 'analysis'-folder's
#             'views'
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
from django.conf.urls import include, url
from rest_framework.routers import DefaultRouter
from rest_framework.schemas import get_schema_view

from django.urls import path

from . import views
from .api import views as api_views

#-------------------------------------------------------------------------------------------------

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'api/workspaces', api_views.WorkspaceAPIViewSet, basename='workspace-api')

schema_view = get_schema_view(title='MADS-analysis API')


#-------------------------------------------------------------------------------------------------
urlpatterns = [
    url(r'^$', views.FilteredWorkspaceListView.as_view(), name='index'),

    url(r'^workspace-new/$', views.WorkspaceNewUnauthorizedView.as_view(),
        name='workspace-new'),

    url(r'^workspace/(?P<id>[-\w]+)/$',
        views.WorkspaceDetailView.as_view(),
        name='workspace-detail'),
    url(r'^workspace/(?P<id>[-\w]+)/edit/$',
        views.WorkspaceUpdateView.as_view(), name='workspace-update'),
    url(r'^workspace/(?P<id>[-\w]+)/delete/$',
        views.WorkspaceDeleteView.as_view(), name='workspace-delete'),

    # API
    path(
        'api/view-update',
        view=api_views.ViewUpdateAPIs.as_view(),
        name='analysis-view-update'
    ),

    path('api/cuser', view=api_views.CurrentUserView.as_view(), name='cuser'),

    url(r'^', include(router.urls)),
]
#-------------------------------------------------------------------------------------------------
