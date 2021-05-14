FROM python:3.9

ENV PYTHONUNBUFFERED 1

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y apt-transport-https

RUN sh -c 'curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -' \
  && sh -c 'echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list' \
  && sh -c 'curl -sL https://deb.nodesource.com/setup_14.x | bash -'
# sudo apt-get install -y nodejs

RUN apt-get update && apt-get install -y \
  postgresql-client \
  yarn \
  # s3cmd=1.1.* \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

RUN pip install pip --upgrade \
  && pip install pipenv

COPY ./Pipfile /usr/src/app/
COPY ./Pipfile.lock /usr/src/app/
RUN pipenv install --deploy --system \
  && rm -rf ~/.cache/pipenv

COPY ./package.json /usr/src/app/
COPY ./yarn.lock /usr/src/app/
RUN yarn install --ignore-engines --frozen-lockfile

COPY . /usr/src/app/

RUN yarn run build

# CMD sh bin/start-app.sh
EXPOSE 8000

# CMD gunicorn madsapp.wsgi --limit-request-line 8188 --log-file -
