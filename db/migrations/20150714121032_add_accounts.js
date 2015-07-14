'use strict';

exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('accounts', function(table) {
            table.uuid("id").primary().notNullable();
            table.uuid("user_id").notNullable().references("id").inTable("users");
            table.integer("currency_id").notNullable().references("id").inTable("currencies");
            table.float("balance", 16, 8);
            table.float("available", 16, 8);
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTableIfExists('accounts')
    ]);
};
