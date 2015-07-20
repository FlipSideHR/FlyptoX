var bookshelf = require('../utils/bookshelf');

require('./Currency');

module.exports = bookshelf.model('CurrencyPair', {
  tableName: 'currency_pairs',

  base_currency: function(){
    return this.belongsTo('Currency', 'base_currency_id');
  },

  quote_currency: function(){
    return this.belongsTo('Currency', 'quote_currency_id');
  }

});
