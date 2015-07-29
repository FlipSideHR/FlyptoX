var chai = require('chai');
var expect = chai.expect;

var accountManager = require('../../marketEngine/accountManager.js');
var bookshelf = require("../../utils/bookshelf");
var users = require('../../controllers/users');

function clearTables(done){
  bookshelf.knex('transactions').del()
  .then(function(){
    bookshelf.knex('accounts').del()
  })
  .then(function(){
    bookshelf.knex('users').del()
  })
  .finally(function(){
    done();
  });
}

describe('accountManager', function(){
  var userCurrencyAccount;

  before(clearTables);

  before(function(done){
    users.signup("alice", "alice")
    .then(function(user){
      return bookshelf.model('User').where({id:user.id}).fetch({withRelated:'accounts'})
      .then(function(user){
        userCurrencyAccount = user.related('accounts').at(0);
      })
    })
    .finally(done);
  });

  after(clearTables);

  xit('properly calculates an orders requirements', function(){
    expect(1).to.equal(2);
  });

  it("depositToAccount() should increase an account's balance", function(done){
    accountManager.getAccountBalance(userCurrencyAccount)
      .then(function(balance_before){
        return accountManager.depositToAccount(userCurrencyAccount.id, 50, "test")
          .then(function(){
            return accountManager.getAccountBalance(userCurrencyAccount);
          })
          .then(function(balance_after){
            expect(balance_after).to.equal(balance_before + 50);
            done();
          });
      }).catch(done);
  });

  it("withdrawFromAccount() should decrease an account's balance", function(done){
    accountManager.getAccountBalance(userCurrencyAccount)
      .then(function(balance_before){
        return accountManager.withdrawFromAccount(userCurrencyAccount.id, 50, "test")
          .then(function(){
            return accountManager.getAccountBalance(userCurrencyAccount);
          })
          .then(function(balance_after){
            expect(balance_after).to.equal(balance_before - 50);
            done();
          });
      }).catch(done);
  });

});
