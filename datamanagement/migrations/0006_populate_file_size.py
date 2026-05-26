# Generated migration to backfill file_size field

from django.db import migrations


def populate_file_size(apps, schema_editor):
    """Populate file_size for all existing DataSource records"""
    DataSource = apps.get_model('datamanagement', 'DataSource')
    
    for datasource in DataSource.objects.filter(file_size__isnull=True):
        if datasource.file:
            try:
                datasource.file_size = datasource.file.size
                datasource.save(update_fields=['file_size'])
            except Exception:
                pass


def reverse_populate(apps, schema_editor):
    """Reverse: clear file_size values"""
    DataSource = apps.get_model('datamanagement', 'DataSource')
    DataSource.objects.all().update(file_size=None)


class Migration(migrations.Migration):

    dependencies = [
        ('datamanagement', '0005_datasource_file_size'),
    ]

    operations = [
        migrations.RunPython(populate_file_size, reverse_populate),
    ]
