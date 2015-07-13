'use strict';

exports.seed = function(knex, Promise) {
    return Promise.all([
        knex('users').del(),
        knex('users').insert({name: 'john'}),
        knex('users').insert({name: 'jim'}),
        knex('users').insert({name: 'jane'})
    ]);
};