#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
#          Last Update: Q3 2023
# ________________________________________________________________________________________________
# Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
#          Jun Fujima (Former Lead Developer) [2018-2021]
# ________________________________________________________________________________________________
# Description: Modules for Serverside datamanagement object (Django)
# ------------------------------------------------------------------------------------------------
# Notes: This is the urls part of the datamanagement object as served from the Django server
# ------------------------------------------------------------------------------------------------
# References: Django platform libraries
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
from django.conf.urls import include, url  # noqa
from django.urls import path
from django.urls import re_path
from . import views
from datamanagement.api import views as views2
from .models import DataSource
from .helpers import DataSourceFilter

from django_filters.views import FilterView

#-------------------------------------------------------------------------------------------------

app_name = "datamanagement"

#-------------------------------------------------------------------------------------------------
urlpatterns = [
    # ex: /
    path("", views.FilteredDataSourceListView.as_view(), name="index"),
    path("datasources-add/", views.DataSourceCreateView.as_view(), name="datasource-add"),
    path("list/", views.FilteredDataSourceListView.as_view(), name="test"),
    path(
        "datasources/<id>/",
        views.DataSourceDetailView.as_view(),
        name="datasource-detail",
    ),
    path(
        "datasources/<id>/edit/",
        views.DataSourceUpdateView.as_view(),
        name="datasource-update",
    ),
    path(
        "datasources/<id>/delete/",
        views.DataSourceDeleteView.as_view(),
        name="datasource-delete",
    ),
    url(
        regex=r"^api/datasource/$",
        view=views2.DataSourceCreateAPIView.as_view(),
        name="datasource_rest_api",
    ),
    url(
        regex=r"^api/datasource/(?P<id>[-\w]+)/$",
        view=views2.DataSourceRetrieveUpdateDestroyAPIView.as_view(),
        name="datasource_rest_api",
    ),
    path("datasources/<id>/content", views.get_data, name="datasource_content"),
]
#-------------------------------------------------------------------------------------------------
