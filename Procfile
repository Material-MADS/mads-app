web: gunicorn madsapp.wsgi --limit-request-line 8188 --log-file -
worker: celery worker --app=madsapp --loglevel=info
