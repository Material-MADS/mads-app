from django import forms
from django.contrib.auth.forms import UserCreationForm

from .models import User


class SignupForm(UserCreationForm):
    email = forms.EmailField(max_length=200, help_text='Required')

    agreement = forms.BooleanField(help_text='aaaa')

    class Meta:
        model = User
        fields = ('email', 'password1', 'password2')
