
from django.db.models import Q
from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView
)
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import DataSource
from .serializers import DataSourceSerializer
from .permissions import IsOwnerOrReadOnly


class DataSourceFilteredLookupMixin(object):

    def get_queryset(self):
        # Fetch only accessible data sources
        queryset = DataSource.objects.all()

        u = self.request.user
        g = list(u.groups.all())

        if u.is_anonymous:
            return DataSource.objects.filter(
                accessibility=DataSource.ACCESSIBILITY_PUBLIC
            )

        queryset = queryset.filter(
            Q(owner=u) |
            Q(accessibility=DataSource.ACCESSIBILITY_PUBLIC) |
            (
                Q(accessibility=DataSource.ACCESSIBILITY_INTERNAL) &
                (Q(shared_users__in=[u]) | Q(shared_groups__in=g))
            )
        ).distinct()

        return queryset


class DataSourceCreateAPIView(
    # PermissionRequiredMixin,
    DataSourceFilteredLookupMixin,
    ListCreateAPIView
):
    # permission_required = 'datamanagement.list_datasources'
    # queryset = DataSource.objects.all()
    permission_classes = (permissions.IsAuthenticatedOrReadOnly, )
    serializer_class = DataSourceSerializer
    lookup_field = 'id'


class DataSourceRetrieveUpdateDestroyAPIView(
    DataSourceFilteredLookupMixin,
    RetrieveUpdateDestroyAPIView
):
    # queryset = DataSource.objects.all()
    # permission_required = 'datamanagement.change_datasource'
    permission_classes = (
        permissions.IsAuthenticatedOrReadOnly,
        IsOwnerOrReadOnly,
    )
    serializer_class = DataSourceSerializer
    lookup_field = 'id'


class DataSourceContentsAPIView(
    APIView
):
    permission_classes = (
        permissions.IsAuthenticatedOrReadOnly,
        IsOwnerOrReadOnly,
    )

    def get(self, request, format=None):
        """
        Return the content of a datasource.
        """
        # content =
        return ''
