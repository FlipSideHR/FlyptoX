var chai = require('chai');
var expect = chai.expect;

var utils = require('../helpers.js');
var Order = require('../../models/Order');

// add a collection
//var Orders = bookshelf.Collection.extend({
//  model: Order
//});
describe('Order Model', function(){
  // this is for certain tests that require a valid user id
  var uid;

  // a generic order
  var myOrder = {
    sequence: 1,
    currency_pair_id: 1,
    type: 'limit',
    price: 301.01,
    side: 'buy',
    size: 50,
    filled_size: 0,
    user_id: uid
  };

  before(function(done){

    // create a user and get his id
    utils.user.createUser()
      .then(function(user){
        uid = user.get('id');
        done();
      })
      .catch(function(err){
        console.error(err);
      });

  });

  // make sure we have a Trade model object
  it('Exists', function(){
    expect(Order).to.not.equal(null);
  });

  it('Has a MIN_SIZE property', function(){
    expect(Order.MIN_SIZE).to.equal(0.001);
  });

  describe('.side', function(){
    it('cannot be empty', function(done){
      // test with no 'side' value defined
      myOrder.side = undefined;
      utils.order.createCustom(myOrder)
        .then(function(order){
          expect(order).to.equal(null);
          done();
        })
        .catch(function(err){
          expect(err).to.not.equal(null);
          done();
        });
    });

    it('must be the string "buy" or "sell"', function(done){
      // test with a junk string
      myOrder.side = 'someJunKValue';
      utils.order.createCustom(myOrder)
        .then(function(order){
          expect(order).to.equal(null);
          done();
        })
        .catch(function(err){
          expect(err).to.not.equal(null);
          done();
        });
    });
  });

  describe('.price', function(){
    it('must be a positive number.', function(done){
      myOrder.price = -500.55;
      utils.order.createCustom(myOrder)
        .then(function(order){
          expect(order).to.equal(null);
          done();
        })
        .catch(function(err){
          expect(err).to.not.equal(null);
          done();
        });
    });
  });

  describe('.size', function(){
    it('must be a positive number.', function(done){
      myOrder.size = -5;
      utils.order.createCustom(myOrder)
        .then(function(order){
          expect(order).to.equal(null);
          done();
        })
        .catch(function(err){
          expect(err).to.not.equal(null);
          done();
        });
    });

    it('must be greater than MIN_SIZE: '+new Order().MIN_SIZE, function(done){
      myOrder.size = 0.0001;
      utils.order.createCustom(myOrder)
        .then(function(order){
          expect(order).to.equal(null);
          done();
        })
        .catch(function(err){
          expect(err).to.not.equal(null);
          done();
        });
    });
  });

  it('creates new orders when given proper inputs: ', function(done){
    utils.order.createOrder(uid)
      .then(function(order){
        expect(order.attributes.price).to.equal(300.01);
        expect(order.attributes.user_id).to.equal(uid);
        done();
      })
      .catch(function(err){
        expect(err).to.equal(null);
        console.error(err);
      });
  });

  it('references a real user', function(done){
    Order.fetchAll()
      .then(function(orders){
        orders.at(0)
          .load(['user'])
          .then(function(model){
            expect(model.relations.user.id === uid);
            done();
          });
      })
      .catch(function(err){
        console.log(err);
        expect(err).to.equal(null);
        done();
      });
  });
});
