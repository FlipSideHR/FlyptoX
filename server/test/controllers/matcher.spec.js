var chai = require('chai');
var expect = chai.expect;
var users = require('../../controllers/users');

var matcher = require('../../marketEngine/matcher');

var bookshelf = require("../../utils/bookshelf");

var Order = bookshelf.model('Order');
var Trade = bookshelf.model('Trade');
var Promise = require('bluebird');

function clearTables(done){
  bookshelf.knex('transactions').del()
  .then(function(){
      return bookshelf.knex('trades').del();
  })
  .then(function(){
      return bookshelf.knex('orders').del();
  })
  .then(function(){
    return bookshelf.knex('accounts').del();
  })
  .then(function(){
    return bookshelf.knex('users').del()
  })
  .finally(done);
}


function makeOrder(user_id, side, price, size) {
  return {
    currency_pair_id: 1,
    type:'limit',
    side:side,
    status:'open',
    price: price,
    size: size,
    user_id: user_id
  };
}

describe('Order Matcher', function(){

  var alice_id, bob_id;

  beforeEach(clearTables);

  beforeEach(function(done){
    users.signup("alice", "alice")
    .then(function(user){
      alice_id = user.id;
    })
    .finally(done);
  });

  beforeEach(function(done){
    users.signup("bob", "bob")
    .then(function(user){
      bob_id = user.id;
    })
    .finally(done);
  });

  after(clearTables);
  
  it('shoud create one trade from two exact matching orders', function(done){
    Promise.map([
      Order.forge(makeOrder(alice_id, 'buy', 200, 1)),
      Order.forge(makeOrder(bob_id, 'sell', 200, 1))
    ], function(order){
      return order.save()
    })
    .then(function(orders) {
      return matcher._processOrder(orders[0])
    })
    .then(function(){
      Trade.fetchAll().then(function(trades){
        expect(trades.length).to.equal(1);
        done();
      });
    })
    .catch(done);
  });

  it('shoud create two trades..', function(done){
    Promise.map([
      Order.forge(makeOrder(alice_id, 'buy', 200, 1)),
      Order.forge(makeOrder(bob_id, 'sell', 200, 0.4)),
      Order.forge(makeOrder(bob_id, 'sell', 200, 0.6))
    ], function(order){
      return order.save()
    })
    .then(function(orders) {
      return matcher._processOrder(orders[0])
    })
    .then(function(){
      Trade.fetchAll().then(function(trades){
        expect(trades.length).to.equal(2);
        done();
      });
    })
    .catch(done);
  });

});
