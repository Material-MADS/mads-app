#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
#          Last Update: Q3 2023
# ________________________________________________________________________________________________
# Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
#          Jun Fujima (Former Lead Developer) [2018-2021]
# ________________________________________________________________________________________________
# Description: Serverside (Django) Provided rules for the 'analysis' page
# ------------------------------------------------------------------------------------------------
# Notes: This is one part of the serverside module that allows the user to interact with the
#        'analysis' interface of the website. (DB and server Python methods)
# ------------------------------------------------------------------------------------------------
# References: rules libs and 'common'-folder's 'rules'
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
import rules
from rules import predicates

from common import rules as common_rules

#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
rules.add_rule('can_list_workspace', predicates.always_allow)
rules.add_rule('can_edit_workspace', common_rules.is_resource_owner | predicates.is_superuser)
rules.add_rule('can_delete_workspace', common_rules.is_resource_owner | predicates.is_superuser)
rules.add_rule('can_read_workspace', common_rules.is_public | common_rules.is_resource_owner | predicates.is_superuser | (common_rules.is_internal & (common_rules.is_resource_shareduser | common_rules.is_resource_sharedgroupmember)))
rules.add_rule('analysis.list_workspace', predicates.always_allow)
rules.add_perm('analysis.change_workspace', common_rules.is_resource_owner | predicates.is_superuser)
rules.add_perm('analysis.delete_workspace', common_rules.is_resource_owner | predicates.is_superuser)
rules.add_perm('analysis.read_workspace', common_rules.is_public | common_rules.is_resource_owner | predicates.is_superuser | (common_rules.is_internal & (common_rules.is_resource_shareduser | common_rules.is_resource_sharedgroupmember)))
rules.add_perm('analysis.add_workspace', predicates.is_authenticated)
#-------------------------------------------------------------------------------------------------
