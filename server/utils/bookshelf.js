// export a configed bookshelf instance

// takes a string representing the desired environment ('test' or 'development')
var Bookshelf;
module.exports = function(environment){
  'use strict';
  
  // if we already instantiated, just return the existing instance
  if(Bookshelf) return Bookshelf;

  var knexConfig = require('../../knexfile');
  var env = environment || 'development';
  var knex = require('knex')(knexConfig[env]);
  Bookshelf = require('bookshelf')(knex);

  return Bookshelf;
};
