'use strict';

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('orders', function(table) {
      table.uuid('id').primary();
      table.integer('sequence');
      table.integer('currency_pair_id').notNullable().references('id').inTable('currency_pairs');
      table.string('type').notNullable();
      table.string('side').notNullable();
      table.float('price', 16, 8).notNullable();
      table.float('size', 16, 8).notNullable();
      table.float('filled_size',16, 8).notNullable().defaultTo(0);
      table.timestamps();
      table.dateTime('done_at');
      table.string('done_reason');
      table.string('status').notNullable().defaultTo('open');
      table.uuid('user_id').notNullable().references('id').inTable('users');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTableIfExists('orders')
  ]);
};
