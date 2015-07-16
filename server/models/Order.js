//require('./User');

var uuid = require('node-uuid');

// returns a bookshelf trade model
// requires a configured bookshelf object be passed to it
module.exports = function(bookshelf){

  var Order = bookshelf.Model.extend({
    tableName: 'orders',

    initialize: function(){
      this.on('creating', this.onCreate, this);  
    },

    // order creation event
    onCreate: function(model, attrs, options) {
      this.set('id', uuid.v1());
    },

    currencyPairId: function(){
      return this.hasOne('currency_pair_id');
    },

    userId: function(){
      return this.hasOne('user_id');
    }

  });

  return Order; 

};
  
