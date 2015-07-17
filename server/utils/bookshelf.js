// export a configed bookshelf instance

'use strict';

var knexConfig = require('../../knexfile');
var env = process.env.NODE_ENV || 'development';
var knex = require('knex')(knexConfig[env]);
module.exports = require('bookshelf')(knex);
