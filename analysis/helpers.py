from django.utils.html import mark_safe
from django import forms

import django_tables2 as tables
import django_filters
from crispy_forms.helper import FormHelper
    # accessibility = tables.Column(accessor="accessibility",
from crispy_forms.layout import ButtonHolder, Field, Fieldset, Layout, Submit
from crequest.middleware import CrequestMiddleware

import pandas as pd

from .models import Workspace

import os

import logging
logger = logging.getLogger(__name__)


class WorkspaceFilterHelper(FormHelper):
    form_method = 'GET'
    layout = Layout(
        Fieldset(
            Field('name', autocomplete='off')
        ),
        ButtonHolder(
            Submit('submit', 'Apply Filter'),
        )
    )


class WorkspaceTable(tables.Table):

    owned = tables.Column(accessor=tables.A('owner'), verbose_name='Owned')

    def render_name(self, value, record):
        url = record.get_absolute_url()
        return mark_safe('<a href="%s">%s</a>' % (url, record))


    def render_description(self, value):

        if len(value) > 50:
            return value[:50] + ' ...'

        return value


    def render_owned(self, value):
        current_request = CrequestMiddleware.get_request()
        user = current_request.user

        if user == value:
            return 'yes'

        return 'no'


    class Meta:
        model = Workspace
        template_name='django_tables2/bootstrap.html'
        # fields = ('name', 'owner', 'accessibility', 'modified',)
        fields = ('name', 'owned', 'accessibility', 'modified', 'description',)
        empty_text = "There are no data source matching the search criteria..."

