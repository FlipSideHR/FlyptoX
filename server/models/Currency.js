var bookshelf = require('../utils/bookshelf');

var Currency = module.exports = bookshelf.model('Currency', {
  tableName: 'currencies'
});
