'use strict';

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('currency_pairs', function(table) {
      table.increments('id');
      table.string('currency_pair').notNullable();
      table.integer('base_currency_id').references('id').inTable('currencies');
      table.integer('quote_currency_id').references('id').inTable('currencies');
      table.float("base_min_size", 16,8);
      table.float("base_max_size", 16,8);
      table.float("quote_increment", 16,8);
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTableIfExists('currency_pairs')
  ]);
};
