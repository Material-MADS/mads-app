#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
#          Last Update: Q3 2023
# ________________________________________________________________________________________________
# Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
#          Jun Fujima (Former Lead Developer) [2018-2021]
# ________________________________________________________________________________________________
# Description: Serverside (Django) web application setttings for this deployment mode [local base]
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
DEBUG = True

HOST = 'http://localhost:8000'

SECRET_KEY = 'secret'

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

PRIVATE_STORAGE_ROOT = './private_media/'
PRIVATE_STORAGE_AUTH_FUNCTION = 'datamanagement.models.allow_custom_users'

DEFAULT_FILE_STORAGE = 'django.core.files.storage.FileSystemStorage'
STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.StaticFilesStorage'

AUTH_PASSWORD_VALIDATORS = []  # allow easy passwords only on local

# Celery
CELERY_TASK_ALWAYS_EAGER = True

# Email
INSTALLED_APPS += ('naomi',)
EMAIL_BACKEND = 'naomi.mail.backends.naomi.NaomiBackend'
EMAIL_FILE_PATH = base_dir_join('tmp_email')

# django-debug-toolbar and django-debug-toolbar-request-history
INSTALLED_APPS += ('debug_toolbar',)
MIDDLEWARE += ('debug_toolbar.middleware.DebugToolbarMiddleware',)
INTERNAL_IPS = ['127.0.0.1', '::1']

DEBUG_TOOLBAR_PANELS = [
    # 'ddt_request_history.panels.request_history.RequestHistoryPanel',
    'debug_toolbar.panels.versions.VersionsPanel',
    'debug_toolbar.panels.timer.TimerPanel',
    'debug_toolbar.panels.settings.SettingsPanel',
    'debug_toolbar.panels.headers.HeadersPanel',
    'debug_toolbar.panels.request.RequestPanel',
    'debug_toolbar.panels.sql.SQLPanel',
    'debug_toolbar.panels.staticfiles.StaticFilesPanel',
    'debug_toolbar.panels.templates.TemplatesPanel',
    'debug_toolbar.panels.cache.CachePanel',
    'debug_toolbar.panels.signals.SignalsPanel',
    'debug_toolbar.panels.logging.LoggingPanel',
    'debug_toolbar.panels.redirects.RedirectsPanel',
]

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'standard': {
            'format': '%(levelname)-8s [%(asctime)s] %(name)s: %(message)s'
        },
    },
    'handlers': {
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'standard',
        },
    },
    'loggers': {
        '': {
            'handlers': ['console'],
            'level': 'INFO'
        },
        'celery': {
            'handlers': ['console'],
            'level': 'INFO'
        },
        'datamanagement': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        },
        'rules': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        }
    }
}

JS_REVERSE_JS_MINIFY = False
#-------------------------------------------------------------------------------------------------
