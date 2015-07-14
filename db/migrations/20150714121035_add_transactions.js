'use strict';

exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('transactions', function(table) {
            table.uuid("id").primary();
            table.uuid("account_id").references("id").inTable("accounts");
            table.float("amount", 16, 8);
            table.float("balance", 16, 8);
            table.string("type");
            table.uuid("trade_id").references("id").inTable("trades");
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTableIfExists('transactions')
    ]);
};
