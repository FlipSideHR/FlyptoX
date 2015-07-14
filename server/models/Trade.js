/* exported trade*/

require('./User');

// returns a bookshelf trade model
// requires a configured bookshelf object be passed to it
module.exports = function(bookshelf){

  var Trade = bookshelf.Model.extend({
    tableName: 'trades',

    maker_id: function(){
      return this.belongsTo('User');
    },

    taker_id: function(){
      return this.belongsTo('User');
    },
    
    maker_order_id: function() {
      return this.belongsTo('User');
    },


    taker_order_id: function() {
      return this.belongsTo('User');
    }

  });

  return Trade; 

};
  
