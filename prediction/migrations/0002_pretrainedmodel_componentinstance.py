# -*- coding: utf-8 -*-
# Generated by Django 1.11.13 on 2018-05-25 04:29
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('analysis', '0003_componentinstance_componenttype'),
        ('prediction', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='pretrainedmodel',
            name='componentInstance',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='analysis.ComponentInstance'),
        ),
    ]
