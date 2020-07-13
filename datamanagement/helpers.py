from django.utils.html import mark_safe
from django import forms

import django_tables2 as tables
from django_tables2.utils import A
import django_filters
from crispy_forms.helper import FormHelper
    # accessibility = tables.Column(accessor="accessibility",
from crispy_forms.layout import ButtonHolder, Field, Fieldset, Layout, Submit
from crequest.middleware import CrequestMiddleware
from bs4 import BeautifulSoup

from common.helpers import OwnedResourceModelTable
from common.helpers import OwnedResourceModelFilter

from .models import DataSource

from markdown import markdown

import os

import logging
logger = logging.getLogger(__name__)


class DataSourceFilterHelper(FormHelper):
    form_method = 'GET'
    layout = Layout(
        Fieldset(
            Field('name', autocomplete='off')
        ),
        ButtonHolder(
            Submit('submit', 'Apply Filter'),
        )
    )


class DataSourceTable(tables.Table):

    name = tables.LinkColumn(
        'datamanagement:datasource-detail',
        args=[A('id')])

    owned = tables.Column(accessor=tables.A('owner'), verbose_name='Owned')

    # def render_name(self, value, record):
    #     url = record.get_absolute_url()
    #     return mark_safe('<a href="%s">%s</a>' % (url, record))


    def render_description(self, value):

        html = markdown(value)
        text = ''.join(BeautifulSoup(html, 'html.parser').findAll(text=True))

        if len(text) > 50:
            return text[:50] + ' ...'

        return text


    def render_owned(self, value):
        current_request = CrequestMiddleware.get_request()
        user = current_request.user

        if user == value:
            return 'yes'

        return 'no'


    class Meta:
        model = DataSource
        template_name='django_tables2/bootstrap.html'
        # fields = ('name', 'owner', 'accessibility', 'modified',)
        fields = ('name', 'owned', 'accessibility', 'modified', 'description', )
        empty_text = "There are no data source matching the search criteria..."


class DataSourceFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(lookup_expr='icontains')


    # def __init__(self, data=None, *args, **kwargs):
    #     logger.info('tttt')
    #     # if filterset is bound, use initial values as defaults
    #     if data is not None:
    #         # get a mutable copy of the QueryDict
    #         data = data.copy()

    #         for name, f in self.base_filters.items():
    #             initial = f.extra.get('initial')

    #             # filter param is either missing or empty, use initial as default
    #             if not data.get(name) and initial:
    #                 data[name] = initial

    #     super(DataSourceFilter, self).__init__(data, *args, **kwargs)

    class Meta:
        model = DataSource
        fields = ['name',]
        order_by = ['pk']

