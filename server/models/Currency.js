var bookshelf = require('../utils/bookshelf');

module.exports = bookshelf.model('Currency', {
  tableName: 'currencies'
});
