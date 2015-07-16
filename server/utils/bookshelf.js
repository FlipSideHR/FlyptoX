// export a configed bookshelf instance
var knexConfig = require('../../knexfile');
var knex = require('knex')(knexConfig.development);
module.exports = require('bookshelf')(knex);
