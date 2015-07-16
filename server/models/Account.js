var app = require('../main');
var bookshelf = app.get('bookshelf');

module.exports = function(bookshelf){
  var Account = bookshelf.Model.extend({
    tableName: 'accounts',

    //owner of the account
    user: function(){
      return this.belongsTo(User, "user_id");
    },

    transactions: function() {
      return this.hasMany(Transaction, "account_id");
    }
  });

  return Account;
};
