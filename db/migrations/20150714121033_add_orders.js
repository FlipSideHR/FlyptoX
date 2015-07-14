'use strict';

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('orders', function(table) {
      table.uuid('id').primary();
      table.integer('sequence');
      table.integer('currency_pair_id').notNullable().references('id').inTable('currency_pairs');
      table.string('order_type').notNullable();
      table.string('side').notNullable();
      table.float('price', 16, 8).notNullable();
      table.float('original_size', 16, 8).notNullable();
      table.float('remaining_size',16, 8).notNullable();
      table.dateTime('created_at').notNullable().defaultTo(knex.raw('now()'));
      table.dateTime('updated_at').notNullable().defaultTo(knex.raw('now()'));
      table.string('status');
      table.uuid('user_id').notNullable().references('id').inTable('users');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTableIfExists('orders')
  ]);
};
