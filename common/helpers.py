from django.utils.html import mark_safe
from django import forms

import django_tables2 as tables
import django_filters
from crispy_forms.helper import FormHelper
    # accessibility = tables.Column(accessor="accessibility",
from crispy_forms.layout import ButtonHolder, Field, Fieldset, Layout, Submit

import pandas as pd


from .models import OwnedResourceModel

import os


class OwnedResourceModelTable(tables.Table):

    def render_name(self, value, record):
        url = record.get_absolute_url()
        return mark_safe('<a href="%s">%s</a>' % (url, record))

    class Meta:
        model = OwnedResourceModel
        template_name='django_tables2/bootstrap.html'
        # fields = ('name', 'owner', 'accessibility', 'modified',)
        fields = ('name', 'accessibility', 'modified',)


class OwnedResourceModelFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(lookup_expr='icontains')

    class Meta:
        model = OwnedResourceModel
        fields = ['name',]


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
