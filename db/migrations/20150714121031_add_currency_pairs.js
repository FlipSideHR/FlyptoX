'use strict';

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('currency_pairs', function(table) {
      table.increments('id');
      table.string('currency_pair').notNullable();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTableIfExists('currency_pairs')
  ]);
};
