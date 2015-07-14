'use strict';

exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('accounts', function(table) {
            table.uuid("account_id").primary().notNullable();
            table.uuid("user_id").notNullable().refrences("user_id").inTable("users");
            table.integer("currency_id").notNullable().refrences("currency_id").inTable("curruencies");
            table.float("balance", 8, 8);
            table.float("available", 8, 8);
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTableIfExists('accounts')
    ]);
};
