var OrderBook = module.exports;
var Promise = require("bluebird");
var Order = require('../utils/models').Order;

OrderBook.getBestPrice = function(side, pair_id) {
  return Order.forge({status:'open', type:"limit", side:side, currency_pair_id: pair_id})
    .query('orderBy', 'price', side === 'buy' ? 'desc' : 'asc')
    .query('limit','1')
    .fetch();
};

OrderBook.getPriceLevelInfo = function(price, side, pair_id) {
  if(!price) return [];
  return Order.forge({status:'open', type:'limit', side:side, price:price, currency_pair_id: pair_id})
    .fetchAll()
    .then(function(orders){
      if(!orders || !orders.length) return [];
      var size = orders.reduce(function(size, order){
        return size + order.get('size');//or size - filled_size ?
      },0);
      return [price, size, orders.length];
    });
};

OrderBook.aggregateOrders = function(orders, MAX){
  if(!orders) return [];
  var aggregatedOrders = [];
  var levels = {};
  var numLevels = 0, i = 0;
  var numRecords = orders.length;
  var price, size, level;

  while(numLevels < MAX && i < numRecords){
    price = orders.at(i).get('price');
    size = orders.at(i).get('size');
    if(levels[price]){
      levels[price].size += size;
      levels[price].total++;
    } else {
      numLevels++;
      levels[price].size = size;
      levels[price].total = 1;
    }
    i++;
  }

  for(level in levels) {
    aggregatedOrders.push([level.price, level.size, level.total]);
  }

  return aggregatedOrders;
};


/*
{
    "bids": [
        [ price, size, (num-orders or order-id if level 3) ],
        [ price, size, num-orders ],
        .
        .
    ],
    "asks": [
        [ price, size, num-orders ],
        [ price, size, num-orders ]
        .
        .
    ]
}
*/
OrderBook.level = {
  "3": function(pair_id) {
    return Promise.all([
      //bids
      Order.forge({status:'open', type:"limit", side:"buy", currency_pair_id: pair_id})
        .query('orderBy','price','asc')
        .fetchAll()
        .then(function(orders){
          return orders.map(function(order){
            return [order.get('price'), order.get('size'), order.get('id')];
          });
        }),

      //asks
      Order.forge({status:'open', type:"limit", side:"sell", currency_pair_id: pair_id})
        .query('orderBy','price','desc')
        .fetchAll()
        .then(function(orders){
          return orders.map(function(order){
            return [order.get('price'), order.get('size'), order.get('id')];
          });
        })
    ]);
  },

  "2": function(pair_id){
    return Promise.all([
      //bids - aggregated
      Order.forge({status:'open', type:"limit", side:"buy", currency_pair_id: pair_id})
        .query('orderBy','price','desc')//maybe limit number of records
        .fetchAll()
        .then(function(orders){
          return OrderBook.aggregateOrders(orders, 50).reverse();
        }),

      //asks - aggregated
      Order.forge({status:'open', type:"limit", side:"sell", currency_pair_id: pair_id})
        .query('orderBy','price','asc')
        .fetchAll()
        .then(function(orders){
          return OrderBook.aggregateOrders(orders, 50);
        })
    ]);
  },

  "1": function(pair_id) {
    return Promise.all([
      //best bid
      OrderBook.getBestPrice('buy', pair_id)
        .then(function(price){
          return OrderBook.getPriceLevelInfo(price, 'buy', pair_id);
        }),

      //best ask
      OrderBook.getBestPrice('sell', pair_id)
        .then(function(price){
          return OrderBook.getPriceLevelInfo(price, 'sell', pair_id);
        }),
    ]);
  }
};
