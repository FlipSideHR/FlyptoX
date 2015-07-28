var chai = require('chai');
var expect = chai.expect;

var Promise = require('bluebird');
var bookshelf = require("../../utils/bookshelf");
var Order = require("../../models/Order");
var User = require("../../models/User");

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
      var uid = user.get('id');
      var orders = Orders.forge([
        makeOrder(uid, 'buy', 201, 0.5),
        makeOrder(uid, 'buy', 203, 0.5),
        makeOrder(uid, 'buy', 204, 1.0),
        makeOrder(uid, 'buy', 205, 0.5),
        makeOrder(uid, 'buy', 204, 1.0),
        makeOrder(uid, 'buy', 300, 0.5),
        makeOrder(uid, 'buy', 300, 0.5),//best bid (highest buy order)
        makeOrder(uid, 'sell', 300, 0.5),
        makeOrder(uid, 'sell', 400, 0.5),
        makeOrder(uid, 'sell', 400, 0.5),
        makeOrder(uid, 'sell', 200, 0.5),
        makeOrder(uid, 'sell', 200, 0.5),
        makeOrder(uid, 'sell', 100, 0.5),//best ask (lowest sell order)
      ]);

      return Promise.all(orders.invoke('save'));
    })
    .finally(function(){
      done();
    });
}


describe('Order Book', function(){
  before(makeUser);
  before(makeOrderBook);

  var orderBook = require("../../../server/controllers/book");

  it('level 1 - should return best bid and ask from the order book', function(done){
    orderBook.level[1](1).then(function(book){
      expect(book.bids).to.deep.equal([
        ["300.00", "1.00000000", 2],
      ]);

      expect(book.asks).to.deep.equal([
        ["100.00", "0.50000000", 1]
      ]);
      done();
    })
    .catch(done);
  });

  it('level 2 - should return top 50 best bids and asks from the order book', function(done){
    orderBook.level[2](1).then(function(book){
      expect(book.bids).to.deep.equal([
        ["201.00", "0.50000000", 1],
        ["203.00", "0.50000000", 1],
        ["204.00", "2.00000000", 2],
        ["205.00", "0.50000000", 1],
        ["300.00", "1.00000000", 2]
      ]);

      expect(book.asks).to.deep.equal([
        ["100.00", "0.50000000", 1],
        ["200.00", "1.00000000", 2],
        ["300.00", "0.50000000", 1],
        ["400.00", "1.00000000", 2]
      ]);

      done();
    })
    .catch(done);
  });

  it('level 3 - should return all bids and asks from the order book', function(done){
    orderBook.level[3](1).then(function(book){

      expect(book.bids.length).to.equal(7);
      expect(book.bids[0][0]).to.equal('201.00');
      expect(book.bids[0][1]).to.equal('0.50000000');
      expect(book.asks.length).to.equal(6);
      expect(book.asks[0][0]).to.equal('100.00');
      expect(book.asks[0][1]).to.equal('0.50000000');
      done();
    }).catch(done);
  });

});
