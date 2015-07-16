// export a configed bookshelf instance
var knexConfig = require('../../../knexfile');
var knex = require('knex')(knexConfig.test);
module.exports = require('bookshelf')(knex);
