#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
# ________________________________________________________________________________________________
# Authors: Jun Fujima (Former Lead Developer) [2018-2021]
#          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
# ________________________________________________________________________________________________
# Description: Management modules for Serverside User object
# ------------------------------------------------------------------------------------------------
# Notes: This is the object that manages the custom user admin object on the Django server side
# ------------------------------------------------------------------------------------------------
# References: Django platform libraries and 'users' folder 'models'
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import ugettext_lazy as _

from .models import User
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class CustomUserAdmin(UserAdmin):
    list_display = ('id', 'email', 'created', 'modified')
    list_filter = ('is_active', 'is_staff', 'groups')
    search_fields = ('email',)
    ordering = ('email',)
    filter_horizontal = ('groups', 'user_permissions',)

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser',
                                       'groups', 'user_permissions')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2')}),
    )
#-------------------------------------------------------------------------------------------------

admin.site.register(User, CustomUserAdmin)
