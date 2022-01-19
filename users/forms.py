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
# References: Django platform libraries and 'users' folder 'User'
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
from django import forms
from django.contrib.auth.forms import UserCreationForm

from .models import User
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class SignupForm(UserCreationForm):
    email = forms.EmailField(max_length=200, help_text='Required')

    agreement = forms.BooleanField(help_text='')

    class Meta:
        model = User
        fields = ('email', 'password1', 'password2')
#-------------------------------------------------------------------------------------------------
