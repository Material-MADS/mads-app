from rest_framework import serializers

from ..models import DataSource


class DataSourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataSource
        fields = ['id', 'name', 'owner', 'description', 'file', 'accessibility', 'shared_users', 'shared_groups']