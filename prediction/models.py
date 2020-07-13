from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.db import models
from django.db.models.signals import post_delete
from django.dispatch import receiver
from django.urls import reverse

from private_storage.fields import PrivateFileField
from jsonfield import JSONField

import joblib
import numpy as np

from common.models import OwnedResourceModel

import os
import uuid

import logging

logger = logging.getLogger(__name__)



User = get_user_model()


def get_encoded_filepath(instance, filename):
    filename, file_extension = os.path.splitext(filename)
    return os.path.join(str(instance.owner.uuid), str(instance.id) + file_extension)

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
        result = PretrainedModel.objects.filter(pk=self.pk)
        previous = result[0] if len(result) else None
        super(PretrainedModel, self).save()

        # execution
        result = function(*args, **kwargs)

        # if the previous file exists, delete it.
        if previous and previous.file.name != self.file.name:
            previous.file.delete(False)
        return result
    return wrapper


class PretrainedModel(OwnedResourceModel):
    shared_users = models.ManyToManyField(
        'users.User', blank=True,
        related_name='pm_shared_users'
    )
    shared_groups = models.ManyToManyField(
        Group, blank=True, related_name='pm_shared_groups'
    )

    file = PrivateFileField(upload_to=get_encoded_filepath,)
    componentInstance = models.ForeignKey(
        'analysis.ComponentInstance',
        on_delete=models.SET_NULL,
        blank=True, null=True
    )
    metadata = JSONField(blank=True, null=True)

    objects = models.Manager()

    def get_filename(self):
        return os.path.basename(self.file.name)

    def get_absolute_url(self):
        return reverse('prediction:model-detail', kwargs={'id': self.id})

    def get_full_path(self):
        return self.file.full_path

    def get_owned_models(self, user):
        return PretrainedModel.objects.filter(owner=user)

    def get_public_models(self):
        return PretrainedModel.objects.filter(accessibility=PretrainedModel.ACCESSIBILITY_PUBLIC)

    def predict(self, inports):

        outport = {}
        inputs = []
        for key, value in inports.items():
            inputs.append(float(value))    # TODO: support different types: str, etc,
        logger.info(inputs)
        model = joblib.load(self.file)
        out = model.predict([inputs])

        outport = out[0]

        return outport

    @delete_previous_file
    def save(self, force_insert=False, force_update=False, using=None, update_fields=None):
        super(PretrainedModel, self).save()

    @delete_previous_file
    def delete(self, using=None, keep_parents=False):
        super(PretrainedModel, self).delete()


# when deleting model the file is removed
@receiver(post_delete, sender=PretrainedModel)
def delete_file(sender, instance, **kwargs):
    instance.file.delete(False)
