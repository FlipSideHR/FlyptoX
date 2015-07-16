// export a configed bookshelf instance
// takes a string representing the desired environment ('test' or 'development')
module.exports = function(environment){
  'use strict';
  var knexConfig = require('../../knexfile');
  var env = environment || 'development';
  var knex = require('knex')(knexConfig[env]);
  return require('bookshelf')(knex);
};
