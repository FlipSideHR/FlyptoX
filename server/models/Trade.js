/* exported trade*/

// returns a bookshelf trade model
// requires a configured bookshelf object be passed to it
module.exports = function(bookshelf){

  var Trade = bookshelf.Model.extend({
    tableName: 'trades',

    maker: function(){
      return this.belongsTo(User, "maker_id");
    },

    taker: function(){
      return this.belongsTo(User, "taker_id");
    },

    maker_order: function() {
      return this.belongsTo(User, "maker_order_id");
    },

    taker_order: function() {
      return this.belongsTo(User, "taker_order_id");
    },

    transactions: function() {
      return this.hasMany(Transaction, "trade_id");
    }
  });

  return Trade;

};
