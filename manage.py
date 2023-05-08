#!/usr/bin/env python

#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018-)
#          Last Update: Q2 2023
# ________________________________________________________________________________________________
# Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
#          Jun Fujima (Former Lead Developer) [2018-2021]
# ________________________________________________________________________________________________
# Description: Django Server
# ------------------------------------------------------------------------------------------------
# Notes: This is the DJANGO server environment start file
# ------------------------------------------------------------------------------------------------
# References:
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required libraries
#-------------------------------------------------------------------------------------------------
import os
import sys
from decouple import config

#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
# Run the Server
#-------------------------------------------------------------------------------------------------
if __name__ == "__main__":
    settings_module = config('DJANGO_SETTINGS_MODULE', default=None)

    if sys.argv[1] == 'test':
        if settings_module:
            print("Ignoring config('DJANGO_SETTINGS_MODULE') because it's test. "
                  "Using 'madsapp.settings.test'")
        os.environ.setdefault("DJANGO_SETTINGS_MODULE", "madsapp.settings.test")
    else:
        if settings_module is None:
            print("Error: no DJANGO_SETTINGS_MODULE found. Will NOT start devserver. "
                  "Remember to create .env file at project root. "
                  "Check README for more info.")
            sys.exit(1)
        os.environ.setdefault("DJANGO_SETTINGS_MODULE", settings_module)

    from django.core.management import execute_from_command_line

    execute_from_command_line(sys.argv)

#-------------------------------------------------------------------------------------------------
