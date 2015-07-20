var bookshelf = require('../utils/bookshelf');
var uuid = require('node-uuid');


require("./User");
require("./CurrencyPair");
require("./Transaction");

// minimum posible order size
// TODO: let the administrator configure this
var MIN_SIZE = 0.001;

var orderTypes = {
  'market': 'market',
  'limit': 'limit',
  'test': 'test'
};
var validate = function(order){
  // valid currency pair
  // TODO: validate that order.get('currency_pair') is real

  // valid order type (market/limit)
  if(orderTypes[order.get('type')] === 'undefined'){
    throw Error('Invalid order type');
  }

  // valid side (buy/sell)
  if (order.get('side') !== 'buy' && order.get('side') !== 'sell'){
    throw Error('Invalid Order Side: ' + order.get('side') + ' . Must be "buy" or "sell"');
  }

  // valid price - must be positive number
  if (order.get('price') <= 0 || typeof order.get('price') !== 'number'){
    throw Error('Price must be a positive number');
  }

  // valid size
  if (order.get('size') < MIN_SIZE) {
    throw Error('Size must be ' + MIN_SIZE + ' or more.');
  }

  // starts with filledSize of 0
  // starts with status of open
  // starts with done_reason of null
};

var Order = module.exports = bookshelf.model('Order', {
  tableName: 'orders',

  initialize: function(){
    this.on('creating', this.onCreate, this);
  },

  // order creation event
  onCreate: function(model, attrs, options) {
    // validate this order data before creating
    validate(this);

    this.set('id', uuid.v1());
  },

  MIN_SIZE: MIN_SIZE,

  currency_pair: function(){
    return this.belongsTo('CurrencyPair','currency_pair_id');
  },

  user: function(){
    return this.belongsTo('User', 'user_id');
  },

  transactions: function(){
    return this.hasMany('Transaction', 'order_id');
  },

});
