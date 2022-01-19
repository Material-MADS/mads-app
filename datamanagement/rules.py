#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
# ________________________________________________________________________________________________
# Authors: Jun Fujima (Former Lead Developer) [2018-2021]
#          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
# ________________________________________________________________________________________________
# Description: Serverside (Django) Provided rules for the 'datamanagement' page
# ------------------------------------------------------------------------------------------------
# Notes: This is one part of the serverside module that allows the user to interact with the
#        'datamanagement' interface of the website. (DB and server Python methods)
# ------------------------------------------------------------------------------------------------
# References: rules libs
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
import rules
from rules import predicates

from common import rules as common_rules
from .models import DataSource

#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
rules.add_rule('can_list_datasources', predicates.always_allow)
rules.add_rule('can_edit_datasource', common_rules.is_resource_owner | predicates.is_superuser)
rules.add_rule('can_delete_datasource', common_rules.is_resource_owner | predicates.is_superuser)
rules.add_rule('can_read_datasource', common_rules.is_public | common_rules.is_resource_owner | predicates.is_superuser | (common_rules.is_internal & (common_rules.is_resource_shareduser | common_rules.is_resource_sharedgroupmember)))
rules.add_rule('datamanagement.list_datasources', predicates.always_allow)
rules.add_perm('datamanagement.change_datasource', common_rules.is_resource_owner | predicates.is_superuser)
rules.add_perm('datamanagement.delete_datasource', common_rules.is_resource_owner | predicates.is_superuser)
rules.add_perm('datamanagement.read_datasource', common_rules.is_public | common_rules.is_resource_owner | predicates.is_superuser | (common_rules.is_internal & (common_rules.is_resource_shareduser | common_rules.is_resource_sharedgroupmember)))
rules.add_perm('datamanagement.add_datasource', predicates.is_authenticated)
#-------------------------------------------------------------------------------------------------
