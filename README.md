[![Build Status](https://travis-ci.org/FlipSideHR/FlyptoX.svg?branch=master)](https://travis-ci.org/FlipSideHR/FlyptoX)

# FlyptoX

> FlyptoX is an open-source Node.js cryptocurrency exchange.

####**Currently in alpha development. Thorough testing is suggested. Pull requests are welcome.

- Our quick and easy setup tools allow you to configure, create, and deploy your own cryptocurrency exchange.
- The exchange supports crypto->crypto, testnet->testnet, testnet->virtualUSD exchanges out of the box.
- Crypto->Fiat exchange requires extra setup for regulation compliance and chargeback protections. This is the responsibility of the exchange operator to implement.
- *Fiat currency withdrawals, deposits, wallets, and trading is supported - but you as exchange operator must enable these processes and the required compliance processes required in your region.*

TODO:
- Wallet integrations.
- More tests.
- Admin tools.

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

> `git clone https://github.com/FlipSideHR/FlyptoX.git`

> `cd FlyptoX`

> `./flyptox setup`

#### Administration
Rudimentary CLI for administration.

> `./flyptox`

> `flyptox$: help`

## Requirements

- Node 0.12.x
- Express 4.4.4
- Angular 1.2.26
- Postgresql 9.1.x
- Socket.io  1.3.6
- Bookshelfjs 0.7.7

## Development

### Setup

From within the projects root directory:

```
./flyptox setup
```

### Database setup

1. [Install Postgres.](https://wiki.postgresql.org/wiki/Detailed_installation_guides)


    The flyptox database setup is set to use your username as its admin user/database. From here it will create the other databases it needs. If for some reason your database was not configured like this, you will have to set up a database and user with your username that has admin privileges (this is dev, not production).

    Linux users:

    You may have exta security measures to deal with as most distros tend to lock things down a bit more by default.

    The quick and dirty solution looks like this:

    In pg_hba.conf, ensure you have entries for your user and database set to 'trust'.
    In this example, we use flyptox for both user role and database name.

    ```
    local	flyptox 	flyptox 					trust
    host	flyptox 	flyptox 	127.0.0.1/32 	trust
    ```

**As always, you should follow your own security best practices.**

### Now you are ready to develop!

- `gulp` builds the client, starts nodemon running the server, and launches browser-sync to auto inject any clientside changes.

### Testing

#### Server side
- `gulp serverTestRunner` runs a watcher on server files, and runs linting and tests when they change.
- `gulp test:server` to run all server tests

#### Client side
- `gulp` builds the client, starts nodemon running the server, and launches browser-sync to auto inject any clientside changes.
- `gulp test:client` to run all client tests

- Gulp uses nyan cat for server test by default.
- You can use the switch `--spec` to get full test reports
    - `gulp --spec`
    - `gulp serverTestRunner --spec`
    - `gulp server:test --spec`

#### DB Tools
In utils/dbTools.js there are several utilities for working with the DB.

Run `./utils/dbTools` to overwrite the test db.

Run `./utils/dbTools --dev` to overwrite the dev db.

Run `./utils/dbTools --all` to overwrite the dev and test db's.

### Roadmap

View the project roadmap [here](https://github.com/FlipSideHR/FlyptoX/issues)

## Contributing

Pull requests are welcome. Especially for tests.
See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.
