var chai = require('chai');
var expect = chai.expect;
var should = chai.should();

var bookshelf = require("../../../server/utils/bookshelf");
var Order = require("../../../server/utils/models").Order;
var User = require("../../../server/utils/models").User;
var helpers = require("../models/helpers");

var Orders = bookshelf.Collection.extend({
  model: Order
});

function makeUser(done){
  User.forge({email:"test", password:"test"}).save().finally(done);
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

//collection is ordered, implement the order method (like backbone?)
//to ensure when a model is added it goes into proper order
//also note: make sure query to load collection orders by price then, created_at
//does the sort run when models are fetched?
function makeOrderBook(done){
    User.forge({email:"test"}).fetch()
    .then(function(user){
      var orders = Orders.forge([
        makeOrder(user.get('id'), 'buy', 201, 0.5),
        makeOrder(user.get('id'), 'buy', 203, 0.5),
        makeOrder(user.get('id'), 'buy', 204, 1.0),
        makeOrder(user.get('id'), 'buy', 205, 0.5),
        makeOrder(user.get('id'), 'buy', 204, 1.0),
        makeOrder(user.get('id'), 'buy', 300, 0.5),
        makeOrder(user.get('id'), 'buy', 300, 0.5),//best bid (highest buy order)
        makeOrder(user.get('id'), 'sell', 100, 0.5),//best ask (lowest sell order)
        makeOrder(user.get('id'), 'sell', 300, 0.5),
        makeOrder(user.get('id'), 'sell', 400, 0.5),
        makeOrder(user.get('id'), 'sell', 400, 0.5),
        makeOrder(user.get('id'), 'sell', 200, 0.5),
        makeOrder(user.get('id'), 'sell', 200, 0.5),
      ]);

      return Promise.all(orders.invoke('save'));
    })
    .catch(done)
    .finally(function(){
      done();
    });
}

describe('Order Aggregator', function(){
  before(helpers.clean);
  before(makeUser);
  before(makeOrderBook);

  var orderBook = require("../../../server/controllers/book");

  it('level 1 - should return best bid and ask from the order book', function(done){
    orderBook.level[1](1).then(function(book){
      expect(book.bids).to.deep.equal([
        [300, 1, 2],
      ]);

      expect(book.asks).to.deep.equal([
        [100, 0.5, 1]
      ]);
      done();
    })
    .catch(function(err){
      done(err)
    });
  });

  xit('level 2 - should return top 50 best bids and asks from the order book', function(){

  });

  xit('level 3 - should return all bids and asks from the order book', function(){

  });

});

describe('Order Aggregator - Level 2', function(){



});
