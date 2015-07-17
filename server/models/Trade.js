/* exported trade*/
var uuid = require("node-uuid");

var User = require("../utils/models").User;
var Transaction = require("../utils/models").Transaction;
var Order = require("../utils/models").Order;

// returns a bookshelf trade model
// requires a configured bookshelf object be passed to it
module.exports = function(bookshelf){

  var Trade = bookshelf.Model.extend({
    tableName: 'trades',

    initialize: function(){
      this.on('creating', this.onCreate, this);
    },

    // order creation event
    onCreate: function(model, attrs, options) {
      this.set('id', uuid.v1());
    },

    maker: function(){
      return this.belongsTo(User, "maker_id");
    },

    taker: function(){
      return this.belongsTo(User, "taker_id");
    },

    // use makerOrder?
    maker_order: function() {
      return this.belongsTo(Order, "maker_order_id");
    },

    taker_order: function() {
      return this.belongsTo(Order, "taker_order_id");
    },

    transactions: function() {
      return this.hasMany(Transaction, "trade_id");
    }
  });

  return Trade;

};
