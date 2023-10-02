#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
#          Last Update: Q3 2023
# ________________________________________________________________________________________________
# Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
#          Jun Fujima (Former Lead Developer) [2018-2021]
# ________________________________________________________________________________________________
# Description: Serverside (Django) Provided rules for the 'Prediction' page
# ------------------------------------------------------------------------------------------------
# Notes: This is one part of the serverside module that allows the user to interact with the
#        'prediction' interface of the website. (DB and server Python methods)
# ------------------------------------------------------------------------------------------------
# References: rules libs
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
import rules
from rules import predicates
from common import rules as common_rules

#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
rules.add_rule('can_list_model', predicates.always_allow)
rules.add_rule('can_edit_model', common_rules.is_resource_owner | predicates.is_superuser)
rules.add_rule('can_delete_model', common_rules.is_resource_owner | predicates.is_superuser)
rules.add_rule('can_read_model', common_rules.is_public | common_rules.is_resource_owner | predicates.is_superuser | (common_rules.is_internal & (common_rules.is_resource_shareduser | common_rules.is_resource_sharedgroupmember)))
rules.add_rule('prediction.list_models', predicates.always_allow)
rules.add_perm('prediction.change_model', common_rules.is_resource_owner | predicates.is_superuser)
rules.add_perm('prediction.delete_model', common_rules.is_resource_owner | predicates.is_superuser)
rules.add_perm('prediction.read_model', common_rules.is_public | common_rules.is_resource_owner | predicates.is_superuser | (common_rules.is_internal & (common_rules.is_resource_shareduser | common_rules.is_resource_sharedgroupmember)))
rules.add_perm('prediction.add_model', predicates.is_authenticated)
#-------------------------------------------------------------------------------------------------
