#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
# ________________________________________________________________________________________________
# Authors: Jun Fujima (Former Lead Developer) [2018-2021]
#          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
# ________________________________________________________________________________________________
# Description: Serverside (Django) common folder contains all base-root reusable codes that are
#              shared and used by all various "apps" within this web site. This file contains
#              code to test this common code.
# ------------------------------------------------------------------------------------------------
# Notes: This is test code for the 'common' code that support various apps and files with all
#        reusable features that is needed for the different pages Django provides
# ------------------------------------------------------------------------------------------------
# References: Django platform libraries and model_mommy libs
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
from django.test import Client, TestCase
from django.urls import reverse

from model_mommy import mommy

#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class TestCaseUtils(TestCase):

    def setUp(self):
        self._user_password = '123456'
        self.user = mommy.prepare('users.User', email='user@email.com')
        self.user.set_password(self._user_password)
        self.user.save()

        self.auth_client = Client()
        self.auth_client.login(email=self.user.email, password=self._user_password)

    def reverse(self, name, *args, **kwargs):
        """ Reverse a url, convenience to avoid having to import reverse in tests """
        return reverse(name, args=args, kwargs=kwargs)

    def assertResponse200(self, response):
        """ Given response has status_code 200 OK"""
        self.assertEqual(response.status_code, 200)

    def assertResponse201(self, response):
        """ Given response has status_code 201 CREATED"""
        self.assertEqual(response.status_code, 201)

    def assertResponse301(self, response):
        """ Given response has status_code 301 MOVED PERMANENTLY"""
        self.assertEqual(response.status_code, 301)

    def assertResponse302(self, response):
        """ Given response has status_code 302 FOUND"""
        self.assertEqual(response.status_code, 302)

    def assertResponse400(self, response):
        """ Given response has status_code 400 BAD REQUEST"""
        self.assertEqual(response.status_code, 400)

    def assertResponse401(self, response):
        """ Given response has status_code 401 UNAUTHORIZED"""
        self.assertEqual(response.status_code, 401)

    def assertResponse403(self, response):
        """ Given response has status_code 403 FORBIDDEN"""
        self.assertEqual(response.status_code, 403)

    def assertResponse404(self, response):
        """ Given response has status_code 404 NOT FOUND"""
        self.assertEqual(response.status_code, 404)
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class TestGetRequiresAuthenticatedUser:

    def test_get_requires_authenticated_user(self):
        response = self.client.get(self.view_url)
        self.assertResponse403(response)
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
class TestAuthGetRequestSuccess:

    def test_auth_get_success(self):
        response = self.auth_client.get(self.view_url)
        self.assertResponse200(response)
#-------------------------------------------------------------------------------------------------
