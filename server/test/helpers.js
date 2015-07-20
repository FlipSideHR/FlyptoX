"use strict";

var bookshelf = require('../utils/bookshelf.js');
var User = require('../models/User');
var Order = require('../models/Order');
var Trade = require('../models/Trade');

var utils = module.exports;

// an array of users for testing
var users = [
  {
    password: 'plutox',
    email: 'msymmes@gmail.com',
    fullname: 'Mike Symmes'
  },
  {
    password: 'blahblahb',
    email: 'marky@mark.com',
    fullname: 'Marky Mark'
  },
  {
    password: 'laskdjlaskjdf',
    email: 'cash@johnny.com',
    fullname: 'Johnny Cash'
  }
];

// this data should be randomly generated
var trade = {
  sequence: 1,
  type: 'test',
  price: 200.00,
  size: 0.04,
  currency_pair_id: 1
};

// clean the db in the proper order
utils.clean = function(done){
  utils.trade.deleteRows()
    .then(function(){
      return utils.order.deleteRows();
    })
    .then(function(){
      return utils.user.deleteRows();
    })
    .then(function(){
      done();
    });
};

utils.trade = {
  create: function(uids, oids){
    trade.maker_id = uids[0];
    trade.taker_id = uids[1];
    trade.maker_order_id = oids[0];
    trade.taker_order_id = oids[1];
    return Trade.forge(trade).save({}, {method: 'insert'});
  },
  deleteRows: function() {
    return bookshelf.knex.raw('DELETE FROM trades');
  }
};

utils.order = {
  createCustom: function(params){
    return Order.forge(params).save({}, {method: 'insert'});
  },
  createOrder: function(uid){

    var myOrder = {
      sequence: 1,
      currency_pair_id: 1,
      type: 'limit',
      side: 'buy',
      price: 300.01,
      size: 5,
      filled_size: 5,
      status: 'done',
      done_reason:'filled',
      user_id: uid
    };

    // create the order and save it.
    return Order.forge(myOrder).save({}, {method: 'insert'});
  },
  deleteRows: function() {
    return bookshelf.knex.raw('DELETE FROM orders');
  }
};

utils.user = {
  // create a unique user
  createUUser: function(){

    // create a new user object
    return User.forge(users[0]).save({}, {method: 'insert'});

  },
  // create a new user from our test data array
  // only 2 users currently
  usersCreated: 0,
  createUser: function(){

    // create a new user object
    return User.forge(users[this.usersCreated++]).save({}, {method: 'insert'});

  },
  // creates an order using custom parameters
  createCustom: function(params){
    return new User(params).save({}, {method: 'insert'});
  },

  // delete all users rows
  deleteRows: function() {
    return bookshelf.knex.raw('DELETE FROM users');
  }
};
