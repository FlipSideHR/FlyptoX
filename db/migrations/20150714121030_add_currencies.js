'use strict';

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('currencies', function(table) {
      table.increments("id").primary();
      table.string("currency").notNullable();
    })
  ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTableIfExists('currencies')
    ]);
};
