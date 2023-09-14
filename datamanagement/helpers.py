#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
#          Last Update: Q3 2023
# ________________________________________________________________________________________________
# Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
#          Jun Fujima (Former Lead Developer) [2018-2021]
# ________________________________________________________________________________________________
# Description: Serverside (Django) Provided helpers for the 'datamanagement' page
# ------------------------------------------------------------------------------------------------
# Notes: This is one part of the serverside module that allows the user to interact with the
#        'datamanagement' interface of the website. (DB and server Python methods)
# ------------------------------------------------------------------------------------------------
# References: Django platform libraries, crispy forms, bs4, common.helpers, markdown, logging libs
#             and 'datamanagement'-folder's 'models'
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
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

#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class DataSourceFilterHelper(FormHelper):
    form_method = "GET"
    layout = Layout(
        Fieldset(Field("name", autocomplete="off")),
        ButtonHolder(
            Submit("submit", "Apply Filter"),
        ),
    )
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class DataSourceTable(tables.Table):

    name = tables.LinkColumn("datamanagement:datasource-detail", args=[A("id")])

    owned = tables.Column(accessor=tables.A("owner"), verbose_name="Owned")

    def render_description(self, value):

        # only takes the first line
        lines = value.splitlines()
        html = markdown(lines[0])
        text = "".join(BeautifulSoup(html, "html.parser").findAll(text=True))

        if len(text) > 50:
            return text[:50] + " ..."

        return text

    def render_owned(self, value):
        current_request = CrequestMiddleware.get_request()
        user = current_request.user

        if user == value:
            return "yes"

        return "no"

    class Meta:
        model = DataSource
        template_name = "django_tables2/bootstrap.html"
        fields = (
            "name",
            "owned",
            "accessibility",
            "modified",
            "description",
        )
        empty_text = "There are no data source matching the search criteria..."
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class DataSourceFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(lookup_expr="icontains")

    class Meta:
        model = DataSource
        fields = [
            "name",
        ]
        order_by = ["pk"]
#-------------------------------------------------------------------------------------------------
