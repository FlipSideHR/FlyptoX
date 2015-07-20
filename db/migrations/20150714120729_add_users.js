'use strict';


exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('users', function(table) {
      table.uuid("id").primary();
      table.string('email').unique();
      table.string('password').notNullable();
      table.string('salt');
      table.string('fullname');
      table.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTableIfExists('users')
  ]);
};
