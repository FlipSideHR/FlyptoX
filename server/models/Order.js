var bookshelf = require('../utils/bookshelf');
var uuid = require('node-uuid');

require("./User");
require("./CurrencyPair");
require("./Transaction");

var Order = module.exports = bookshelf.model('Order', {
  tableName: 'orders',

  initialize: function(){
    this.on('creating', this.onCreate, this);
  },

  // order creation event
  onCreate: function(model, attrs, options) {
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
  }

});
