from django.conf import settings
from django.conf.urls import include, url  # noqa
from django.contrib import admin
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.urls import path

import django_js_reverse.views
import private_storage.urls
import datamanagement
from rest_framework.documentation import include_docs_urls
from rest_framework.schemas import get_schema_view
from rest_framework.views import exception_handler
from markdownx import urls as markdownx

from users import views

schema_view = get_schema_view(title='MADS APIs')


urlpatterns = [

    url(r'^admin/', admin.site.urls),

    # for rest-auth
    url(r'^rest-auth/', include('rest_auth.urls')),

    url(r'^jsreverse/$', django_js_reverse.views.urls_js, name='js_reverse'),
    url('^private-media/', include(private_storage.urls)),

    # url(r'^$', TemplateView.as_view(template_name='exampleapp/itworks.html'), name='test'),
    url(r'^$', TemplateView.as_view(template_name='index.html'), name='home'),

    # markdownx
    url(r'^markdownx/', include(markdownx)),

    # Terms of services
    path('terms/', TemplateView.as_view(template_name='tos.html'), name='terms'),
]

# from other apps
urlpatterns += [
    url(r'^datamanagement/', include('datamanagement.urls', 'datamanagement')),
    url(r'^analysis/', include(('analysis.urls', 'analysis'),)),
    url(r'^prediction/', include(('prediction.urls', 'prediction'))),
    url(r'^docs-static/', include(('docs.urls', 'docs'))),
    # url(
    #     r'^$', 'django.views.static.serve', kwargs={
    #         'path': 'index.html', 'document_root': settings.STATIC_ROOT}),


    url(r'^docs/', include_docs_urls(title='MADS APIs')),
    # url(r'^docs/$', schema_view),
]


# Add Django site authentication urls (for login, logout, password management)
urlpatterns += [
    url(r'^accounts/', include('django.contrib.auth.urls')),
]

# For signup function
if not settings.DISABLE_SIGNUP:
    urlpatterns += [
        url(r'^signup/$', views.signup, name='signup'),
        path('activate/<slug:uidb64>/<token>/',  views.activate, name='activate'),
    ]

# # for api authentication
urlpatterns += [
    url(r'^api-auth/', include('rest_framework.urls',
                               namespace='rest_framework')),
]


if settings.DEBUG:
    import debug_toolbar
    urlpatterns = [
        url(r'^__debug__/', include(debug_toolbar.urls)),
    ] + urlpatterns

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)


# def custom_exception_handler(exc, context):

#     response = exception_handler(exc, context)
#     # if isinstance(exc, HogeError):
#         # content = {'detail': '{}'.format(exc.args)}
#         # return Response(content, status=status.HTTP_400_BAD_REQUEST)
#     return response
