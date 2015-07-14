'use strict';

exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('users', function(table) {
            table.uuid("user_id").primary().notNullable();
            table.text('name');
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
