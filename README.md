[//]: # (==============================================================================================================)
[//]: # (This is the Main ReadMe file for the CADS/MADS project)
[//]: # (Description: How to set up the project server from Git, how to manage it as well as credits to the developers)
[//]: # (==============================================================================================================)

[![License: MIT](https://img.shields.io/github/license/vintasoftware/django-react-boilerplate.svg)](LICENSE.txt)

# MADS/CADS Application (madsapp)

MADS/CADS is an integrated web-based visual platform for Materials/Catalysts Informatics.
The platform helps material scientists design new materials with:

- Sharing of material data and analysis tools,
- Support for trial-and-error process of data analysis with user-friendly interactive visual interfaces.

## Running

### Requirements

- node.js
  - yarn
- Python
  - pipenv, django

### Setup

- On project root, do the following:
- Create a copy of the following setting files from templates:
  - `.env.example` -> `.env`
  - `madsapp/settings/local.py.example` -> `madsapp/settings/local.py`

### Running the project

- Open a command line window and go to the project's directory.
- `pipenv install --dev`
- `yarn --dev --frozen-lockfile`
- `yarn run start`
- Open another command line window and go to the project's directory.
- `pipenv shell`
- Create the migrations for `users` app with:
  `python manage.py makemigrations`
- Run the migrations:
  `python manage.py migrate`
- Run the server app:
- `python manage.py runserver`

### docker-compose

A docker-compose setting example is included. You can make a copy of `docker-compose.yml.example` and `nginx/nginx.conf.example`, then edit them to fit your requirements.

## Documentations

Visit https://cads.eng.hokudai.ac.jp/docs-static/ .

## Contributing

Please see some guide line like https://opensource.guide/how-to-contribute/ .

You may follow blow procedure:

1. Fork the repository
2. Create a branch
3. Commit changes
4. Push the branch
5. Send a pull request

## Publications

Jun Fujima, Yuzuru Tanaka, Itsuki Miyazato, Lauren Takahashi, Keisuke Takahashi
‘Catalyst Acquisition by Data Science (CADS): a web-based catalyst informatics platform for discovering catalysts’
React. Chem. Eng. (2020) 5 (5), 903-911.
https://doi.org/10.1039/D0RE00098A

## License

[MIT License](LICENSE.txt)

Copyright (c) 2018 MADS/CADS development team
