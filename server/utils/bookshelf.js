// export a configed bookshelf instance
var knexConfig = require('../../knexfile');
var knex = require('knex')(knexConfig.development);
var bookshelf = module.exports = require('bookshelf')(knex);
