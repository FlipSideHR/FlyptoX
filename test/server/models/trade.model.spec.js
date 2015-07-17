var chai = require('chai');
var expect = chai.expect;
var uuid = require('node-uuid');

var utils = require('./helpers.js');

var bookshelf = require('../../../server/utils/bookshelf.js')('test');
var Trade = require('../../../server/models/Trade.js')(bookshelf);

// add a collection
var Trades = bookshelf.Collection.extend({
  model: Trade 
});

describe('Trade Model', function(){

  // keep track of any models we create so we can destroy later
  var test_trades = [];
  var test_users = [];
  var test_orders = [];

  // we need some user ids
  var uid1, uid2;

  // and some order ids
  var oid1, oid2;

  before(function(done){
    
    // big old promise chain of users and orders
    // create some users
    utils.user.createUser()
      .then(function(user){ 
        test_users.push(user);
        uid1 = user.get('id');
        return utils.user.createUser();
      })
      .then(function(user){
        test_users.push(user);
        uid2 = user.get('id');
        return utils.order.createOrder(uid1);
      })
      // create some orders
      .then(function(order){
        test_orders.push(order);
        oid1 = order.get('id');
        return utils.order.createOrder(uid2);
      })
      .then(function(order){
        test_orders.push(order);
        oid2 = order.get('id');
        done();
      })
      .catch(function(err){
        console.error('ERROR: ', err);
        throw err;
      });
  });

  // these are not going off in order currently
  after(function(done){
    // delete all trades? 
    // TODO: change to drop tables format here
    var tradePromises = test_trades.map(function(trade){
      return trade.destroy();
    });

    Promise.all(tradePromises)
      .then(function(){
        return test_orders.map(function(order){
          return order.destroy();
        });
      })
      .then(function(orderPromises){
        return Promise.all(orderPromises);
      })
      .then(function(){
        return test_users.map(function(user){
          return user.destroy();
        });
      })
      .then(function(userPromises){
        return Promise.all(userPromises);
      })
      .catch(function(err){
        console.error(err);
      })
      .finally(done);

  });

  // make sure we have a Trade model object
  it('Exists', function(){
    expect(Trade).to.not.equal(null);
  });

  it('Writes new trades to the database given proper inputs', function(done){
    // this data needs to move out to the helpers utility
    var trade = {
      sequence: 1, 
      type: 'test',
      price: 200.00,
      amount: 0.04,
      maker_id: uid1,
      taker_id: uid2,
      maker_order_id: oid1,
      taker_order_id: oid2 
    };

    Trade.forge(trade).save({}, {method: 'insert'})
      .then(function(trade){
        test_trades.push(trade);
        expect(trade).to.not.equal(null);
        done();
      })
      .catch(function(err){
        console.error(err);
      });
  });
});
