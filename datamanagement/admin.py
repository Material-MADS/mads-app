from django.contrib import admin

from markdownx.admin import MarkdownxModelAdmin

from .models import DataSource


class DataSourceAdmin(MarkdownxModelAdmin):
    list_display = ('name', 'created', 'modified')
    # list_filter = ('shared_groups')
    search_fields = ('name',)
    ordering = ('name',)
    filter_horizontal = ('shared_users', 'shared_groups',)

    # fieldsets = (
    # )
    # add_fieldsets = (
    #     (None, {
    #         'classes': ('wide',),
    #         'fields': ('name', 'description')}),
    # )


admin.site.register(DataSource, DataSourceAdmin)
