# ruls.py
from django.conf.urls import include, url
from rest_framework.routers import DefaultRouter

from . import views
from .api import views as api_views


router = DefaultRouter()
router.register(r'api/models', api_views.PretrainedModelAPIViewSet, basename='models-api')

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
