'use strict';

exports.seed = function(knex, Promise) {
    return Promise.all([
        knex('currency_pairs').del(),
        knex('currency_pairs').insert({
          id: 1,
          currency_pair: 'BTC-USD',
          base_currency_id: 2,  //BTC
          quote_currency_id: 1, //USD
          base_min_size: 0.001,
          base_max_size: 10000,
          quote_increment: 0.01
        }),
    ]);
};
