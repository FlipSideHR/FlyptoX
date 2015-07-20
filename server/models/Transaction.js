var bookshelf = require('../utils/bookshelf');

require("./Account");
require("./Trade");
require("./Order");
var uuid = require("node-uuid");

module.exports = bookshelf.model('Transaction', {
  tableName: 'transactions',
  hasTimestamps: ['created_at', 'updated_at'],

  initialize: function(){
    this.on('creating', this.onCreate, this);
  },

  // order creation event
  onCreate: function() {
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
