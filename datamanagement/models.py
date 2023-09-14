#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
#          Last Update: Q3 2023
# ________________________________________________________________________________________________
# Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
#          Jun Fujima (Former Lead Developer) [2018-2021]
# ________________________________________________________________________________________________
# Description: Serverside (Django) Provided models for the 'datamanagement' page
# ------------------------------------------------------------------------------------------------
# Notes: This is one part of the serverside module that allows the user to interact with the
#        'datamanagement' interface of the website. (DB and server Python methods)
# ------------------------------------------------------------------------------------------------
# References: Django platform libraries, private-storage, uuid, common.modelsm logging, uuid libs
#             and 'User'-folder's 'models'
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
from django.db import models
from django.db.models.signals import post_delete
from django.dispatch import receiver
from django.contrib.auth.models import Group
from django.urls import reverse

from private_storage.fields import PrivateFileField

import uuid  # Required for unique book instance
import os

import logging
logger = logging.getLogger(__name__)

from common.models import IndexedTimeStampedModel
from common.models import OwnedResourceModel
from users.models import User

#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
def get_encoded_filepath(instance, filename):
    filename, file_extension = os.path.splitext(filename)
    return os.path.join(str(instance.owner.uuid), str(instance.id) + file_extension)
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
def allow_custom_users(private_file):
    request = private_file.request

    # check if the user is superuser
    if request.user.is_authenticated and request.user.is_superuser:
        return True

    entries = DataSource.objects.filter(file=private_file.relative_name)

    logger.info(len(entries))
    # logger.info(entries[0].owner)

    if len(entries) == 0:
        return False  # no record for this file

    if (entries[0].allows_access_to(request.user)):
        return True

    return False
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
def delete_previous_file(function):
    """The decorator for deleting unnecessary file.

    :param function: main function
    :return: wrapper
    """
    def wrapper(*args, **kwargs):
        """Wrapper function.

        :param args: params
        :param kwargs: keyword params
        :return: result
        """
        self = args[0]

        # get the previous filename
        result = DataSource.objects.filter(pk=self.pk)
        previous = result[0] if len(result) else None
        super(DataSource, self).save()

        # execution
        result = function(*args, **kwargs)

        # if the previous file exists, delete it.
        if previous and previous.file.name != self.file.name:
            logger.info(str(self.file))
            logger.info(str(previous.file))
            previous.file.delete(False)
        return result
    return wrapper
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class DataSource(OwnedResourceModel):

    file = PrivateFileField(upload_to=get_encoded_filepath, max_file_size=4194304, content_types="text/csv")
    # file = PrivateFileField("File")
    shared_users = models.ManyToManyField(
        'users.User', blank=True,
        related_name='datasource_shared_users'
    )
    shared_groups = models.ManyToManyField(
        Group, blank=True, related_name='datasource_shared_groups'
    )

    objects = models.Manager()


    def get_filename(self):
        return os.path.basename(self.file.name)

    def get_absolute_url(self):
        return reverse('datamanagement:datasource-detail', kwargs={'id': self.id})

    def get_full_path(self):
        return self.file.full_path

    def get_owned_datasources(self, user):
        return DataSource.objects.filter(owner=user)

    def get_public_datasources(self):
        return DataSource.objects.filter(accessibility=DataSource.ACCESSIBILITY_PUBLIC)

    @delete_previous_file
    def save(self, force_insert=False, force_update=False, using=None, update_fields=None):
        super(DataSource, self).save()

    @delete_previous_file
    def delete(self, using=None, keep_parents=False):
        super(DataSource, self).delete()
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
# when deleting model the file is removed
@receiver(post_delete, sender=DataSource)
def delete_file(sender, instance, **kwargs):
    instance.file.delete(False)
#-------------------------------------------------------------------------------------------------
