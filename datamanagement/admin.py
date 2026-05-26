#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
#          Last Update: Q3 2023
# ________________________________________________________________________________________________
# Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
#          Jun Fujima (Former Lead Developer) [2018-2021]
# ________________________________________________________________________________________________
# Description: Serverside (Django) Provided admin configs for the 'datamanagement' page
# ------------------------------------------------------------------------------------------------
# Notes: This is one part of the serverside module that allows the user to interact with the
#        'datamanagement' interface of the website. (DB and server Python methods)
# ------------------------------------------------------------------------------------------------
# References: Django platform libraries, markdown libs and 'datamanagement'-folder's 'models'
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
from django.contrib import admin
from django.urls import reverse
from django.utils.html import format_html
from markdownx.admin import MarkdownxModelAdmin
from .models import DataSource

#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class DataSourceAdmin(MarkdownxModelAdmin):
    list_display = (
        'name',
        'owner_username',
        'display_file_size',
        'display_num_of_rows',
        'display_num_of_columns',
        'created',
        'modified',
    )
    readonly_fields = ('display_file_size', 'display_num_of_rows', 'display_num_of_columns')
    # list_filter = ('shared_groups')
    search_fields = ('name', 'owner__email')
    ordering = ('name',)
    filter_horizontal = ('shared_users', 'shared_groups',)

    def display_file_size(self, obj):
        """Display the file size in human-readable format"""
        if obj.file:
            size = obj.file.size
            for unit in ['B', 'KB', 'MB', 'GB']:
                if size < 1024.0:
                    return f"{size:.2f} {unit}"
                size /= 1024.0
            return f"{size:.2f} TB"
        return "No file"

    display_file_size.short_description = "File Size"
    display_file_size.admin_order_field = "file_size"

    def display_num_of_rows(self, obj):
        return obj.num_of_rows if obj.num_of_rows is not None else "N/A"

    display_num_of_rows.short_description = "Rows"
    display_num_of_rows.admin_order_field = "num_of_rows"

    def display_num_of_columns(self, obj):
        return obj.num_of_columns if obj.num_of_columns is not None else "N/A"

    display_num_of_columns.short_description = "Columns"
    display_num_of_columns.admin_order_field = "num_of_columns"

    def owner_username(self, obj):
        """Display owner's username/email as a link to the admin change page"""
        if obj.owner:
            try:
                url = reverse('admin:users_user_change', args=(obj.owner.pk,))
                return format_html('<a href="{}">{}</a>', url, str(obj.owner))
            except Exception:
                return str(obj.owner)
        return "(no owner)"

    owner_username.short_description = "Owner"
    owner_username.admin_order_field = "owner__email"

#-------------------------------------------------------------------------------------------------

admin.site.register(DataSource, DataSourceAdmin)
