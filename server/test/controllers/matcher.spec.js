var chai = require('chai');
var expect = chai.expect;

var matcher = require('../../marketEngine/matcher');

var bookshelf = require("../../utils/bookshelf");

var User = bookshelf.model('User');
var Order = bookshelf.model('Order');
var Trade = bookshelf.model('Trade');
var Promise = require('bluebird');

function clearTradesAndOrders(done){
  bookshelf.knex('trades').del()
  .then(function(){
      return bookshelf.knex('orders').del();
  })
  .then(function(){
  })
  .catch()
  .finally(function(){
    //bookshelf.knex.destroy();
    done();
  });
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

  beforeEach(clearTradesAndOrders);
  afterEach(clearTradesAndOrders);

  var alice_id, bob_id;

  before(function(done){
    User.forge({email:"alice", password:"alice"})
    .save()
    .then(function(user){
      alice_id = user.id;
    })
    .finally(done);
  });

  before(function(done){
    User.forge({email:"bob", password:"bob"})
    .save()
    .then(function(user){
      bob_id = user.id;
    })
    .finally(done);
  });

  it('shout create one trade from two exact matching orders', function(done){
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

  it('shout create two trades..', function(done){
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
