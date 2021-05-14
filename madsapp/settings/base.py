# https://docs.djangoproject.com/en/1.10/ref/settings/

import os

from decouple import config  # noqa


BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def base_dir_join(*args):
    return os.path.join(BASE_DIR, *args)


SITE_ID = 1

SECURE_HSTS_PRELOAD = True

DEBUG = True

ADMINS = (("Admin", "material.mads@gmail.com"),)

AUTH_USER_MODEL = "users.User"

ALLOWED_HOSTS = []

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

## UPLOAD LIMITS
FILE_UPLOAD_MAX_MEMORY_SIZE = 5242880
# FILE_UPLOAD_MAX_MEMORY_SIZE = 5242880

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # rest framework
    "rest_framework",
    "rest_framework.authtoken",
    "rest_auth",
    # 'upload_form',
    "django_tables2",
    "django_filters",
    "crispy_forms",
    "markdownx",
    "guardian",
    # 'rules',
    "rules.apps.AutodiscoverRulesConfig",
    "datamanagement.apps.DatamanagementConfig",
    "analysis.apps.AnalysisConfig",
    "prediction.apps.PredictionConfig",
    "private_storage",
    "django_js_reverse",
    "webpack_loader",
    "import_export",
    "corsheaders",
    "crequest",
    "common",
    "users",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    # 'whitenoise.middleware.WhiteNoiseMiddleware',
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",  # CORS check when deployment
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "crequest.middleware.CrequestMiddleware",
]

ROOT_URLCONF = "madsapp.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [base_dir_join("templates")],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
                "madsapp.context_processors.export_vars",
            ],
        },
    },
]


WSGI_APPLICATION = "madsapp.wsgi.application"

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

LANGUAGE_CODE = "en-us"

TIME_ZONE = "Asia/Tokyo"

USE_I18N = True

USE_L10N = True

USE_TZ = True

STATICFILES_DIRS = (base_dir_join("assets"),)

# Webpack
WEBPACK_LOADER = {
    "DEFAULT": {
        "CACHE": False,  # on DEBUG should be False
        "STATS_FILE": base_dir_join("assets/bundles/webpack-stats.json"),
        "POLL_INTERVAL": 0.1,
        "IGNORE": [".+\.hot-update.js", ".+\.map"],
    },
    "COMMON": {
        "BUNDLE_DIR_NAME": "assets/bundles/",
        "STATS_FILE": base_dir_join("assets/bundles/common-webpack-stats.json"),
    },
}

# Celery
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"


# For django-guardian and rules
AUTHENTICATION_BACKENDS = (
    "rules.permissions.ObjectPermissionBackend",
    "guardian.backends.ObjectPermissionBackend",
    "django.contrib.auth.backends.ModelBackend",
)

# Redirect to home URL after login (Default redirects to /accounts/profile/)
LOGIN_REDIRECT_URL = "/"


REST_FRAMEWORK = {
    # 'EXCEPTION_HANDLER': 'madsapp.madsapp.utils.custom_exception_handler',
    # 'DEFAULT_RENDERER_CLASSES': (
    #     'djangorestframework_camel_case.render.CamelCaseJSONRenderer',
    #     'rest_framework.renderers.JSONRenderer',
    # ),
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework.authentication.SessionAuthentication",
        "rest_framework.authentication.TokenAuthentication",
        # 'rest_framework.authentication.BasicAuthentication',
    ),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
}

REST_AUTH_SERIALIZERS = {
    "USER_DETAILS_SERIALIZER": "users.serializers.CustomUserDetailsSerializer",
}


CORS_ORIGIN_WHITELIST = ("http://localhost:4200",)

MARKDOWNX_MARKDOWNIFY_FUNCTION = "markdownx.utils.markdownify"


DISABLE_SIGNUP = config("APP_DISABLE_SIGNUP") == "True"
