var bookshelf = require('../utils/bookshelf');

module.exports = bookshelf.model('CurrencyPair', {
  tableName: 'currency_pairs'
});
