#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
# ________________________________________________________________________________________________
# Authors: Jun Fujima (Former Lead Developer) [2018-2021]
#          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
# ________________________________________________________________________________________________
# Description: Serverside (Django) WSGI config for madsapp project.
# ------------------------------------------------------------------------------------------------
# Notes: It exposes the WSGI callable as a module-level variable named `application`.
# ------------------------------------------------------------------------------------------------
# References: Django
#=================================================================================================

"""
For more information on this file, see
https://docs.djangoproject.com/en/1.10/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "madsapp.settings.production")
# os.environ.setdefault("DJANGO_SETTINGS_MODULE", "madsapp.settings.local")

application = get_wsgi_application()
