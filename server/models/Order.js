var bookshelf = require('../utils/bookshelf');
var uuid = require('node-uuid');


require("./User");
require("./CurrencyPair");
require("./Transaction");

// TODO: let the administrator configure this
// MINIMUM ORDER SIZE
// gets added as a static to the object model
var MIN_SIZE = 0.001;

// VALID ORDER TYPES
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

  // valid price - limit orders must have a price and be a positive number
  if (order.get('type') === 'limit' && (typeof order.get('price') !== 'number' || order.get('price') <= 0)){
    throw Error('Price must be a positive number');
  }

  // valid size
  if (order.get('size') < MIN_SIZE) {
    throw Error('Size must be ' + MIN_SIZE + ' or more.');
  }

  // TODO?
  // starts with filledSize of 0
  // starts with status of open
  // starts with done_reason of null

};

var Order = module.exports = bookshelf.model('Order', {
  tableName: 'orders',
  hasTimestamps: ['created_at', 'updated_at'],

  initialize: function(){
    this.on('creating', this.onCreate, this);
  },

  // order creation event
  onCreate: function() {
    // validate this order data before creating
    validate(this);

    this.set('id', uuid.v1());
  },

  currency_pair: function(){
    return this.belongsTo('CurrencyPair','currency_pair_id');
  },

  user: function(){
    return this.belongsTo('User', 'user_id');
  },

  transactions: function(){
    return this.hasMany('Transaction', 'order_id');
  },

  // override the toJSON method with one of our own
  // that returns our model jsut the way we want
  toJSON: function() {
    return {
      "id": this.id,
      "size": this.get('size').toFixed(8),
      "price": this.get('price').toFixed(8),
      "currency_pair": this.related('currency_pair').get('currency_pair'),
      "status": this.get('status'),
      "filled_size": this.get('filled_size') ? this.get('filled_size').toFixed(8) : undefined,
      "side": this.get('side'),
      "created_at": this.get('created_at').toISOString(),
      "done_at": this.get('done_at') ? this.get('done_at').toISOString() : undefined,
      "done_reason": this.get('done_reason')
    };
  }
  // STATUS

  // FILLED_SIZE

  // DONE_REASON

}, {

  // STATICS

  // takes an object with the order params
  // and attempts to insert a new order to the db
  // returns a promise with the order or an error
  create: function(order){
    return Order.forge(order).save({}, {method: 'insert'});
  },

  // the minimum size an order can be
  // this should ultimately be configurable by the exchange operator
  MIN_SIZE: MIN_SIZE

});
