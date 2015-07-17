var Account = require("../utils/models").Account;
var Trade = require("../utils/models").Trade;
var Order = require("../utils/models").Order;

module.exports = function(bookshelf){
  var Transaction = bookshelf.Model.extend({
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
      return this.belongsTo(Account, "account_id");
    },

    trade: function () {
      return this.belongsTo(Trade, "trade_id");
    },

    order: function() {
      return this.belongsTo(Order, "order_id");
    }

  });

  return Transaction;
};
