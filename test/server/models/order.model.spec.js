var chai = require('chai');
var expect = chai.expect;
var uuid = require('node-uuid');

var utils = require('./helpers.js');
var bookshelf = require('../../../server/utils/bookshelf.js')('test');
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
  var test_users = [];
  var test_orders = [];

  before(function(done){
    // populate database?
    
    // create a user and get his id
    utils.user.createUser()
      .then(function(user){
        uid = user.get('id');
        test_users.push(user);
        done();
      })
      .catch(function(err){
        console.error(err);
      });
  });

  after(function(){
    // delete all test-created-trades from the db? 
    test_orders.forEach(function(val){
      val.destroy();
    });

    test_users.forEach(function(val){
      val.destroy();
    });
  });

  // make sure we have a Trade model object
  it('Exists', function(){
    expect(Order).to.not.equal(null);
  });

  it('creates new orders when given proper inputs: ', function(done){
    utils.order.createOrder(uid)
      .then(function(order){
        expect(order.attributes.price).to.equal(300.01);
        expect(order.attributes.user_id).to.equal(uid);
        test_orders.push(order);
        done();
      })
      .catch(function(err){
        expect(err).to.equal(null);
        console.error(err);
      });
  });

  // this doesnt seem to work?
  it('references a real user', function(){
    Order.fetchAll({withRelated: ['userId']})
      .then(function(orders){
        //console.log(orders.models[0].userId());
        //console.log(orders.models[0].related('userId'));
        expect(orders.models[0]).to.not.equal(null);
      })
      .catch(function(err){
        console.error(err);
      });
  });
});
