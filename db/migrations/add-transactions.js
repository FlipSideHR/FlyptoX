'use strict';

exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('transactions', function(table) {
            table.uuid("transaction_id").primary();
            table.uuid("account_id").refrences("account_id").inTable("accounts");
            table.float("amount", 16, 8);
            table.float("balance", 16, 8);
            table.text("type");
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTableIfExists('transactions');
    ]);
};
