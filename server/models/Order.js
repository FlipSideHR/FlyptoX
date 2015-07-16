var uuid = require('node-uuid');

// returns a bookshelf trade model
// requires a configured bookshelf object be passed to it
module.exports = function(bookshelf){
  var User = require('./User.js')(bookshelf);

  var Order = bookshelf.Model.extend({
    tableName: 'orders',

    initialize: function(){
      this.on('creating', this.onCreate, this);
    },

    // order creation event
    onCreate: function(model, attrs, options) {
      this.set('id', uuid.v1());
    },

    currency_pair: function(){
      return this.belongsTo(CurrencyPair,'currency_pair_id');
    },

    user: function(){
      return this.belongsTo(User, 'user_id');
    },

    transactions: function(){
      return this.hasMany(Transaction, 'order_id');
    }

  });

  return Order;

};
