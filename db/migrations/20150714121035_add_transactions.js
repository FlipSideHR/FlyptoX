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
            //user's order that resulted in this transaction
            table.uuid("order_id").references("id").inTable("orders");

            //we might need a transfer_id and a new transfers
            //table which stores a list deposits and withdrawls from and into
            //accounts (the migration file needs to preceed this one)
            //table.uuid("trander_id").refrences("id").inTable("transfers");

        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTableIfExists('transactions')
    ]);
};
