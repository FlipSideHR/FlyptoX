/* exported trade*/
var uuid = require("node-uuid");

// returns a bookshelf trade model
// requires a configured bookshelf object be passed to it
module.exports = function(bookshelf){
  var User = require('./User')(bookshelf);
  var Order = require('./Order')(bookshelf);

  var Trade = bookshelf.Model.extend({
    tableName: 'trades',

    initialize: function(){
      this.on('creating', this.onCreate, this);  
    },

    // event for capturing new user events
    onCreate: function(model, attrs, options) {
      // any kind of validation might go here

      // create a new user id
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
