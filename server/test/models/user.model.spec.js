var chai = require('chai');
var expect = chai.expect;
// utils has some useful functions for testing our db
var utils = require('../helpers.js');

var bookshelf = require('../../utils/bookshelf.js');
var User = require('../../models/User');

// add a collection
var Users = bookshelf.Collection.extend({
  model: User
});

describe('User Model', function(){

  // make sure we have a User model object
  it('Exists', function(){
    expect(User).to.not.equal(null);
  });

  describe('Creation', function(){
    // we should be able to create new users with the User model object
    it('Attaches a unique id to the user', function(done){
      // create a single (unique) user
      var myUser = {
        password: 'jimminy',
        email: 'jcricket@wonderland.com',
        fullname: 'Jimminy Cricket'
      };

      utils.user.createCustom(myUser)
        .then(function(user){
          expect(user.get('id')).to.not.equal(null);
          expect(user.get('created_at')).to.not.equal(undefined);
          done();
        })
        .catch(done);
      });

    // requires unique email
    it('Requires a unique email.', function(done){
      // this should fail since the unique user was created in the previous
      // test ('Attaches a unique id to the user')
      var myUser = {
        password: 'jimminy',
        email: 'jcricket@wonderland.com',
        fullname: 'Jimminy Cricket'
      };

      utils.user.createCustom(myUser)
        .then(function(user){
          expect(user).to.equal(null);
          done();
        })
        .catch(function(err){
          expect(err.error).to.not.equal(null);
          done();
        });
    });

    it('fails without a password', function(done){
      var user = {
        email: 'mms@gml.com',
        fullname: 'Mike Symmes'
      };

      utils.user.createCustom(user)
        .then(function(result){
          expect(result).to.equal(null);
          done();
        })
        .catch(function(err){
          expect(err).to.not.equal(null);
          done();
        });
    });

    it('succeeds with valid password', function(done){
      var user = {
        password: 'success!',
        email: 'mmmyms@gailajdml.com',
        fullname: 'Terryaki Jones'
      };

      utils.user.createCustom(user)
        .then(function(result){
          expect(result.get('email')).to.equal('mmmyms@gailajdml.com');
          done();
        })
        .catch(function(err){
          console.log(err);
          expect(err).to.equal(null);
          done();
        });
    });

    it('hashes password', function(done){
      var user = {
        password: 'success!',
        email: 'mys@gildml.com',
        fullname: 'Terri Jo'
      };

      utils.user.createCustom(user)
        .then(function(result){
          expect(result.get('password')).to.not.equal('success!');
          done();
        })
        .catch(function(err){
          console.log(err);
          expect(err).to.equal(null);
          done();
        });
    });
  });
  describe('#verify', function(){
    it('is a function', function(){
      expect(User.verify).to.be.a('function');
    });

    it('verifies user credentials against the salted hashed password', function(done){
      var user = {
        password: 'ssoijdfuccess!',
        email: 'lkjsdmys@gildml.com',
        fullname: 'Terri Jo'
      };

      utils.user.createCustom(user)
        .then(function(){
          // returns a user if the verify is successful
          return User.verify(user.email, user.password);
        })
        .then(function(result){
          expect(result.get('email')).to.equal(user.email);
        })
        .catch(function(err){
          console.log('-->', err);
          expect(err).to.equal(null);
        })
        .finally(done);
    });
  });
});

// Users collection is not actually a file yet
// I am trying to determine if its worth putting it in its own file
// or if it makes more sense to just create a collection where its needed
// or slighlty change the way models are exported...
// so that a model file exported both the model and a collection
describe('Users Collection', function(){
  it('has a collection of users', function(done){
    Users.forge()
    .fetch()
    .then(function(collection){
      expect(collection.models).to.be.an('array');
      done();
    })
    .catch(function(err){
      console.error(err);
      expect(err).to.equal(null);
    });
  });
});
