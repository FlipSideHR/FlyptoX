var bookshelf = require('../utils/bookshelf');
var Promise = require('bluebird');
var appEvents = require('./app-events');

var Order = bookshelf.model('Order');
var Trade = bookshelf.model('Trade');

appEvents.on('order:new', processOrder);

module.exports.processOrder = processOrder;

function processOrder(newOrder) {
  var orderId = newOrder.id;

	// Select the order specified by orderID
	return bookshelf.model('Order').where({id:orderId})
    .fetch({required:true}) // required:true throws an error if the desired order is not found
    .then(function(order){
      var matchPrice = order.get('price');
      var side = order.get('side');
      var condition = side === 'buy' ? '<=' : '>=';
      var counterSide = side === 'buy' ? 'sell' : 'buy';

      return bookshelf.model('Order').where({status:'open', side:counterSide})
        .query('where', 'price', condition, matchPrice)
        .query('where', 'user_id', '!=', order.get('user_id')) //avoid self trading!
        .query('orderBy', 'created_at', 'asc')//process oldest orders first
        .fetchAll()
        .then(function(offers){
          return {
            order: order,
            offers: offers
          };
        });
    })
    .then(loopOverOrders)
    .catch(function(err){
      console.log(err);
    });
}


function loopOverOrders(info) {

  return new Promise(function(resolve, reject){
    var offers = info.offers;
    var order = info.order;

    matchOrder(0); //start at index 0

    function matchOrder(index) {
      index = index || 0;
      if(index >= offers.length) return resolve();

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
        appEvents.emit('trade', results[2]);

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
    "price": order.get('price'), 	// should this be offer.price ?
    "size": size,
    "maker_id": offer.get('user_id'),
    "taker_id": order.get('user_id'),
    "maker_order_id": offer.get('id'),
    "taker_order_id": order.get('id'),
    "currency_pair_id": order.get('currency_pair_id')
  }).save(null, {transacting: T});
}
