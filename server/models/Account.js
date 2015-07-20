var uuid = require("node-uuid");
var bookshelf = require('../utils/bookshelf');

require("./User");
require("./Transaction");
require("./Currency");

module.exports = bookshelf.model('Account', {
  tableName: 'accounts',
  hasTimestamps: ['created_at', 'updated_at'],

  initialize: function(){
    this.on('creating', this.onCreate, this);
  },

  //onCreate: function(model, attrs, options) {
  onCreate: function() {
    var self = this;
    self.set('id', uuid.v4());
  },

  //owner of the account
  user: function(){
    return this.belongsTo("User", "user_id");
  },

  transactions: function() {
    return this.hasMany("Transaction", "account_id");
  },

  currency: function(){
    return this.belongsTo("Currency", "currency_id");
  }
});
