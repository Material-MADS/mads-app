#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
#          Last Update: Q3 2023
# ________________________________________________________________________________________________
# Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
#          Jun Fujima (Former Lead Developer) [2018-2021]
# ________________________________________________________________________________________________
# Description: Serverside (Django) Provided rest api for the 'Prediction' page involving
#              views
# ------------------------------------------------------------------------------------------------
# Notes:  This is one of the REST API part of the serverside module that allows the user to
#         interact with the 'prediction' interface of the website. (DB and server Python methods)
# ------------------------------------------------------------------------------------------------
# References: Django platform libraries and rest framework, logging, joblib, tempfile libs and
#             'prediction' folder's 'models', 'api' subfolder's 'serializers' and 'permissions'
#             and 'analysis' folder's subfolder 'api' folder's 'utils'
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
from django.db.models import Q
from django.core.files.uploadedfile import SimpleUploadedFile
import logging
from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView
)
from rest_framework import permissions
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import JSONParser
from rest_framework import status
import joblib
from sklearn.pipeline import Pipeline
from doptools import ComplexFragmentor

from ..models import PretrainedModel
from .serializers import PretrainedModelSerializer
from .serializers import PretrainedModelSimpleSerializer
from .permissions import IsOwnerOrReadOnly
from analysis.api.utils.processor import get_model

import sys
import tempfile

logger = logging.getLogger(__name__)

#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class PretrainedModelFilteredLookupMixin(object):

    def get_queryset(self):
        # Fetch only accessible data sources
        queryset = PretrainedModel.objects.all()

        u = self.request.user
        g = list(u.groups.all())

        if u.is_anonymous:
            return PretrainedModel.objects.filter(
                accessibility=PretrainedModel.ACCESSIBILITY_PUBLIC
            )

        queryset = queryset.filter(
            Q(owner=u) |
            Q(accessibility=PretrainedModel.ACCESSIBILITY_PUBLIC) |
            (
                Q(accessibility=PretrainedModel.ACCESSIBILITY_INTERNAL) &
                (Q(shared_users__in=[u]) | Q(shared_groups__in=g))
            )
        ).distinct()

        return queryset
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class PretrainedModelAPIViewSet(
        PretrainedModelFilteredLookupMixin,
        viewsets.ModelViewSet,
    ):
    """
    This viewset automatically provides `list`, `create`, `retrieve`,
    `update` and `destroy` actions.

    Additionally we also provide an extra `test` action.
    """
    queryset = PretrainedModel.objects.all()
    serializer_class = PretrainedModelSerializer
    permission_classes = (
        # permissions.IsAuthenticatedOrReadOnly,
        IsOwnerOrReadOnly,
    )

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action == 'create_with_param':
            permission_classes = [IsOwnerOrReadOnly]
        else:
            permission_classes = [IsOwnerOrReadOnly]
        return [permission() for permission in permission_classes]


    def get_serializer_class(self):
        if self.action == 'list' or self.action == 'owned':
            return PretrainedModelSimpleSerializer
        # if self.action == 'retrieve':
        #     return WorkspaceSimpleSerializer
        return PretrainedModelSerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


    @action(detail=False)
    def owned(self, request):
        owned_models = PretrainedModel.objects.all().filter(owner=request.user)

        serializer = self.get_serializer(owned_models, many=True)
        return Response(serializer.data)


    @action(detail=False, methods=['post'])
    def create_with_param(self, request, *args, **kwargs):
        logger.info('create new model')

        data = request.data

        ##
        # metadata: inports, outports
        # form: inputs, outputs
        metadata = {}
        metadata['inports'] = []
        metadata['outports'] = []

        # metadata
        viewSettings = data['viewSettings']
        for c in viewSettings['newValues']['featureColumns']:
            metadata['inports'].append({'name': c})
        metadata['outports'].append({'name': viewSettings['newValues']['targetColumn']})
        metadata['input_type'] = "SMILES" if viewSettings['view']['type'] == "optimizer" else "descriptors_values"

        pm = PretrainedModel()
        pm.name = data['name']
        pm.owner = request.user

        # file
        arg_get_model = {'data': viewSettings['data'],
                         'view': viewSettings['view'], }
        if 'params' in viewSettings['view'].keys():  # for optimizer component
            description = "Predicts: " + str(viewSettings['view']['settings']['targetColumn']) + "\n"
            description += ("Descriptors: "+str(viewSettings['view']['settings']['method']) + " (" +
                            "; ".join(str(v) for v in viewSettings['view']['settings']['methodArguments'].values()) +
                            ")")
            if viewSettings['view']['settings']['solventColumn']:
                description += ", Solvent ("+viewSettings['view']['settings']['solventColumn']+")"
            if viewSettings['view']['settings']['numericalFeatureColumns']:
                description += (", Passthrough (" +
                                ", ".join(str(v) for v in viewSettings['view']['settings']['numericalFeatureColumns']) +
                                ")")
            description += ("\n Parameters: " +
                            ', '.join('{}={}'.format(*t) for t in viewSettings['view']['params'].items()))
            pm.description = description[:-2]
        model = get_model(arg_get_model)
        if type(model) is Pipeline:
            metadata['input_spec'] = list(model[0].associator.keys()) if type(model[0]) is ComplexFragmentor else ["SMILES"]
        # logger.info(model)
        with tempfile.TemporaryFile('w+b') as f:
            joblib.dump(model, f)
            f.seek(0)
            pm.file = SimpleUploadedFile('test.pkl', f.read())

        serializer = PretrainedModelSerializer(pm)
        pm.metadata = metadata
        pm.save()

        return Response(serializer.data)


    @action(detail=True, methods=['post'])
    def update_with_param(self, request, *args, **kwargs):
        logger.info('update model')
        data = request.data

        ##
        # metadata: inports, outports
        # form: inputs, outputs
        metadata = {}
        metadata['inports'] = []
        metadata['outports'] = []

        # metadata
        viewSettings = data['viewSettings']
        for c in viewSettings['newValues']['featureColumns']:
            metadata['inports'].append({'name': c})
        metadata['outports'].append({'name': viewSettings['newValues']['targetColumn']})

        pm = self.get_object()
        pm.name = data['name']
        pm.owner = request.user
        pm.metadata = metadata

        # file
        model = get_model({
            'data': viewSettings['data'],
            'view': viewSettings['view'],
        })
        logger.info(model)
        with tempfile.TemporaryFile('w+b') as f:
            joblib.dump(model, f)
            f.seek(0)

            pm.file = SimpleUploadedFile('test.pkl', f.read())

        serializer = PretrainedModelSerializer(pm)
        pm.save()

        return Response(serializer.data)
#-------------------------------------------------------------------------------------------------
