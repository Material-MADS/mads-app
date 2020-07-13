import logging
from rest_framework import permissions
import rules


logger = logging.getLogger(__name__)


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed following rule 'can_read_datasource',

        if request.method in permissions.SAFE_METHODS:
            return rules.test_rule('can_read_model', request.user, obj)


        # Write permissions are only allowed to the owner of the snippet.
        return obj.owner == request.user
