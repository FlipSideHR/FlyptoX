'use strict';

exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('accounts', function(table) {
            table.uuid("id").primary();
            table.uuid("user_id").notNullable().references("id").inTable("users");
            table.integer("currency_id").notNullable().references("id").inTable("currencies");
            table.timestamps();
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTableIfExists('accounts')
    ]);
};
