#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
#          Last Update: Q3 2023
# ________________________________________________________________________________________________
# Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
#          Jun Fujima (Former Lead Developer) [2018-2021]
# ________________________________________________________________________________________________
# Description: Serverside (Django) datamanagement test of the rules code
# ------------------------------------------------------------------------------------------------
# Notes: This is a code test for the 'rules' of the serverside module that allows the user to
#        interact with the 'datamanagement' interface of the website.
# ------------------------------------------------------------------------------------------------
# References: Django platform libraries, rules libs and 'datamanagement'-folder's
#             'models' and 'rules'
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group

import rules

import datamanagement.rules as my_rules
from datamanagement.models import DataSource

#-------------------------------------------------------------------------------------------------

User = get_user_model()

#-------------------------------------------------------------------------------------------------
class DataSourceRulesTests(TestCase):

    def setUp(self):

        User.objects.get_or_create(
            email='admin1@example.com', password='xxxyyyzzz',
            is_superuser=True, is_staff=True
        )
        User.objects.get_or_create(
            email='admin2@example.com', password='xxxyyyzzz',
            is_superuser=True, is_staff=True
        )
        User.objects.get_or_create(
            email='test1@example.com', password='abcdefg'
        )
        User.objects.get_or_create(
            email='test2@example.com', password='hijklmnop'
        )
        su1, c = User.objects.get_or_create(
            email='test3@example.com', password='hijklmnop'
        )
        gu1, c = User.objects.get_or_create(
            email='test4@example.com', password='hijklmnop'
        )

        DataSource.objects.get_or_create(
            name='PrivateD1',
            owner=User.objects.get(email='test1@example.com')
        )
        DataSource.objects.get_or_create(
            name='PrivateD2',
            owner=User.objects.get(email='test1@example.com')
        )
        DataSource.objects.get_or_create(
            name='PublicD1',
            accessibility=DataSource.ACCESSIBILITY_PUBLIC,
            owner=User.objects.get(email='test1@example.com')
        )
        internal_d, c = DataSource.objects.get_or_create(
            name='InternalD1',
            accessibility=DataSource.ACCESSIBILITY_INTERNAL,
            owner=User.objects.get(email='test1@example.com'),
        )
        internal_d.shared_users.add(su1)
        g1, c = Group.objects.get_or_create(name='g1')
        gu1.groups.add(g1)
        internal_d.shared_groups.add(g1)

    ####################
    def test_rule_can_delete_datasource(self):
        d = DataSource.objects.get(name='PrivateD1')
        u = User.objects.get(email='test1@example.com')
        result = rules.test_rule('can_delete_datasource', u, d)
        self.assertTrue(result)

    def test_rule_can_delete_datasource_with_admin(self):
        d = DataSource.objects.get(name='PrivateD1')
        u = User.objects.get(email='admin1@example.com')
        result = rules.test_rule('can_delete_datasource', u, d)
        self.assertTrue(result)

    def test_rule_can_delete_datasource_failure(self):
        d = DataSource.objects.get(name='PrivateD1')
        u = User.objects.get(email='test2@example.com')
        result = rules.test_rule('can_delete_datasource', u, d)
        self.assertFalse(result)

    ############################
    def test_rule_can_edit_datasource(self):
        d = DataSource.objects.get(name='PrivateD1')
        u = User.objects.get(email='test1@example.com')
        result = rules.test_rule('can_edit_datasource', u, d)
        self.assertTrue(result)

    def test_rule_can_edit_datasource_with_admin(self):
        d = DataSource.objects.get(name='PrivateD1')
        u = User.objects.get(email='admin1@example.com')
        result = rules.test_rule('can_edit_datasource', u, d)
        self.assertTrue(result)

    def test_rule_can_edit_datasource_failure(self):
        d = DataSource.objects.get(name='PrivateD1')
        u = User.objects.get(email='test2@example.com')
        result = rules.test_rule('can_edit_datasource', u, d)
        self.assertFalse(result)

    ####################################
    # test for can_read_datasource

    # 'private' data source is readable from owner or admin
    def test_rule_can_read_datasource_private(self):
        d = DataSource.objects.get(name='PrivateD1')
        owner = User.objects.get(email='test1@example.com')
        other = User.objects.get(email='test2@example.com')
        admin = User.objects.get(email='admin1@example.com')
        self.assertTrue(rules.test_rule('can_read_datasource', owner, d))
        self.assertFalse(rules.test_rule('can_read_datasource', other, d))
        self.assertTrue(rules.test_rule('can_read_datasource', admin, d))

    # 'public' data source is readable from anyone
    def test_rule_can_read_datasource_pubic(self):
        d = DataSource.objects.get(name='PublicD1')
        owner = User.objects.get(email='test1@example.com')
        other = User.objects.get(email='test2@example.com')
        admin = User.objects.get(email='admin1@example.com')
        self.assertTrue(rules.test_rule('can_read_datasource', owner, d))
        self.assertTrue(rules.test_rule('can_read_datasource', other, d))
        self.assertTrue(rules.test_rule('can_read_datasource', admin, d))

    # 'internal' data source is readable from:
    #    1) owner
    #    2) admin
    #    3) other is a member of shared users
    #    4) other is a member of shared groups
    def test_rule_can_read_datasource_internal(self):
        d = DataSource.objects.get(name='InternalD1')
        owner = User.objects.get(email='test1@example.com')
        other = User.objects.get(email='test2@example.com')
        admin = User.objects.get(email='admin1@example.com')
        suser = User.objects.get(email='test3@example.com')
        guser = User.objects.get(email='test4@example.com')

        self.assertTrue(rules.test_rule('can_read_datasource', owner, d))
        self.assertTrue(rules.test_rule('can_read_datasource', admin, d))
        self.assertFalse(rules.test_rule('can_read_datasource', other, d))
        self.assertTrue(rules.test_rule('can_read_datasource', suser, d))
        self.assertTrue(rules.test_rule('can_read_datasource', guser, d))
#-------------------------------------------------------------------------------------------------
