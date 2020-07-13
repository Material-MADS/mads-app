from django.contrib import admin

from markdownx.admin import MarkdownxModelAdmin

from .models import Workspace
from .models import VisComponent
from .models import ComponentInstance


class WorkspaceAdmin(MarkdownxModelAdmin):
    list_display = ('name', 'created', 'modified')
    search_fields = ('name',)
    ordering = ('name',)
    filter_horizontal = ('shared_users', 'shared_groups',)

class VisComponentAdmin(MarkdownxModelAdmin):
    list_display = ('name', 'created', 'modified')
    search_fields = ('name',)
    ordering = ('name',)
    filter_horizontal = ('shared_users', 'shared_groups',)

class ComponentInstanceAdmin(MarkdownxModelAdmin):
    list_display = ('name', 'created', 'modified')
    search_fields = ('name',)
    ordering = ('name',)
    filter_horizontal = ('shared_users', 'shared_groups',)


admin.site.register(Workspace, WorkspaceAdmin)
admin.site.register(VisComponent, VisComponentAdmin)
admin.site.register(ComponentInstance, ComponentInstanceAdmin)
