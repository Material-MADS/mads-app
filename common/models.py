#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
# ________________________________________________________________________________________________
# Authors: Jun Fujima (Former Lead Developer) [2018-2021]
#          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
# ________________________________________________________________________________________________
# Description: Serverside (Django) common folder contains all base-root reusable codes that are
#              shared and used by all various "apps" within this web site. This file contains
#              code to support various 'models'.
# ------------------------------------------------------------------------------------------------
# Notes: This is 'common' code that support various apps and files with all reusable features
#        that is needed for the different pages Django provides
# ------------------------------------------------------------------------------------------------
# References: Django platform libraries and markdown, fields & uuid libs
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.db import models
from django.utils.translation import ugettext_lazy as _

from model_utils.fields import AutoCreatedField, AutoLastModifiedField
from markdownx.models import MarkdownxField

import uuid

#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class IndexedTimeStampedModel(models.Model):
    created = AutoCreatedField(_('created'), db_index=True)
    modified = AutoLastModifiedField(_('modified'), db_index=True)

    class Meta:
        abstract = True
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class OwnedResourceModel(IndexedTimeStampedModel):
    id = models.UUIDField(
        db_index=True, primary_key=True, default=uuid.uuid4,
        editable=False, help_text="Unique ID for this particular resource"
    )
    name = models.CharField(
        max_length=200, help_text="Enter the name of the resource"
    )
    owner = models.ForeignKey(
        'users.User', on_delete=models.SET_NULL, null=True
    )
    description = MarkdownxField(
        max_length=1000, blank=True,
        help_text="Enter a brief description of the resource"
    )

    ACCESSIBILITY_PRIVATE = 'pri'
    ACCESSIBILITY_INTERNAL = 'int'
    ACCESSIBILITY_PUBLIC = 'pub'

    ACCESSIBILITY = (
        (ACCESSIBILITY_PRIVATE, 'Private'),
        (ACCESSIBILITY_INTERNAL, 'Internal'),
        (ACCESSIBILITY_PUBLIC, 'Public')
    )

    accessibility = models.CharField(max_length=3, choices=ACCESSIBILITY, blank=False, default='pri')
    shared_users = models.ManyToManyField(
        'users.User', blank=True,
        related_name='shared_users'
    )
    shared_groups = models.ManyToManyField(
        Group, blank=True, related_name='shared_groups'
    )

    objects = models.Manager()


    def __str__(self):
        """
        String for representing the model object (in Admin site etc.)
        """
        return self.name


    def is_owned_by(self, user):
        return self.owner == user


    def allows_access_to(self, user):
        # check if the resource is public
        if (self.accessibility == OwnedResourceModel.ACCESSIBILITY_PUBLIC):
            return True

        # check if the user is the owner of the file
        if self.owner == user:
            return True

        # check if the resource is internal and the request user is a member of shared groups
        if (self.accessibility == OwnedResourceModel.ACCESSIBILITY_INTERNAL):
            if (self.shared_users.filter(pk=user.pk).count() > 0):
                return True

            for g in user.groups.all():
                if self.shared_groups.filter(pk=g.pk).count() > 0:
                    return True

        return False

    def get_absolute_url(self):
        # return reverse('datamanagement:datasource-detail', kwargs={'id': self.id})
        pass  # not implemented

    def get_owned_resources(self, user):
        return OwnedResourceModel.objects.filter(owner=user)

    class Meta:
        abstract = True
#-------------------------------------------------------------------------------------------------
