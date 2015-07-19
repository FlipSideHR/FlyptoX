[![Build Status](https://travis-ci.org/FlipSideHR/FlyptoX.svg?branch=master)](https://travis-ci.org/FlipSideHR/FlyptoX)

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
- Bookshelfjs 0.7.7 
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

- Edit the knexfile.js
   - set admin: username and database to your postgres admin user
- run `node server/utils/recreateDB -dev`
- run `node server/utils/recreateDB`

### Testing

#### Server side
- `grunt test:server` to run all server tests
- `grunt test:models` to run only model tests
- `grunt test:controllers` to run only controller tests

#### Client side
- `gulp test`

### Roadmap

View the project roadmap [here](https://github.com/FlipSideHR/FlyptoX/issues)

## Contributing

PR's are welcome.
See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.
