module.exports = {

  development: {
    client: 'pg',
    connection: {
      host: 'localhost',
      database: 'flyptox',
      user:     'flyptox'
    },
    seeds: {
      directory: './db/seeds'
    },
    migrations: {
      directory: './db/migrations'
    }
  },
  test: {
    client: 'pg',
    connection: {
      host: 'localhost',
      database: 'flyptox_test',
      user:     'flyptox_test'
    },
    seeds: {
      directory: './db/seeds'
    },
    migrations: {
      directory: './db/migrations'
    }
  },
  admin: {
    client: 'pg',
    connection: {
      host: 'localhost',
      database: 'recursion',
      user:     'recursion'
    },
  }
};
