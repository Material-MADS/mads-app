#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
# ________________________________________________________________________________________________
# Authors: Jun Fujima (Former Lead Developer) [2018-2021]
#          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
# ________________________________________________________________________________________________
# Description: Serverside (Django) Provided urls for the 'Prediction' page
# ------------------------------------------------------------------------------------------------
# Notes: This is one part of the serverside module that allows the user to interact with the
#        'prediction' interface of the website. (DB and server Python methods)
# ------------------------------------------------------------------------------------------------
# References: Django platform libraries, routing and view-api libs and 'prediction'-folder's
#             'views'
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
from django.conf.urls import include, url
from rest_framework.routers import DefaultRouter

from . import views
from .api import views as api_views
#-------------------------------------------------------------------------------------------------

router = DefaultRouter()
router.register(r'api/models', api_views.PretrainedModelAPIViewSet, basename='models-api')

#-------------------------------------------------------------------------------------------------
urlpatterns = [
    # ex: /
    url(r'^$', views.FilteredPModelListView.as_view(), name='index'),

    url(r'^model/(?P<id>[-\w]+)/$',
        views.PretrainedModelDetailView.as_view(),
        name='model-detail'),
    url(r'^model/(?P<id>[-\w]+)/edit/$',
        views.PretrainedModelUpdateView.as_view(), name='model-update'),
    url(r'^model/(?P<id>[-\w]+)/delete/$',
        views.PretrainedModelDeleteView.as_view(), name='model-delete'),

    # for APIs
    url(r'^', include(router.urls)),
]
#-------------------------------------------------------------------------------------------------
