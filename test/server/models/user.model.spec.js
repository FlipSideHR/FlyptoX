var chai = require('chai');
var expect = chai.expect;
// utils has some useful functions for testing our db
var utils = require('./helpers.js');

var bookshelf = require('../../../server/utils/bookshelf.js')('test');
var User = require('../../../server/utils/models').User;

// add a collection
var Users = bookshelf.Collection.extend({
  model: User
});

describe('User Model', function(){

  // any users we create for testing should get
  // pushed on here so we can remove from db on after()
  var testUser;
  // runs once before any of our tests start.
  before(function(done){
    utils.clean(function(){
      // create a single user for now
      utils.user.createUUser()
        .then(function(user){
          testUser = user;
          done();
        })
        .catch(function(err){
          console.error('ERROR: ', err);
          throw err;
        });
    });
  });

  // runs once after our tests stop running
  after(function(done){
    // delete all users
    utils.clean(done);
  });

  // make sure we have a User model object
  it('Exists', function(){
    expect(User).to.not.equal(null);
  });

  describe('Creation', function(){
    // we should be able to create new users with the User model object
    it('Attaches a unique id to the user', function(){
      expect(testUser.get('id')).to.not.equal(null);
    });

    // requires unique email
    it('Requires a unique email.', function(done){
      utils.user.createUUser()
        .then(function(user){
          expect(user).to.equal(null);
          done();
        })
        .catch(function(err){
          expect(err.error).to.not.equal(null);
          done();
        });
    });

    it('has a verify function', function(){
      expect(User.verify).to.be.a('function');
    });

    it('requires a password', function(done){
      var user = {
        email: 'myms@gml.com', 
        fullname: 'Mike Symmes'
      };

      utils.user.createCustom(user)
        .then(function(result){
          expect(result).to.equal(null);
        })
        .catch(function(err){
          expect(err).to.not.equal(null);
          var user = {
            password: 'success!',
            email: 'myms@gml.com', 
            fullname: 'Mike Symmes'
          };

          utils.user.createCustom(user)
            .then(function(result){
              expect(result).to.equal(null);
            })
            .catch(function(err){
              expect(err).to.equal(null);
            })
            .finally(function(err, result){
              console.log(err, result);
              expect(err).to.equal(null);
              done();
            });
        });
    });

    xit('never stores a plaintext password', function(){

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
