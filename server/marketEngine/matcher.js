var bookshelf = require('../utils/bookshelf');
var Promise = require('bluebird');
var appEvents = require('../controllers/app-events');
var async = require('async');

var orderQueue = async.queue(matchingWorker);

//new orders can be queued by bit emitting the 'order:new' event
//new orders may also be queued by invoking the

appEvents.on('order:new', orderQueue.push);

module.exports.queueOrder = function(order){
  orderQueue.push(order);
};

//this should only be used for unit testing
module.exports._processOrder = function(order){
  return matchingWorker(order);
};

function matchingWorker(newOrder, doneMatching) {
  var orderId = newOrder.id;

	// Select the order specified by orderID
	return bookshelf.model('Order').where({id:orderId})
    .fetch({required:true}) // required:true throws an error if the desired order is not found
    .then(function(order){
      var startPrice = order.get('price');
      var side = order.get('side');
      var range = side === 'buy' ? '<=' : '>=';
      var counterSide = side === 'buy' ? 'sell' : 'buy';

      var qb = bookshelf.model('Order')
                .where({status:'open', side:counterSide, type:'limit'});

      if(order.get('type') === 'limit') {
        //limit orders
        //the starting price level is the price set in the order
        qb = qb.query('where', 'price', range, startPrice);
        console.log('processing limit order');
      } else {
        //market orders
        //starting price level is the best offer price in the orderbook
        console.log('processing market order');
      }

      return qb
        //avoid self trading!
        .query('where', 'user_id', '!=', order.get('user_id'))
        //process best and oldest orders first
        .query('orderBy', 'price', side === 'buy' ? 'asc' : 'desc', 'created_at', 'asc')
        .fetchAll()
        .then(function(offers){
          return {
            order: order,
            offers: offers
          };
        });
    })
    .then(processOffers)
    .catch(function(err){
      console.log(err);
    })
    .finally(doneMatching);
}


function processOffers(info) {

  return new Promise(function(resolve, reject){
    var offers = info.offers;
    var order = info.order;

    matchOrder(0); //start at index 0

    function matchOrder(index) {
      index = index || 0;
      if(index >= offers.length) {
        //if a market order is only partially filled and there are no more counter offers,
        //we must remove it from the orderbook.
        if(order.get('type') === 'market' && order.get('status') === 'open') {
          order.set('status', 'done');
          order.set('done_reason', 'market_exhausted');
          return order.save().then(resolve).catch(reject);
        } else {
          return resolve();
        }
      }

      var offer = offers.at(index);

      var order_remaining_size = order.get('size') - order.get('filled_size');
      var offer_remaining_size = offer.get('size') - offer.get('filled_size');
      var diff = order_remaining_size - offer_remaining_size;

      bookshelf.transaction(function(T){
        if (diff === 0) {
          //perfect match
          return Promise.all([
            complete_fill(T, order),
            complete_fill(T, offer),
            create_trade(T, order, offer, order_remaining_size)
          ]);

        } else if (diff > 0){
          //partial fill of order
          //complete fill of the offer
          return Promise.all([
            partial_fill(T, order, offer_remaining_size),
            complete_fill(T, offer),
            create_trade(T, order, offer, offer_remaining_size)
          ]);

        } else {
          //partial fill of offer
          //complete fill of the order
          return Promise.all([
            partial_fill(T, offer, order_remaining_size),
            complete_fill(T, order),
            create_trade(T, order, offer, order_remaining_size)
          ]);
        }
      })
      .then(function(results){
        appEvents.emit('trade', results[2].toJSON());

        if (order.get('status') === 'done') {
          resolve();
        } else{
          //the order has not been completely filled, try next offer
          matchOrder(index + 1);
        }
      })
      .catch(function(err){
        reject(err);
      });
    }

  });//new promise

}


function complete_fill(T, order) {
    order.set('status', 'done');
    order.set('done_reason', 'match');
    order.set('filled_size', order.get('size'));
    order.set('done_at', new Date());
    return order.save(null, {transacting: T});
}

function partial_fill(T, order, size) {
  order.set('filled_size', order.get('filled_size') + size);
  return order.save(null, {transacting: T});
}

function create_trade(T, order, offer, size){
  // Create a new trade describing the results of matching the order with the offer:
  return bookshelf.model('Trade').forge({
    "type": order.get('side'),
    "price": offer.get('price'),
    "size": size,
    "maker_id": offer.get('user_id'),
    "taker_id": order.get('user_id'),
    "maker_order_id": offer.get('id'),
    "taker_order_id": order.get('id'),
    "currency_pair_id": order.get('currency_pair_id')
  }).save(null, {transacting: T});
}
