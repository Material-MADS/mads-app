from django.contrib import admin

from markdownx.admin import MarkdownxModelAdmin

from .models import PretrainedModel


class PretrainedModelAdmin(MarkdownxModelAdmin):
    list_display = ('name', 'created', 'modified')
    search_fields = ('name',)
    ordering = ('name',)
    filter_horizontal = ('shared_users', 'shared_groups',)

admin.site.register(PretrainedModel, PretrainedModelAdmin)
