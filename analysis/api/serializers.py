from rest_framework import serializers

from ..models import Workspace
from ..models import VisComponent
from ..models import ComponentInstance

import logging
logger = logging.getLogger(__name__)


class JSONSerializerField(serializers.Field):
    """Serializer for JSONField"""

    def to_internal_value(self, data):
        return data

    def to_representation(self, value):
        return value


class WorkspaceSimpleSerializer(serializers.ModelSerializer):

    class Meta:
        model = Workspace
        fields = [
            'id', 'name', 'owner', 'description', 'accessibility',
            'shared_users', 'shared_groups',
        ]

class WorkspaceSerializer(serializers.ModelSerializer):

    contents = JSONSerializerField()
    is_owned = serializers.SerializerMethodField()

    def get_is_owned(self, obj):
        request = self.context.get('request', None)

        if request is not None:
            user = request.user
            return user == obj.owner

        return "error"

    # def update(self, instance, validated_data):
    #     logger.info('!!!!!')
    #     instance.shared_users.set(validated_data.get('shared_users', instance.shared_users))

    #     instance.save()
    #     return instance

    class Meta:
        model = Workspace
        fields = [
            'id', 'name', 'owner', 'description', 'accessibility',
            'shared_users', 'shared_groups', 'contents',
            'is_owned',
        ]


class VisComponentSerializer(serializers.ModelSerializer):
    class Meta:
        model = VisComponent
        fields = [
            'id', 'name', 'owner', 'description', 'accessibility',
            'shared_users', 'shared_groups', 'contents'
        ]


class ComponentInstanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComponentInstance
        fields = [
            'id', 'name', 'owner', 'description', 'accessibility',
            'shared_users', 'shared_groups', 'contents'
        ]
