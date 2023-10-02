#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
#          Last Update: Q3 2023
# ________________________________________________________________________________________________
# Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
#          Jun Fujima (Former Lead Developer) [2018-2021]
# ________________________________________________________________________________________________
# Description: Serverside (Django) Provided rest api for the 'Analysis' page involving
#              views
# ------------------------------------------------------------------------------------------------
# Notes:  This is one of the REST API part of the serverside module that allows the user to
#         interact with the 'analysis' interface of the website. (DB and server Python methods)
# ------------------------------------------------------------------------------------------------
# References: Django platform libraries and rest framework, logging, sys libs and
#             'analysis' folder's 'models', 'api' subfolder's 'serializers' and 'permissions'
#             and 'utilz' folder's 'processor', 'users' folder's 'serializers'
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
from django.db.models import Q
import logging
from rest_framework.generics import ( ListCreateAPIView, RetrieveUpdateDestroyAPIView )
from rest_framework import permissions
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import JSONParser
from rest_framework import status

from ..models import Workspace
from .serializers import WorkspaceSerializer
from .serializers import WorkspaceSimpleSerializer
from .permissions import IsOwnerOrReadOnly
from .utils.processor import process_view
from users.serializers import CustomUserDetailsSerializer

import sys

logger = logging.getLogger(__name__)

#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class WorkspaceFilteredLookupMixin(object):

    def get_queryset(self):
        # Fetch only accessible data sources
        queryset = Workspace.objects.all()

        u = self.request.user
        g = list(u.groups.all())

        if u.is_anonymous:
            return Workspace.objects.filter(
                accessibility=Workspace.ACCESSIBILITY_PUBLIC
            )

        queryset = queryset.filter(
            Q(owner=u) |
            Q(accessibility=Workspace.ACCESSIBILITY_PUBLIC) |
            (
                Q(accessibility=Workspace.ACCESSIBILITY_INTERNAL) &
                (Q(shared_users__in=[u]) | Q(shared_groups__in=g))
            )
        ).distinct()

        return queryset
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class WorkspaceCreateAPIView(
    WorkspaceFilteredLookupMixin,
    ListCreateAPIView
):
    permission_classes = (permissions.IsAuthenticatedOrReadOnly, )
    serializer_class = WorkspaceSerializer
    lookup_field = 'id'
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class WorkspaceRetrieveUpdateDestroyAPIView(
    WorkspaceFilteredLookupMixin,
    RetrieveUpdateDestroyAPIView
):
    permission_classes = (
        permissions.IsAuthenticatedOrReadOnly,
        IsOwnerOrReadOnly,
    )
    serializer_class = WorkspaceSerializer
    lookup_field = 'id'
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class DataSourceContentsAPIView(
    RetrieveUpdateDestroyAPIView
):
    pass
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class WorkspaceNewAPIView(APIView):

    permission_classes = (
        permissions.IsAuthenticatedOrReadOnly,
        IsOwnerOrReadOnly,
    )

    def post(self, request, format=None):
        val = request.session.get('test', None)
        if val:
            logger.debug(val)
            request.session['test'] = request.data
            return Response(val)

        request.session['test'] = request.data
        return Response('testtest')
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class WorkspaceAPIViewSet(
        WorkspaceFilteredLookupMixin,
        viewsets.ModelViewSet,
    ):
    """
    This viewset automatically provides `list`, `create`, `retrieve`,
    `update` and `destroy` actions.

    Additionally we also provide an extra `test` action.
    """
    queryset = Workspace.objects.all()
    serializer_class = WorkspaceSerializer
    permission_classes = ( IsOwnerOrReadOnly, )

    def get_serializer_class(self):
        if self.action == 'list' or self.action == 'owned':
            return WorkspaceSimpleSerializer
        return WorkspaceSerializer


    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


    @action(detail=False)
    def owned(self, request):
        owned_workspaces = Workspace.objects.all().filter(owner=request.user)

        serializer = self.get_serializer(owned_workspaces, many=True)
        return Response(serializer.data)


    @action(detail=True)
    def test(self, request, *args, **kwargs):
        logger.info('test')


    @action(detail=False)
    def test_new(self, request, *args, **kwargs):
        logger.info('update the state')
        data = request.session.get('temp_state')
        if data == None:
            return Response({'status': 'error: empty model'}, status=500)
        # workspace = Workspace
        logger.info(data)
        serializer = WorkspaceSerializer(data=data)

        result = serializer.is_valid()
        logger.info(result)
        if result:
            # ws = serializer.save()
            ws = Workspace(serializer.validated_data)
        logger.info(ws.id)

        return Response({'status': 'created'})

    @action(detail=False)
    def temp_update(self, request, *args, **kwargs):
        logger.info('update the state')
        data = request.session.get('temp_state')
        if data == None:
            return Response({'status': 'error: empty model'}, status=500)
        # workspace = Workspace
        logger.info(data)
        serializer = WorkspaceSerializer(data=data)
        result = serializer.is_valid()
        logger.info(result)
        if result:
            ws = serializer.save()
        logger.info(ws)

        return Response({'status': 'created'})


    @action(detail=False)
    def clear(self, request, *args, **Kwargs):
        logger.info(request.session.get('temp_state'))
        del request.session['temp_state']

        return Response({'status': 'test'})


    @action(detail=False)
    def save(self, request, *args, **Kwargs):
        request.session.get('temp_state')
        data = request.session.get('temp_state')
        if data == None:
            return Response({'status': 'error: empty model'}, status=500)

        logger.info(data)
        serializer = WorkspaceSerializer(data=data)
        result = serializer.is_valid()
        logger.info(result)
        if result:
            ws = serializer.save()
        else:
            logger.error('error')
            logger.error(serializer.errors)
            return Response({'status': 'error: data is incorrect'}, status=500)

        return Response({'status': 'test'})
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class ViewUpdateAPIs(APIView):

    permission_classes = (
        permissions.AllowAny,
    )
    parser_classes = (JSONParser,)

    def handle_exception(self, exc):
        try:
            return super(ViewUpdateAPIs, self).handle_exception(exc)
        except (TypeError, ValueError):
            content = {'detail': exc.args}
            return Response(content, status=status.HTTP_400_BAD_REQUEST)


    def get(self, request):
        return Response({'test': 'bbb'})


    def post(self, request):
        result = {'status': 'success' }

        result = process_view(request.data)

        if ('status' in result.keys() and result['status'].startswith('error')):
            return Response(result, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(result)
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class CurrentUserView(APIView):
    permission_classes = (
        permissions.AllowAny,
    )

    def get(self, request):
        serializer = CustomUserDetailsSerializer(request.user)
        return Response(serializer.data)
#-------------------------------------------------------------------------------------------------
