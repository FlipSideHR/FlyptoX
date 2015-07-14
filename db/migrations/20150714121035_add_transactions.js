'use strict';

exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('transactions', function(table) {
            table.uuid("transaction_id").primary();
            table.uuid("account_id").references("account_id").inTable("accounts");
            table.float("amount", 16, 8);
            table.float("balance", 16, 8);
            table.string("type");
            table.uuid("trade_id").references("trade_id").inTable("trades");
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTableIfExists('transactions')
    ]);
};
