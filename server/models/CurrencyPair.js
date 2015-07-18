var bookshelf = require('../utils/bookshelf');

var CurrencyPair = module.exports = bookshelf.model('CurrencyPair', {
  tableName: 'currency_pairs'
});
