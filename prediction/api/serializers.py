from rest_framework import serializers

from ..models import PretrainedModel
# from ..models import VisComponent
# from ..models import ComponentInstance

import logging
logger = logging.getLogger(__name__)


class JSONSerializerField(serializers.Field):
    """Serializer for JSONField"""

    def to_internal_value(self, data):
        return data

    def to_representation(self, value):
        return value


class PretrainedModelSimpleSerializer(serializers.ModelSerializer):

    class Meta:
        model = PretrainedModel
        fields = [
            'id', 'name', 'owner', 'description', 'accessibility',
            'shared_users', 'shared_groups',
        ]

class PretrainedModelSerializer(serializers.ModelSerializer):
    """Serializer for PretrainedModel"""

    metadata = JSONSerializerField()

    # def create(self, validated_data):
    #     return Workspace(**validated_data)

    # def update(self, instance, validated_data):
    #     logger.info('!!!!!')
    #     instance.shared_users.set(validated_data.get('shared_users', instance.shared_users))

    #     instance.save()
    #     return instance

    class Meta:
        model = PretrainedModel
        fields = [
            'id', 'name', 'owner', 'description', 'accessibility',
            'shared_users', 'shared_groups', 'metadata',
        ]
