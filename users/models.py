#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
# ________________________________________________________________________________________________
# Authors: Jun Fujima (Former Lead Developer) [2018-2021]
#          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
# ________________________________________________________________________________________________
# Description: Management modules for Serverside User object
# ------------------------------------------------------------------------------------------------
# Notes: This is the part that manages the user object on the Django server side
# ------------------------------------------------------------------------------------------------
# References: Django platform libraries, uuid and timestamp libs and 'users' folder 'managers'
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.utils.translation import ugettext_lazy as _

import uuid as uuid_lib

from common.models import IndexedTimeStampedModel

from .managers import UserManager
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class User(AbstractBaseUser, PermissionsMixin, IndexedTimeStampedModel):
    email = models.EmailField(max_length=255, unique=True)
    is_staff = models.BooleanField(
        default=False,
        help_text=_('Designates whether the user can log into this admin '
                    'site.'))
    is_active = models.BooleanField(
        default=True,
        help_text=_('Designates whether this user should be treated as '
                    'active. Unselect this instead of deleting accounts.'))

    uuid = uuid = models.UUIDField(
        # Used to determine the private file names and by the API to look up
        # the record
        db_index=True,
        default=uuid_lib.uuid4,
        editable=False)

    objects = UserManager()

    USERNAME_FIELD = 'email'

    def get_full_name(self):
        return self.email

    def get_short_name(self):
        return self.email

    def __str__(self):
        return self.email
#-------------------------------------------------------------------------------------------------
