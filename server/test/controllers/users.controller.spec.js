var chai = require('chai');
var expect = chai.expect;

var bookshelf = require("../../utils/bookshelf");
var users = require("../../../server/controllers/users.js");
var User = require("../../../server/models/User");

function clearTables(done){
  bookshelf.knex('accounts').del()
  .then(function(){
      return bookshelf.knex('orders').del();
  })
  .then(function(){
      return bookshelf.knex('users').del();
  }).then(function(){
    done();
  })
  .catch(done);
}
describe('Users Controller', function(){
  before(clearTables);
  after(clearTables);

  describe("users.signup(email, password)", function(){
    it("should create a new user and return a token", function(done){
      users.signup("test@email.com","password").then(function(token){
        expect(token).to.be.a('string');
        done();
      }).catch(done);
    });

    it("should create two accounts for user", function(done){
      User.where({email:"test@email.com"})
        .fetch({withRelated:'accounts'})
        .then(function(user){
          expect(user.related('accounts').length).to.equal(2);
          done();
        }).catch(done);
    });

    it("should create USD account with balance 0", function(done){
      User.where({email:"test@email.com"})
        .fetch({withRelated:'accounts'})
        .then(function(user){
          var usd_account = user.related('accounts').findWhere({currency_id:1});
          expect(usd_account).to.not.equal(undefined);
          expect(usd_account.get('balance')).to.equal(0);
          done();
        }).catch(done);
    });

    it("should create BTC account with balance 0", function(done){
      User.where({email:"test@email.com"})
        .fetch({withRelated:'accounts'})
        .then(function(user){
          var btc_account = user.related('accounts').findWhere({currency_id:2});
          expect(btc_account).to.not.equal(undefined);
          expect(btc_account.get('balance')).to.equal(0);
          done();
        }).catch(done);
    });

  });

  describe("users.signin(email, password)", function(){
    it("should return access token for valid username and password", function(done){
      users.signin("test@email.com","password").then(function(token){
        expect(token).to.be.a('string');
        done();
      }).catch(done);
    });

    it("should throw error for invalid username", function(done){
      users.signin("wrongusername","password").then(function(){
        done(new Error("token returned for invalid account!"));
      }).catch(function(){
        done();
      });
    });

    it("should throw error for invalid password", function(done){
      users.signin("test@email.com","wrongpassword").then(function(){
        done(new Error("token returned for invalid account!"));
      }).catch(function(){
        done();
      });
    });
  });

});
