var bookshelf = require('../utils/bookshelf');

var Account = require("./Account");
var Trade = require("./Trade");
var Order = require("./Order");
var uuid = require("node-uuid");

var Transaction = module.exports = bookshelf.model('Transaction', {
  tableName: 'transactions',

  initialize: function(){
    this.on('creating', this.onCreate, this);
  },

  // order creation event
  onCreate: function(model, attrs, options) {
    this.set('id', uuid.v1());
  },

  //owner of the account
  account: function() {
    return this.belongsTo('Account', "account_id");
  },

  trade: function () {
    return this.belongsTo('Trade', "trade_id");
  },

  order: function() {
    return this.belongsTo('Order', "order_id");
  }

});
