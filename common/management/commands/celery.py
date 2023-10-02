# pylint: skip-file

#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
#          Last Update: Q3 2023
# ________________________________________________________________________________________________
# Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
#          Jun Fujima (Former Lead Developer) [2018-2021]
# ________________________________________________________________________________________________
# Description: Serverside (Django) common folder contains all base-root reusable codes that are
#              shared and used by all various "apps" within this web site. This file contains
#              code to support custom management commands (for the pip command line) regarding
#              celery message queue.
# ------------------------------------------------------------------------------------------------
# Notes: This is 'common' code that support various apps and files with all reusable features
#        that is needed for the different pages Django provides
# ------------------------------------------------------------------------------------------------
# References: Django platform libraries and celery libs
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
import getpass
import shlex
from subprocess import PIPE  # nosec

from django.core.management.base import BaseCommand
from django.utils import autoreload

import psutil

#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
def restart_celery():
    for proc in psutil.process_iter():
        if proc.username() != getpass.getuser():  # skip processes not owned by user
            continue
        if proc.name() != 'celery':
            continue
        # SIGTERM should only be sent to parent process, never to children processes
        # see: https://github.com/celery/celery/issues/2700#issuecomment-259716123
        if not proc.children():
            continue
        celery_proc = proc  # found parent celery process
        celery_proc.terminate()
        break
    cmd = "celery worker -A madsapp -l INFO"
    psutil.Popen(shlex.split(cmd), stdout=PIPE)
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        print('Starting celery worker with autoreload')
        autoreload.main(restart_celery)
#-------------------------------------------------------------------------------------------------
