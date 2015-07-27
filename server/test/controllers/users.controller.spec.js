var chai = require('chai');
var expect = chai.expect;

var users = require("../../../server/controllers/users.js");
var User = require("../../../server/models/User");

describe('Users Controller', function(){

  describe("users.signup(email, password)", function(){
    it("should create a new user and return a token", function(done){
      users.signup("test@email.com","password").then(function(user){
        expect(user.get('email')).to.equal('test@email.com');
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

    it("should create USD account", function(done){
      User.where({email:"test@email.com"})
        .fetch({withRelated:'accounts'})
        .then(function(user){
          var usd_account = user.related('accounts').findWhere({currency_id:1});
          expect(usd_account).to.not.equal(undefined);
          done();
        }).catch(done);
    });

    it("should create BTC account", function(done){
      User.where({email:"test@email.com"})
        .fetch({withRelated:'accounts'})
        .then(function(user){
          var btc_account = user.related('accounts').findWhere({currency_id:2});
          expect(btc_account).to.not.equal(undefined);
          done();
        }).catch(done);
    });

  });

  describe("users.signin(email, password)", function(){
    it("should signin user with valid email and password", function(done){
      users.signin("test@email.com","password").then(function(user){
        expect(user.get('email')).to.equal('test@email.com');
        done();
      }).catch(done);
    });

    it("should not signin user with invalid email", function(done){
      users.signin("wrongusername","password").then(function(user){
        expect(user).to.equal(null);
        done();
      }).catch(done);
    });

    it("should not signin with invalid password", function(done){
      users.signin("test@email.com","wrongpassword").then(function(user){
        expect(user).to.equal(null);
        done();
      }).catch(done);
    });
  });

});
