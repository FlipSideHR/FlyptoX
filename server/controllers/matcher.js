var bookshelf = require('../utils/bookshelf');
var Promise = require('bluebird');
var appEvents = require('./app-events');

var Order = bookshelf.model('Order');
var Trade = bookshelf.model('Trade');

appEvents.on('order:new', processOrder);

module.exports = processOrder;

function processOrder(orderId) {
	// Select the order specified by orderID
	Order.where({id:orderId})
  // required:true throws an error if the desired order is not found
  .fetch({required:true})
  .then(function(order){
    var matchPrice = order.get('price');
    var side = order.get('side');
    var condition = side === 'buy' ? '<=' : '>=';
    var counterSide = side === 'buy' ? 'sell' : 'buy';

    Order.where({status:'open', side:counterSide})
    .query('price', condition, matchPrice)
    .query('user_id', '!=', order.get('user_id')) //avoid self trading! :)
    .query('sortBy', 'created_at', 'asc')//process oldest orders first
    .fetchAll()
    .then(function(offers){
      return {
        order: order,
        offers: offers
      };
    })
    .then(loopOverOrders);
  })
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

      console.assert(order_remaining_size > 0);

			//start transaction here ?
      bookshelf.transaction(function(T){
        if (diff === 0) {
          //perfect match
          //order matters ?
          return Promise.all([
            complete_fill(T, order),
            complete_fill(T, offer),
            create_trade(T, order, offer)
          ]);

        } else if (diff > 0){
          //partial fill of order
          //complete fill of the offer
          return Promise.all([
            partial_fill(T, order),
            complete_fill(T, offer),
            create_trade(T, order, offer)
          ]);

        } else {
          //partial fill of offer
          //complete fill of the order
          return Promise.all([
            partial_fill(T, offer),
            complete_fill(T, order),
            create_trade(T, order, offer)
          ]);
        }
      })
      .then(function(){
        if (order.get('status') === 'done') {
          resolve();
        } else{
          //the order has not been completely filled, try next offer
          matchOrder(index++);
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

function create_trade(T, order, offer ){
  // Create a new trade describing the results of matching the order with the offer:
  return Trade.forge({
    "type": order.get('side'), 		// set type  order.side
    "price": order.get('price'), 	// set price order.price
    "size": order.get('size'), 		// set size  A
    "maker_id": offer.get('user_id'), 	// set maker_id = offer.user_id
    "taker_id": order.get('user_id'), 	// set taker_id = order.user_id
    "maker_order_id": offer.get('id'), 	// set maker_order_id = offer.id
    "taker_order_id": order.get('id'), 	// set taker_order_id = order.id
    "currency_pair_id": order.get('currency_pair_id')	// set currency_pair_id = order.currency_pair_id
  }).save(null, {transacting: T});
}
