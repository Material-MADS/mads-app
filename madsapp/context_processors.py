import os

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

    return data
