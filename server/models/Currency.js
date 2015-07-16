
module.exports = function(bookshelf){

  var Currency = bookshelf.Model.extend({
    tableName: 'currencies',

  });

  return Currency;
};
