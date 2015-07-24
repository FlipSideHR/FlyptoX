/* exported trade*/
var uuid = require("node-uuid");
var bookshelf = require('../utils/bookshelf');

require("./User");
require("./Transaction");
require("./Order");
require("./CurrencyPair");

module.exports = bookshelf.model('Trade', {
  tableName: 'trades',
  hasTimestamps: ['created_at', 'updated_at'],

  initialize: function(){
    this.on('creating', this.onCreate, this);
  },

  // order creation event
  onCreate: function() {
    this.set('id', uuid.v1());
  },

  maker: function(){
    return this.belongsTo('User', 'maker_id');
  },

  taker: function(){
    return this.belongsTo('User', 'taker_id');
  },

  // use makerOrder?
  maker_order: function() {
    return this.belongsTo('Order', 'maker_order_id');
  },

  taker_order: function() {
    return this.belongsTo('Order', 'taker_order_id');
  },

  transactions: function() {
    return this.hasMany('Transaction', 'trade_id');
  },

  currency_pair: function() {
    return this.belongsTo('CurrencyPair', 'currency_pair_id');
  }
});
