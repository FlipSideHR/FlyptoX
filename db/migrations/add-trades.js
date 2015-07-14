'use strict';

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('trades', function(table) {
      table.increments('trade_id');
      table.string('type').notNullable();
      table.float('price').notNullable();
      table.float('amount').notNullable();
      table.dateTime('time').notNullable();
      table.integer('sequence').notNullable(); // TODO: defaultTo auto-increment somehow
      table.uuid('maker_id').notNullable().references('maker_id').inTable('users');
      table.uuid('taker_id').notNullable().references('taker_id').inTable('users');
      table.uuid('maker_order_id').notNullable().references('maker_order_id').inTable('orders');
      table.uuid('taker_order_id').notNullable().references('taker_order_id').inTable('orders');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTableIfExists('trades')
  ]);
};
