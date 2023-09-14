#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
#          Last Update: Q3 2023
# ________________________________________________________________________________________________
# Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
#          Jun Fujima (Former Lead Developer) [2018-2021]
# ________________________________________________________________________________________________
# Description: Serverside (Django) web application setttings for this deployment mode [test]
# ------------------------------------------------------------------------------------------------
# Notes:  This is a deployment settings file for the website.
# ------------------------------------------------------------------------------------------------
# References: base settings
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
from .base import *  # noqa

#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
SECRET_KEY = 'test'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': base_dir_join('db.sqlite3'),
    }
}

STATIC_ROOT = base_dir_join('staticfiles')
STATIC_URL = '/static/'

MEDIA_ROOT = base_dir_join('mediafiles')
MEDIA_URL = '/media/'

DEFAULT_FILE_STORAGE = 'django.core.files.storage.FileSystemStorage'
STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.StaticFilesStorage'

# Speed up password hashing
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]

# Celery
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True
#-------------------------------------------------------------------------------------------------
