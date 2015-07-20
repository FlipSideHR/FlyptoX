'use strict';

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('trades', function(table) {
      table.uuid('id').primary();
      table.integer('sequence');
      table.string('type').notNullable();
      table.float('price', 16, 8).notNullable();
      table.float('size', 16, 8).notNullable();
      table.timestamps();
      table.uuid('maker_id').notNullable().references('id').inTable('users');
      table.uuid('taker_id').notNullable().references('id').inTable('users');
      table.uuid('maker_order_id').notNullable().references('id').inTable('orders');
      table.uuid('taker_order_id').notNullable().references('id').inTable('orders');
      table.integer('currency_pair_id').notNullable().references('id').inTable('currency_pairs');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTableIfExists('trades')
  ]);
};
