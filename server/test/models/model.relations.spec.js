var bookshelf = require("../../utils/bookshelf");

describe('Model Relationships', function(){

  it("Account", function(done){
    bookshelf.model('Account').fetchAll({withRelated:['user','transactions','currency']}).then(function(){
      done();
    }).catch(done);
  });

  it('Order', function(done){
    bookshelf.model('Order').fetchAll({withRelated:['user', 'currency_pair', 'transactions']}).then(function(){
      done();
    }).catch(done);
  });

  it('Trade', function(done){
    bookshelf.model('Trade').fetchAll({withRelated:['maker', 'taker', 'maker_order', 'taker_order', 'transactions']}).then(function(){
      done();
    }).catch(done);
  });

  it('Transaction', function(done){
    bookshelf.model('Transaction').fetchAll({withRelated:['account', 'trade', 'order']}).then(function(){
      done();
    }).catch(done);
  });

  it('User', function(done){
    bookshelf.model('Trade').fetchAll({withRelated:['accounts', 'orders']}).then(function(){
      done();
    }).catch(done);
  });

  it('CurrencyPair', function(done){
    bookshelf.model('CurrencyPair').fetchAll({withRelated:['base_currency', 'quote_currency']}).then(function(){
      done();
    }).catch(done);
  });

});
