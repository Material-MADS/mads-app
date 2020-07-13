# rules.py
import rules
# from rules import Predicate
from rules import predicates

from .models import OwnedResourceModel


@rules.predicate
def is_resource_owner(user, resource):
    return resource.owner == user


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
