# urls.py
from django.conf.urls import include, url  # noqa

from django.urls import path
from django.urls import re_path
from . import views
from datamanagement.api import views as views2
from .models import DataSource
from .helpers import DataSourceFilter

from django_filters.views import FilterView


app_name = 'datamanagement'

urlpatterns = [
    # ex: /
    # url(r'^$', views.index, name='index'),
    re_path(r'^$', views.FilteredDataSourceListView.as_view(), name='index'),
    # path('', views.FilteredDataSourceListView.as_view(), name='index'),

    # re_path(r'^datasources-add/$', views.DataSourceCreateView.as_view(),
    #     name='datasource-add'),
    path('datasources-add/', views.DataSourceCreateView.as_view(),
        name='datasource-add'),

    path('list/', views.FilteredDataSourceListView.as_view(), name='test'),


    # url(r'^datasources/(?P<id>[-\w]+)/$',
    #     views.DataSourceDetailView.as_view(),
    #     name='datasource-detail'),
    path('datasources/<id>/', views.DataSourceDetailView.as_view(), name='datasource-detail'),
    # url(r'^datasources/(?P<id>[-\w]+)/edit/$',
    #     views.DataSourceUpdateView.as_view(), name='datasource-update'),
    path('datasources/<id>/edit/',
        views.DataSourceUpdateView.as_view(), name='datasource-update'),
    # url(r'^datasources/(?P<id>[-\w]+)/delete/$',
    #     views.DataSourceDeleteView.as_view(), name='datasource-delete'),
    path('datasources/<id>/delete/',
        views.DataSourceDeleteView.as_view(), name='datasource-delete'),


    url(
        regex=r'^api/datasource/$',
        view=views2.DataSourceCreateAPIView.as_view(),
        name='datasource_rest_api'
    ),
    url(
        regex=r'^api/datasource/(?P<id>[-\w]+)/$',
        view=views2.DataSourceRetrieveUpdateDestroyAPIView.as_view(),
        name='datasource_rest_api'
    ),

    path('datasources/<id>/content', views.get_data, name='datasource_content')


]
