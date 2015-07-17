# FlyptoX

> Pithy project description

## Team

  - __Product Owner__: Michael Symmes
  - __Scrum Master__: Dick Treichel
  - __Development Team Members__: Simon Burns, Amy Li, Mokhtar Naamani, Michael Symmes, Dick Treichel

## Table of Contents

1. [Usage](#Usage)
1. [Requirements](#requirements)
1. [Development](#development)
    1. [Installing Dependencies](#installing-dependencies)
    1. [Tasks](#tasks)
1. [Team](#team)
1. [Contributing](#contributing)

## Usage

> Some usage instructions

## Requirements

- Node 0.12.x
- Express 4.4.4 
- Angular 1.2.26
- Postgresql 9.1.x
- ~~Redis 2.6.x~~

## Development

### Installing Dependencies

From within the root directory:

```sh
sudo npm install -g bower
sudo npm install -g knex
npm install
bower install
```

### Database setup

Create a database using `createdb` tool

    createdb flyptox

Enter `psql` command shell. Create a role and grant access to the database

    create role flyptox with login;
    grant all privileges on database flyptox to flyptox;

exit psql

Run knex migrations

    knex migrate:latest

### Test Database Setup

1. make sure you have followed the steps from above 'Database Setup'
2. configure your knexfile.js admin object.
   - your admin object should have postgres credentials to an admin level account
   - most likely your system username and an empty password
4. run `node server/utils/recreateDB`
   - this will drop the test db and recreate it with the latest migration/seeds

### Testing

#### Server side
- `NODE_ENV=test grunt test:server` to run all server tests
- `NODE_ENV=test grunt test:models` to run only model tests
- `NODE_ENV=test grunt test:controllers` to run only controller tests

#### Client side


### Roadmap

View the project roadmap [here](https://github.com/FlipSideHR/FlyptoX/issues)

## Contributing

PR's are welcome.
See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.
