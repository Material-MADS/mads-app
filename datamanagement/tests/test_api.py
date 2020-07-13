import json

from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model

from rest_framework.test import APIClient

from datamanagement.models import DataSource

from datamanagement.api.views import DataSourceCreateAPIView

User = get_user_model()

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


    # def test_detail(self):
    #     response = self.client.get(self.read_update_delete_url)
    #     data = json.loads(response.content)
    #     content = {'id': 1, 'title': 'title1', 'slug': 'slug1',
    #     'scoops_remaining': 0}
    #     self.assertEquals(data, content)
