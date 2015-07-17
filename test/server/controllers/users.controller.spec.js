var chai = require('chai');
var expect = chai.expect;
var should = chai.should();

var users = require("../../../server/controllers/users.js");

describe('Users Controller', function(){
  before(function(done){
    done();
  });

  after(function(done){
    done();
  });

  describe("Signup process", function(){
    xit("should create a new user", function(done){
      users.signup("test@email.com","password").then(function(user){
        done();
      }).catch(function(err){
        done(err);
      })
    });

    xit("should create a new USD account with balance 0", function(done){
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
