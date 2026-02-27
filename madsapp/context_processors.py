#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
#          Last Update: Q3 2023
# ________________________________________________________________________________________________
# Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
#          Jun Fujima (Former Lead Developer) [2018-2021]
# ________________________________________________________________________________________________
# Description: Serverside (Django) context processor for the web application
# ------------------------------------------------------------------------------------------------
# Notes:  This is a context provider file for the website.
# ------------------------------------------------------------------------------------------------
# References: os lib
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
import os
from django.conf import settings
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
def export_vars(request):
    data = {}
    data['PROJECT_NAME'] = os.environ.get('PROJECT_NAME')
    data['PROJECT_NAME_ABBR'] = os.environ.get('PROJECT_NAME_ABBR')
    data['PROJECT_MAIN_LOGO_PATH'] = os.environ.get('PROJECT_MAIN_LOGO_PATH')
    data['PROJECT_FAVICON_PATH'] = os.environ.get('PROJECT_FAVICON_PATH')
    data['PROJECT_ICON32_PATH'] = os.environ.get('PROJECT_ICON32_PATH')
    data['PROJECT_ICON64_PATH'] = os.environ.get('PROJECT_ICON64_PATH')

    data['APP_DISABLE_SIGNUP'] = os.environ.get('APP_DISABLE_SIGNUP') == 'True'
    data['GOOGLE_ANALYTICS_TRACKING_ID'] = os.environ.get('GOOGLE_ANALYTICS_TRACKING_ID')

    # --- New: News iframe (Google Doc embed) ---
    data['NEWS_IFRAME_URL'] = os.environ.get('NEWS_IFRAME_URL') or getattr(settings, 'NEWS_IFRAME_URL', '')
    data['NEWS_VIEW_URL']   = os.environ.get('NEWS_VIEW_URL')   or getattr(settings, 'NEWS_VIEW_URL', '')


    return data
#-------------------------------------------------------------------------------------------------
