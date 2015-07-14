'use strict';

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('trades', function(table) {
      table.uuid('id').primary();
      table.integer('sequence');
      table.string('type').notNullable();
      table.float('price', 16, 8).notNullable();
      table.float('amount', 16, 8).notNullable();
      table.dateTime('time').notNullable().defaultTo(knex.raw('now()'));
      table.uuid('maker_id').notNullable().references('id').inTable('users');
      table.uuid('taker_id').notNullable().references('id').inTable('users');
      table.uuid('maker_order_id').notNullable().references('id').inTable('orders');
      table.uuid('taker_order_id').notNullable().references('id').inTable('orders');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTableIfExists('trades')
  ]);
};
