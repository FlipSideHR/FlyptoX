// export a configed bookshelf instance

'use strict';

var knexConfig = require('../../knexfile');
var env = process.env.NODE_ENV || 'development';
var knex = require('knex')(knexConfig[env]);

var bookshelf = require('bookshelf')(knex);
bookshelf.plugin('registry');

module.exports = bookshelf;
