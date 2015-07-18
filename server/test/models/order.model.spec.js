var chai = require('chai');
var expect = chai.expect;
var uuid = require('node-uuid');

var utils = require('./helpers.js');
var bookshelf = require('../../utils/bookshelf.js');
var User = require('../../models/User');
var Order = require('../../models/Order');

// add a collection
var Orders = bookshelf.Collection.extend({
  model: Order
});

describe('Order Model', function(){

  // this is for certain tests that require a valid user id
  var uid;

  // create an array to hold on to test orders we create
  // so they can easily be deleted later

  before(function(done){
    // populate database?

    // clean the db first
    utils.clean(function(){
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
  });

  after(function(done){
    utils.clean(done);
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
        done();
      })
      .catch(function(err){
        expect(err).to.equal(null);
        console.error(err);
      });
  });

  // this isnt working as expected
  xit('references a real user', function(done){
    Order.fetchAll({withRelated: ['userId']})
      .then(function(orders){
        //console.log(orders.models[0].related('user'));
        //console.log(orders.models[0].userId());
        //console.log(orders.models[0].related('userId'));

        // this test isnt a real test - it fails just to let you kno
        // there is a problem with this test in general
        expect(orders.models[0]).to.equal(null);
        done();
      })
      .catch(function(err){
        expect(err).to.equal(null);
        done();
      });
  });
});
