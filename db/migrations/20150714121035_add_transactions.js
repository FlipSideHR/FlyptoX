'use strict';

exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('transactions', function(table) {
            table.uuid("id").primary();
            table.uuid("account_id").references("id").inTable("accounts");
            table.float("credit", 16, 8).defaultTo(0);
            table.float("debit", 16, 8).defaultTo(0);
            table.string("type");
            table.uuid("trade_id").references("id").inTable("trades");
            //user's order that resulted in this transaction
            table.uuid("order_id").references("id").inTable("orders");
            table.string("ref");//general reference information related to transaction
            table.timestamps();

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


/*
https://in.answers.yahoo.com/question/index?qid=20061107052207AA05Oxf
https://en.wikipedia.org/wiki/Debits_and_credits
*/
