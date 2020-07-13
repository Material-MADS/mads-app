# ruls.py
from django.conf.urls import include, url
from rest_framework.routers import DefaultRouter
from rest_framework.schemas import get_schema_view

from django.urls import path

from . import views
from .api import views as api_views
# from .api import views as views2


# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'api/workspaces', api_views.WorkspaceAPIViewSet, basename='workspace-api')

schema_view = get_schema_view(title='MADS-analysis API')


urlpatterns = [
    # ex: /
    url(r'^$', views.FilteredWorkspaceListView.as_view(), name='index'),

    # url(r'^workspece-new/$', views.WorkspaceCreateView.as_view(),
    #     name='workspace-new'),
    url(r'^workspece-new/$', views.WorkspaceNewUnauthorizedView.as_view(),
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

    # url(r'^schema/$', schema_view),
    url(r'^', include(router.urls)),

    # url(
    #     regex=r'^api/workspace/$',
    #     view=views2.WorkspaceCreateAPIView.as_view(),
    #     name='analysis_rest_api'
    # ),
    # url(
    #     regex=r'^api/workspace/new$',
    #     view=views2.WorkspaceNewAPIView.as_view(),
    #     name='analysis_rest_api-new'
    # ),
    # url(
    #     regex=r'^api/workspace/(?P<id>[-\w]+)/$',
    #     view=views2.WorkspaceRetrieveUpdateDestroyAPIView.as_view(),
    #     name='analysis_rest_api'
    # )
]
