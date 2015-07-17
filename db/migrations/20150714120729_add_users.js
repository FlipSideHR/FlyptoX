'use strict';


exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('users', function(table) {
      table.uuid("id").primary();
      table.string('email').unique();
      table.string('password').notNullable();
      table.string('salt');
      table.string('fullname');
      table.dateTime('created_at').notNullable().defaultTo(knex.raw('now()'));
      table.dateTime('updated_at').notNullable().defaultTo(knex.raw('now()'));
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTableIfExists('users')
  ]);
};
