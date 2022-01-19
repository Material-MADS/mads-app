#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
# ________________________________________________________________________________________________
# Authors: Jun Fujima (Former Lead Developer) [2018-2021]
#          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
# ________________________________________________________________________________________________
# Description: Serverside (Django) common folder contains all base-root reusable codes that are
#              shared and used by all various "apps" within this web site. This file contains
#              code to support various 'helpers'.
# ------------------------------------------------------------------------------------------------
# Notes: This is 'common' code that support various apps and files with all reusable features
#        that is needed for the different pages Django provides
# ------------------------------------------------------------------------------------------------
# References: Django platform libraries and helper + pandas libs and
#             this 'common'-folder's 'models'
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
from django.utils.html import mark_safe
from django import forms

import django_tables2 as tables
import django_filters
from crispy_forms.helper import FormHelper
from crispy_forms.layout import ButtonHolder, Field, Fieldset, Layout, Submit

import pandas as pd

from .models import OwnedResourceModel

import os

#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class OwnedResourceModelTable(tables.Table):

    def render_name(self, value, record):
        url = record.get_absolute_url()
        return mark_safe('<a href="%s">%s</a>' % (url, record))

    class Meta:
        model = OwnedResourceModel
        template_name='django_tables2/bootstrap.html'
        # fields = ('name', 'owner', 'accessibility', 'modified',)
        fields = ('name', 'accessibility', 'modified',)
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class OwnedResourceModelFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(lookup_expr='icontains')

    class Meta:
        model = OwnedResourceModel
        fields = ['name',]
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class OwnedResourceModelFilterHelper(FormHelper):
    form_method = 'GET'
    layout = Layout(
        Fieldset(
            Field('name', autocomplete='off')
        ),
        ButtonHolder(
            Submit('submit', 'Apply Filter'),
        )
    )
#-------------------------------------------------------------------------------------------------

#-------------------------------------------------------------------------------------------------
def get_contents_from_file(file):
    """Read contents from the specified file only if the type of the file is "CSS" or "EXCEL".

    Arguments:
        file {FieldFile} -- The file.

    Returns:
        contents, file_type  -- contents, file_type
    """

    contents = None
    file_type = None
    columns = None
    filename, file_extension = os.path.splitext(file.name)

    if (file_extension == '.csv'):
        file_type = 'csv'
        df = pd.read_csv(file)
        json = df.to_json(orient='table')
        contents = json
        columns = df.columns

    elif (file_extension == '.xsl' or file_extension == '.xslx'):
        file_type = 'xsl'

    return contents, file_type, columns
#-------------------------------------------------------------------------------------------------
