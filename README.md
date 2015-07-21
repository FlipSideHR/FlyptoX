[![Build Status](https://travis-ci.org/FlipSideHR/FlyptoX.svg?branch=master)](https://travis-ci.org/FlipSideHR/FlyptoX)

# FlyptoX

> FlyptoX is an open-source crypto currency exchange generator.
####**Currently under development and not ready for production use.
- A generator that allows you to configure, create, and deploy your own crypto-currency exchange.
- The exchange supports crypto->crypto, testnet->testnet, testnet->virtualUSD exchanges out of the box.
- Crypto->Fiat exchange requires extra setup for regulation compliance and chargeback protections. This is the responsibility of the exchange operator to implement.
- *Fiat currency withdrawals, deposits, wallets, and trading is supported - but you as exchange operator must enable these processes and the required compliance processes required in your region.*

TODO:
- Everything.

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

**NOT IMPLEMENTED**
> `npm install flyptox`

> `yo flyptox`

> Follow the prompts to custom generate your exchange package.

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

Linex users:

In pg_hba.conf, ensure you have entries for your user and database set to 'trust'.
In this example, we use flyptox for both user role and database name.

local	flyptox 	flyptox 					trust
host	flyptox 	flyptox 	127.0.0.1/32 	trust

##### Edit the knexfile.js
 - The knexfile has 4 configs: test, development, travis, and admin.
 - Test and development should always stay as they are.
 - Admin should be the postgres username and database you use on your dev machine (almost definitely your username)

##### run the db create/migrate/seed script
- `node server/utils/recreateDB -dev` to build out the dev db
- `node server/utils/recreateDB` to build out the test db (tests run against this)

### Now You are ready to develop!
- `gulp` builds the client, starts nodemon running the server, and launches browser-sync to auto inject any clientside changes. 
- `gulp serverTestRunner` runs a watcher on server files, and runs linting and tests when they change.

### Testing

#### Server side
- `gulp test:server` to run all server tests

#### Client side
- `gulp test:client` to run all client tests

### Roadmap

View the project roadmap [here](https://github.com/FlipSideHR/FlyptoX/issues)

## Contributing

PR's are welcome.
See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.
