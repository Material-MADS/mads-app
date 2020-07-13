# ruls.py
from django.conf.urls import include, url  # noqa

from . import views

urlpatterns = [
    # ex: /
    url(r'^$', views.index, name='index'),

    # url(r'^datasources/', views.DataSourceListView.as_view(), name='datasources'),
    # url(r'^datasources/<int:pk>', views.DataSourceDetailView.as_view(), name='datasource-detail'),
    # url(r'^adddatasource/$', views.adddatasource, name='add-datasource'),
    # url(r'^upload/$', views.upload, name='upload'),
]
