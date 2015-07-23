var OrderBook = module.exports;
var Promise = require("bluebird");
var Order = require('../models/Order');

OrderBook.getBestOrder = function(side, pair_id) {
  return Order.where({status:'open', type:"limit", side:side, currency_pair_id: pair_id})
    .query('orderBy', 'price', side === 'buy' ? 'desc' : 'asc')
    .query('limit','1')
    .fetch();
};

OrderBook.getPriceLevelInfo = function(price, side, pair_id) {
  if(!price) return [];
  return Order.where({status:'open', type:'limit', side:side, price:price, currency_pair_id: pair_id})
    .fetchAll()
    .then(function(orders){
      if(!orders || !orders.length) return [];
      var size = orders.reduce(function(size, order){
        return size + order.get('size') - order.get('filled_size');
      },0);
      return [price.toFixed(2), size.toFixed(8), orders.length];
    });
};

OrderBook.aggregateOrders = function(orders, MAX){
  if(!orders) return [];
  //var aggregatedOrders = [];
  var levels = {};
  var numLevels = 0, i = 0;
  var numRecords = orders.length;
  var price, size; //, level;
  var levelOrder = [];

  while(numLevels < MAX && i < numRecords){
    price = orders.at(i).get('price');
    size = orders.at(i).get('size') - orders.at(i).get('filled_size');
    if(levels[price]){
      levels[price].size += size;
      levels[price].total++;
    } else {
      numLevels++;
      levels[price] = {
        size: size,
        total: 1
      };
      levelOrder.push(price);
    }
    i++;
  }

  return levelOrder.map(function(price){
    return [price.toFixed(2), levels[price].size.toFixed(8), levels[price].total];
  });

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
      Order.where({status:'open', type:"limit", side:"buy", currency_pair_id: pair_id})
        .query('orderBy','price','asc')
        .fetchAll()
        .then(function(orders){
          return orders.map(function(order){
            return [order.get('price').toFixed(2),
                    (order.get('size') - order.get('filled_size')).toFixed(8),
                    order.get('id')];
          });
        }),

      //asks
      Order.where({status:'open', type:"limit", side:"sell", currency_pair_id: pair_id})
        .query('orderBy','price','asc')
        .fetchAll()
        .then(function(orders){
          return orders.map(function(order){
            return [order.get('price').toFixed(2),
                    (order.get('size') - order.get('filled_size')).toFixed(8),
                    order.get('id')];
          });
        })
    ]).then(function(book){
      return {
        bids: book[0],
        asks: book[1]
      }
    })
  },

  "2": function(pair_id){
    return Promise.all([
      //bids - aggregated
      Order.where({status:'open', type:"limit", side:"buy", currency_pair_id: pair_id})
        .query('orderBy','price','desc')//maybe limit number of records
        .fetchAll()
        .then(function(orders){
          return OrderBook.aggregateOrders(orders, 50).reverse();
        }),

      //asks - aggregated
      Order.where({status:'open', type:"limit", side:"sell", currency_pair_id: pair_id})
        .query('orderBy','price','asc')
        .fetchAll()
        .then(function(orders){
          return OrderBook.aggregateOrders(orders, 50);
        })
    ]).then(function(aggregated){
      return {
        bids: aggregated[0],
        asks: aggregated[1]
      };
    });
  },

  "1": function(pair_id) {
    return Promise.all([
      //best bid
      OrderBook.getBestOrder('buy', pair_id)
        .then(function(order){
          return order ? OrderBook.getPriceLevelInfo(order.get('price'), 'buy', pair_id) : [];
        }),

      //best ask
      OrderBook.getBestOrder('sell', pair_id)
        .then(function(order){
          return order ? OrderBook.getPriceLevelInfo(order.get('price'), 'sell', pair_id) : [];
        }),
    ]).then(function(best){
      return {
        bids:[best[0]],
        asks:[best[1]]
      };
    });
  }
};
