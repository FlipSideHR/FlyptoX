var chai = require('chai');
var expect = chai.expect;

var knexConfig = require('./knexfile');
var knex = require('knex')(knexConfig.development);
var bookshelf = require('bookshelf')(knex);

var uuid = require('node-uuid');
var Trade = require('../../../server/models/Trade.js')(bookshelf);

// add a collection
var Trades = bookshelf.Collection.extend({
  model: Trade 
});

describe('Trade Model', function(){

  before(function(){
    // populate database?
  });

  after(function(){
    // delete all trades? 
  });

  // make sure we have a Trade model object
  it('Exists', function(){
    expect(Trade).to.not.equal(null);
  });

  xit('Creates new trades to the database', function(done){
    // we will have to create at least 2 users
    // and two orders before being able to fire off a test trade.
    var trade = {
      sequence: 1, 
      type: 'test',
      price: 200.00,
      amount: 0.04,
      maker_id: id,
      taker_id: id2,
      // these need to be actual order ids
      maker_order_id: 1,
      taker_order_id: 2
    };

    Trade.forge(trade).save({}, {method: 'insert'})
      .then(function(trade){
        console.log('Successfull trade: ', trade);
        expect(trade).to.not.equal(null);
        done();
      })
      .catch(function(err){
        console.error(err);
      });
  });
});
