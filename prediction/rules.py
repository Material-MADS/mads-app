# rules.py
import rules
# from rules import Predicate
from rules import predicates

from common import rules as common_rules


rules.add_rule('can_list_model', predicates.always_allow)

rules.add_rule('can_edit_model',
               common_rules.is_resource_owner | predicates.is_superuser)
rules.add_rule('can_delete_model',
               common_rules.is_resource_owner | predicates.is_superuser)
rules.add_rule('can_read_model',
               common_rules.is_public | common_rules.is_resource_owner | predicates.is_superuser
               | (common_rules.is_internal & (common_rules.is_resource_shareduser |
                                              common_rules.is_resource_sharedgroupmember)))


rules.add_rule('prediction.list_models', predicates.always_allow)

rules.add_perm('prediction.change_model',
               common_rules.is_resource_owner | predicates.is_superuser)
rules.add_perm('prediction.delete_model',
               common_rules.is_resource_owner | predicates.is_superuser)
rules.add_perm('prediction.read_model',
               common_rules.is_public | common_rules.is_resource_owner | predicates.is_superuser
               | (common_rules.is_internal & (common_rules.is_resource_shareduser |
                                              common_rules.is_resource_sharedgroupmember)))

rules.add_perm('prediction.add_model', predicates.is_authenticated)
