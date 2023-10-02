#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
#          Last Update: Q3 2023
# ________________________________________________________________________________________________
# Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
#          Jun Fujima (Former Lead Developer) [2018-2021]
# ________________________________________________________________________________________________
# Description: Serverside (Django) common folder contains all base-root reusable codes that are
#              shared and used by all various "apps" within this web site. This file contains
#              code to support various 'rules'.
# ------------------------------------------------------------------------------------------------
# Notes: This is 'common' code that support various apps and files with all reusable features
#        that is needed for the different pages Django provides
# ------------------------------------------------------------------------------------------------
# References: Django platform libraries and rules libs and this 'common'-folder's 'models'
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
import rules
from rules import predicates
from .models import OwnedResourceModel

#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
@rules.predicate
def is_resource_owner(user, resource):
    if hasattr(resource, 'owner'):
        return resource.owner == user
    else:
        return False


@rules.predicate
def is_resource_shareduser(user, resource):
    if user.is_anonymous:
        return False
    return resource.shared_users.filter(email=user.email).exists()


@rules.predicate
def is_resource_sharedgroupmember(user, resource):
    groups = list(user.groups.all())
    group_names = [g.name for g in groups]
    return resource.shared_groups.filter(name__in=group_names).exists()


@rules.predicate
def is_public(user, resource):
    return resource.accessibility == OwnedResourceModel.ACCESSIBILITY_PUBLIC


@rules.predicate
def is_private(user, resource):
    return resource.accessibility == OwnedResourceModel.ACCESSIBILITY_PRIVATE


@rules.predicate
def is_internal(user, resource):
    return resource.accessibility == OwnedResourceModel.ACCESSIBILITY_INTERNAL
#-------------------------------------------------------------------------------------------------
