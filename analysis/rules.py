# rules.py
import rules
# from rules import Predicate
from rules import predicates

from common import rules as common_rules


rules.add_rule('can_list_workspace', predicates.always_allow)

rules.add_rule('can_edit_workspace',
               common_rules.is_resource_owner | predicates.is_superuser)
rules.add_rule('can_delete_workspace',
               common_rules.is_resource_owner | predicates.is_superuser)
rules.add_rule('can_read_workspace',
               common_rules.is_public | common_rules.is_resource_owner | predicates.is_superuser
               | (common_rules.is_internal & (common_rules.is_resource_shareduser |
                                 common_rules.is_resource_sharedgroupmember)))

rules.add_rule('analysis.list_workspace', predicates.always_allow)

rules.add_perm('analysis.change_workspace',
               common_rules.is_resource_owner | predicates.is_superuser)
rules.add_perm('analysis.delete_workspace',
               common_rules.is_resource_owner | predicates.is_superuser)
rules.add_perm('analysis.read_workspace',
               common_rules.is_public | common_rules.is_resource_owner | predicates.is_superuser
               | (common_rules.is_internal & (common_rules.is_resource_shareduser |
                                 common_rules.is_resource_sharedgroupmember)))

rules.add_perm('analysis.add_workspace', predicates.is_authenticated)
