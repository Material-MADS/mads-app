#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
#          Last Update: Q3 2023
# ________________________________________________________________________________________________
# Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
#          Jun Fujima (Former Lead Developer) [2018-2021]
# ________________________________________________________________________________________________
# Description: Serverside (Django) Provided models for the 'analysis' page
# ------------------------------------------------------------------------------------------------
# Notes: This is one part of the serverside module that allows the user to interact with the
#        'analysis' interface of the website. (DB and server Python methods)
# ------------------------------------------------------------------------------------------------
# References: Django platform libraries, json, uuid libs and 'common'-folder's 'models'
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.db import models
from django.urls import reverse

from common.models import OwnedResourceModel
from jsonfield import JSONField

import uuid

#-------------------------------------------------------------------------------------------------

User = get_user_model()

#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class Workspace(OwnedResourceModel):
    shared_users = models.ManyToManyField(
        'users.User', blank=True,
        related_name='workspace_shared_users'
    )
    shared_groups = models.ManyToManyField(
        Group, blank=True, related_name='workspace_shared_groups'
    )
    contents = JSONField(null=True)

    def get_absolute_url(self):
        return reverse('analysis:workspace-detail', kwargs={'id': self.id})
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class VisComponent(OwnedResourceModel):
    shared_users = models.ManyToManyField(
        'users.User', blank=True,
        related_name='viscomponent_shared_users'
    )
    shared_groups = models.ManyToManyField(
        Group, blank=True, related_name='viscomponent_shared_groups'
    )
    contents = JSONField(null=True)
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class ComponentInstance(OwnedResourceModel):
    shared_users = models.ManyToManyField(
        'users.User', blank=True,
        related_name='ci_shared_users'
    )
    shared_groups = models.ManyToManyField(
        Group, blank=True, related_name='ci_shared_groups'
    )
    componentType = models.ForeignKey('VisComponent', on_delete=models.SET_NULL, null=True)
    contents = JSONField(null=True)
#-------------------------------------------------------------------------------------------------
