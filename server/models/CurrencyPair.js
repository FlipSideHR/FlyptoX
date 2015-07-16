
module.exports = function(bookshelf){

  var CurrencyPair = bookshelf.Model.extend({
    tableName: 'currency_pairs',

  });

  return CurrencyPair;
};
