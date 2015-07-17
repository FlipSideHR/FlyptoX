'use strict';

exports.seed = function(knex, Promise) {
    return Promise.all([
        knex('currency_pairs').del(),
        knex('currency_pairs').insert({id: 1, currency_pair: 'BTC-USD'}),
    ]);
};
