#!/bin/bash
set -e

python manage.py migrate
python manage.py collectstatic --noinput

gunicorn madsapp.wsgi -t 180 -b 0.0.0.0:8000 --limit-request-line 8188 --log-file -
# python manage.py runserver 0.0.0.0:8000
