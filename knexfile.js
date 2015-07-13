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
  }

};
