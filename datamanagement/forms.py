#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
# ________________________________________________________________________________________________
# Authors: Jun Fujima (Former Lead Developer) [2018-2021]
#          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
# ________________________________________________________________________________________________
# Description: Serverside (Django) Provided forms for the 'datamanagement' page
# ------------------------------------------------------------------------------------------------
# Notes: This is one part of the serverside module that allows the user to interact with the
#        'datamanagement' interface of the website. (DB and server Python methods)
# ------------------------------------------------------------------------------------------------
# References: Django platform libraries, logging libs and 'datamanagement'-folder's 'models' as
#             well as 'User'-folder's 'models'
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
import magic
from django import forms
from .models import DataSource
from django.contrib.auth.models import Group
from users.models import User

import logging
logger = logging.getLogger(__name__)

#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
# https://developer.mozilla.org/ja/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Complete_list_of_MIME_types
supported_file_types = [
    'text/plain',
    'application/csv',
    # 'application/pdf',
    # 'image/png',
    # 'image/jpeg',
    # 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    # 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    # 'application/msword',
    # 'application/vnd.ms-excel',
]
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class DataSourceForm(forms.ModelForm):

    class Meta(object):
        model = DataSource
        fields = ('name', 'owner', 'description', 'file', 'accessibility',)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        s_users = self.instance.shared_users
        s_emails = [user.email for user in s_users.all()]
        s_emails = ','.join(s_emails)

        s_groups = self.instance.shared_groups
        s_gnames = [group.name for group in s_groups.all()]
        s_gnames = ','.join(s_gnames)

        self.fields['users_hidden'] = forms.CharField(
            max_length=300, label='users_hidden', widget=forms.HiddenInput,
            initial=s_emails
        )
        self.fields['users_hidden'].required = False
        # self.fields['users_hidden'].validators.append(validate_users_hidden)
        self.fields['groups_hidden'] = forms.CharField(
            max_length=300, label='groups_hidden', widget=forms.HiddenInput,
            initial=s_gnames)
        self.fields['groups_hidden'].required = False

        self.users = None
        self.groups = None

    def clean_users_hidden(self):
        users_hidden = self.cleaned_data['users_hidden']
        users = []
        if users_hidden:
            user_emails = users_hidden.split(',')

            for user_email in user_emails:
                try:
                    user = User.objects.get(email=user_email)
                    users.append(user)
                except User.DoesNotExist:
                    raise forms.ValidationError(
                        'User {0} is not registered in the system.'.
                        format(user_email)
                    )
        self.users = users  # used in views.py
        return users_hidden

    def clean_groups_hidden(self):
        groups_hidden = self.cleaned_data['groups_hidden']
        groups = []
        if groups_hidden:
            group_names = groups_hidden.split(',')

            for group_name in group_names:
                try:
                    group = Group.objects.get(name=group_name)
                    groups.append(group)
                except Group.DoesNotExist:
                    raise forms.ValidationError(
                        'Group {0} is not registered in the system.'.
                        format(group_name)
                    )
        self.groups = groups  # used in views.py
        return groups_hidden

    def clean_file(self):
        file = self.cleaned_data['file']

        mime = magic.Magic(mime=True)

        if hasattr(file, 'temporary_file_path'):
            # file is temporary on the disk, so we can get full path of it.
            mime_type = mime.from_file(file.temporary_file_path(), mime=True)
        else:
            # file is on the memory
            mime_type = mime.from_buffer(file.read())

        logger.info(mime_type)
        if mime_type not in supported_file_types:
            logger.warning(mime_type)
            raise forms.ValidationError(f'The filetype "{mime_type}" is not supported.')

        logger.info('file is cleaned')

        return file
#-------------------------------------------------------------------------------------------------
