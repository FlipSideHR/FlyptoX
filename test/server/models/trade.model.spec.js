var chai = require('chai');
var expect = chai.expect;
var uuid = require('node-uuid');

var utils = require('./helpers.js');

var bookshelf = require('../../../server/utils/bookshelf.js');
var Trade = require('../../../server/utils/models').Trade;

// add a collection
var Trades = bookshelf.Collection.extend({
  model: Trade
});

describe('Trade Model', function(){

  // keep track of any models we create so we can destroy later

  // we need some user ids
  var uid1, uid2;

  // and some order ids
  var oid1, oid2;


  before(function(done){

    // clear all trades, users and orders
    // before creating new ones
    utils.clean(function(){
      // big old promise chain of users and orders
      // create some users
      utils.user.createUser()
        .then(function(user){
          uid1 = user.get('id');
          return utils.user.createUser();
        })
        .then(function(user){
          uid2 = user.get('id');
          return utils.order.createOrder(uid1);
        })
        // create some orders
        .then(function(order){
          oid1 = order.get('id');
          return utils.order.createOrder(uid2);
        })
        .then(function(order){
          oid2 = order.get('id');
          done();
        })
        .catch(function(err){
          console.error('ERROR: ', err);
          throw err;
        });
    });
  });

  after(function(done){
    utils.clean(done);
  });

  // make sure we have a Trade model object
  it('Exists', function(){
    expect(Trade).to.not.equal(null);
  });

  it('Writes new trades to the database given proper inputs', function(done){
    utils.trade.create([uid1, uid2], [oid1, oid2])
      .then(function(trade){
        expect(trade).to.not.equal(null);
        done();
      })
      .catch(function(err){
        console.error(err);
      });
  });
});
