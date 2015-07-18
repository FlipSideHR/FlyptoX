var chai = require('chai');
var expect = chai.expect;
var should = chai.should();

var users = require("../../../server/controllers/users.js");
var helpers = require("../models/helpers");
var User = require("../../../server/models/User");

describe('Users Controller', function(){
  before(helpers.clean);

  describe("Signup process", function(){
    it("should create a new user", function(done){
      users.signup("test@email.com","password").then(function(user){
        expect(user).to.not.equal(undefined);
        done();
      }).catch(done);
    });

    it("new user should have a two accounts", function(done){
      User.where({email:"test@email.com"})
        .fetch({withRelated:'accounts'})
        .then(function(user){
          expect(user.related('accounts').length).to.equal(2);
          //delete accounts and user
          user.related('accounts').at(0).destroy();
          user.related('accounts').at(1).destroy();
          user.destroy();
          done();
        }).catch(done);
    });

    xit("new user should have a USD account with balance 0", function(done){
      done();
    });

    xit("should create a new BTC account with balance 0", function(done){
      done();
    });

    xit("should return a new access token", function(done){
      done();
    });
  });

  describe("Signin process", function(){
    xit("should fail for invalid username and password combination", function(done){
      done();
    });

    xit("should return access token for valid username and password combination", function(done){
      done();
    });
  });

});
