from django import forms
from .models import PretrainedModel

from django.contrib.auth.models import Group
from users.models import User

import logging
logger = logging.getLogger(__name__)


class PretrainedModelForm(forms.ModelForm):

    class Meta(object):
        model = PretrainedModel
        fields = ('name', 'owner', 'description', 'accessibility',)

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
        self.fields['groups_hidden'] = forms.CharField(
            max_length=300, label='groups_hidden', widget=forms.HiddenInput,
            initial=s_gnames)
        self.fields['groups_hidden'].required = False

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
        self.users = users
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
        self.groups = groups
        return groups_hidden


class PredictionForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        pretrainedmodel = self.instance
        metadata = pretrainedmodel.metadata
        logger.debug(self.instance)
        for inport in metadata['inports']:
            self.fields[inport['name']] = forms.CharField(
                max_length=100, label=inport['name'],
            )

    class Meta(object):
        model = PretrainedModel
        fields = ()
