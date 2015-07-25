var chai = require('chai');
var expect = chai.expect;

var users = require("../../../server/controllers/users.js");
var User = require("../../../server/models/User");

describe('Users Controller', function(){

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
    it("should return access token for valid email and password", function(done){
      users.signin("test@email.com","password").then(function(token){
        expect(token).to.be.a('string');
        done();
      }).catch(done);
    });

    it("should not generate a token for invalid email", function(done){
      users.signin("wrongusername","password").then(function(token){
        expect(token).to.equal(null);
        done();
      }).catch(done);
    });

    it("should not generate a token for invalid password", function(done){
      users.signin("test@email.com","wrongpassword").then(function(token){
        expect(token).to.equal(null);
        done();
      }).catch(done);
    });
  });

});
