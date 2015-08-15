var bookshelf = require('../utils/bookshelf');
var Promise = require('bluebird');
var appEvents = require('../controllers/app-events');
var async = require('async');
var accountManager = require('./accountManager');

var orderQueue = async.queue(matchingWorker);

//new orders can be queued by emitting the 'order:new' event
appEvents.on('order:new', orderQueue.push);

//new orders may also be queued by invoking the queueOrder method
module.exports.queueOrder = function(order){
  orderQueue.push(order);
};

//this should only be used for unit testing
module.exports._processOrder = function(order){
  return matchingWorker(order, function(){});
};

function matchingWorker(newOrder, doneMatching) {
  var orderId = newOrder.id;

	// Select the order specified by orderID
	return bookshelf.model('Order').where({id:orderId})
    .fetch({required:true, withRelated:'currency_pair'}) // required:true throws an error if the desired order is not found
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
      } else {
        //market orders
        //starting price level is the best offer price in the orderbook
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
    var availableBalance = 0;
    var quote_currency_id = order.related('currency_pair').get('quote_currency_id');

    if(order.get('type') === 'market' && order.get('side') === 'buy') {
      accountManager.getUserQuoteCurrencyAccount(order.get('user_id'), quote_currency_id)
        .then(accountManager.getAccountAvailableBalance)
        .then(function(available){
          //will need to keep track of balance to ensure we only fill a market order
          //upto a size which doesn't exceed user's available funds
          if(available > 0) {
            availableBalance = available;
            //start order matching
            matchOrder(0);
          } else {
            cancel_order(order)
            .finally(resolve);
          }
        })
        .catch(reject);
    } else {
      matchOrder(0);
    }


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

      //market order checking
      var maxSize;
      var executionSize;

      bookshelf.transaction(function(T){
        //find case when market order can only be partially filled otherwise it would
        //result in negative balance
        if(order.get('type') === 'market' && order.get('side') === 'buy'){
          if(order_remaining_size * offer.get('price') > availableBalance){
            //at this offer price we cannot do a complete fill of the market order
            //so find the max size - do partial fills and end the processing
            maxSize = availableBalance / offer.get('price');
            executionSize = Math.min(maxSize, offer_remaining_size);

            if(executionSize < 0.00000001) {
              return Promise.all([
                done_order(T, order)
              ]);
            }

            availableBalance -= executionSize * offer.get('price');
            return Promise.all([
              partial_fill_final(T, order, executionSize),
              partial_fill(T, offer, executionSize),
              create_trade(T, order, offer, executionSize)
            ]);
          }
        }

        if (diff === 0) {
          //perfect match
          if(order.get('type') === 'market'  && order.get('side') === 'buy') {
            availableBalance -= order_remaining_size * offer.get('price');
          }

          return Promise.all([
            complete_fill(T, order),
            complete_fill(T, offer),
            create_trade(T, order, offer, order_remaining_size)
          ]);

        } else if (diff > 0){
          //partial fill of order
          //complete fill of the offer
          if(order.get('type') === 'market' && order.get('side') === 'buy') {
            availableBalance -= offer_remaining_size * offer.get('price');
          }

          return Promise.all([
            partial_fill(T, order, offer_remaining_size),
            complete_fill(T, offer),
            create_trade(T, order, offer, offer_remaining_size)
          ]);

        } else {
          //partial fill of offer
          //complete fill of the order
          if(order.get('type') === 'market' && order.get('side') === 'buy') {
            availableBalance -= order_remaining_size * offer.get('price');
          }

          return Promise.all([
            partial_fill(T, offer, order_remaining_size),
            complete_fill(T, order),
            create_trade(T, order, offer, order_remaining_size)
          ]);
        }
      })
      .then(function(results){
        if(results[2]){
          appEvents.emit('trade', results[2].toJSON());
        }

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

function cancel_order(order){
  order.set('status', 'done');
  order.set('done_reason', 'not_processed');
  order.set('filled_size', 0);
  order.set('done_at', new Date());
  return order.save();
}

function done_order(T, order){
  order.set('status', 'done');
  order.set('done_reason', 'match');
  order.set('done_at', new Date());
  return order.save(null, {transacting: T});
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

function partial_fill_final(T, order, size) {
  order.set('status', 'done');
  order.set('done_reason', 'match');
  order.set('filled_size', size);
  order.set('done_at', new Date());
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
  })
  .save(null, {transacting: T, method: 'insert'})
  .tap(function(trade){
    return Promise.all([
      accountManager.createTransactionsFromMatch(T, order.get('user_id'),
        order.get('currency_pair_id'), order.get('id'), trade.id, order.get('side'), size, offer.get('price')),
      accountManager.createTransactionsFromMatch(T, offer.get('user_id'),
        offer.get('currency_pair_id'), offer.get('id'), trade.id, offer.get('side'), size, offer.get('price'))
    ]);
  });
}
