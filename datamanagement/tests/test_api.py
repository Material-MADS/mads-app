#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
#          Last Update: Q3 2023
# ________________________________________________________________________________________________
# Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
#          Jun Fujima (Former Lead Developer) [2018-2021]
# ________________________________________________________________________________________________
# Description: Serverside (Django) datamanagement test of the api code
# ------------------------------------------------------------------------------------------------
# Notes: This is a code test for the 'api' of the serverside module that allows the user to
#        interact with the 'datamanagement' interface of the website.
# ------------------------------------------------------------------------------------------------
# References: Django platform libraries, rest framework libs and 'datamanagement'-folder's
#             'models' and 'api'
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
import json
from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model

from rest_framework.test import APIClient

from datamanagement.models import DataSource
from datamanagement.api.views import DataSourceCreateAPIView

#-------------------------------------------------------------------------------------------------

User = get_user_model()

#-------------------------------------------------------------------------------------------------
class DataSourceAPITests(TestCase):

    def setUp(self):
        print(User)

        user = User.objects.get_or_create(email='test@example.com', password='xxxyyyzzz', is_superuser=True, is_staff=True)
        # user.is_superuser=True
        # user.is_staff=True
        # user.save()
        DataSource.objects.get_or_create(name='A Name', owner=User.objects.get(email='test@example.com'))

    def test_list(self):
        url = reverse('datamanagement:datasource_rest_api')

        client = APIClient()
        user = User.objects.get(email='test@example.com')

        client.force_authenticate(user=user)
        # client.login(username='test@example.com', password='xxxyyyzzz')

        print(url)
        response = client.get(url)
        self.assertEquals(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEquals(len(data), 1)
#-------------------------------------------------------------------------------------------------
