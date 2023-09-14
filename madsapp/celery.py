#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
#          Last Update: Q3 2023
# ________________________________________________________________________________________________
# Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
#          Jun Fujima (Former Lead Developer) [2018-2021]
# ________________________________________________________________________________________________
# Description: Serverside (Django) celery for madsapp project.
# ------------------------------------------------------------------------------------------------
# Notes: Task queue/job queue based on distributed message passing
# ------------------------------------------------------------------------------------------------
# References: Django
#=================================================================================================

# coding: utf-8

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
from __future__ import absolute_import
import os
from django.apps import apps
from celery import Celery

#-------------------------------------------------------------------------------------------------

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "madsapp.settings.local")

app = Celery('madsapp_tasks')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks(lambda: [n.name for n in apps.get_app_configs()])
#-------------------------------------------------------------------------------------------------
