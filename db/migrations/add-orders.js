'use strict';

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('orders', function(table) {
      table.uuid('order_id').primary();
      table.integer('currency_pair_id').notNullable().references('currency_pair_id').inTable('currency_pairs');
      table.string('order_type').notNullable();
      table.string('side').notNullable();
      table.float('price').notNullable();
      table.float('original_size').notNullable();
      table.float('remaining_size').notNullable();
      table.timestamps().defaultTo(knex.raw('now()')); // adds 'created_at' and 'updated_at' columns
      table.string('status');
      table.uuid('user_id').notNullable().references('user_id').inTable('users');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTableIfExists('orders')
  ]);
};
