
module.exports = function(bookshelf){
  var Transaction = bookshelf.Model.extend({
    tableName: 'transactions',

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
