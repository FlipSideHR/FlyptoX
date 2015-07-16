var chai = require('chai');
var expect = chai.expect;

var bookshelf = require('../../../server/utils/bookshelf.js');

var uuid = require('node-uuid');
var Order = require('../../../server/models/Order.js')(bookshelf);
var User = require('../../../server/models/User.js')(bookshelf);

// add a collection
var Orders = bookshelf.Collection.extend({
  model: Order
});

describe('Order Model', function(){

  // this is for certain tests that require a valid user id
  var uid;

  // create an array to hold on to test orders we create
  // so they can easily be deleted later
  var test_orders = [];

  before(function(done){
    //delete test user account incase it wasn't removed due to a failed test
    User.forge().where({email:'test@gmail.com'}).destroy();

    User.forge({email:'test@gmail.com', password:'test'})
    .save()
    .then(function(user){
      // snag a user id and attach it to uid
      uid = user.get('id');
      done();
    });

  });

  after(function(){
    //delete the test user account
    User.forge().where({email:'test@gmail.com'}).destroy();

    // delete all test-created-trades from the db?
    test_orders.forEach(function(val, idx, collection){
      val.destroy();
    });

  });

  // make sure we have a Trade model object
  it('Exists', function(){
    expect(Order).to.not.equal(null);
  });

  it('creates new orders when given proper inputs: ', function(done){
    var myOrder = {
      sequence: 1,
      currency_pair_id: 1,
      order_type: 'limit',
      side: 'buy',
      price: 300.01,
      original_size: 5,
      remaining_size: 0,
      status: 'filled',
      user_id: uid
    };

    // create the order and save it.
    Order.forge(myOrder).save({}, {method: 'insert'}).then(function(order){
      test_orders.push(order);
      expect(order.attributes.price).to.equal(300.01);
      expect(order.attributes.user_id).to.equal(uid);
      done();
    });
  });
});
