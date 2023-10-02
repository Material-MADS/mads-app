#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
#          Last Update: Q3 2023
# ________________________________________________________________________________________________
# Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
#          Jun Fujima (Former Lead Developer) [2018-2021]
# ________________________________________________________________________________________________
# Description: Modules for Serverside Docs object (Django)
# ------------------------------------------------------------------------------------------------
# Notes: This is the urls part of the Docs object as served from the Django server
# ------------------------------------------------------------------------------------------------
# References: Django platform libraries
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
from django.conf.urls import include, url

from . import views
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
urlpatterns = [
    url(r'^$', views.index, name='index'),

    # url(r'^datasources/', views.DataSourceListView.as_view(), name='datasources'),
    # url(r'^datasources/<int:pk>', views.DataSourceDetailView.as_view(), name='datasource-detail'),
    # url(r'^adddatasource/$', views.adddatasource, name='add-datasource'),
    # url(r'^upload/$', views.upload, name='upload'),
]
#-------------------------------------------------------------------------------------------------
