var chai = require('chai');
var expect = chai.expect;

var bookshelf = require('../../../server/utils/bookshelf.js');
var User = require('../../../server/models/User.js')(bookshelf);

// add a collection
var Users = bookshelf.Collection.extend({
  model: User
});

describe('User Model', function(){

  // any users we create for testing should get
  // pushed on here so we can remove from db on after()
  var test_users = [];

  before(function(done){
    // populate database?

    // currently populating with 1 item before running tests
    // because thats all I need. I may create more users in
    // this before function, or start creating users in the
    // tests themselves at some point.....
    var userData = {
      email: 'msymmes@gmail.com',
      password: 'plutox',
      fullname: 'Mike Symmes'
    };

    // create a new user object
    User.forge(userData).save()
      .then(function(user){
        // expect the new user to exist
        if(user) test_users.push(user);
        done();
      })
      .catch(function(err){
        console.error('ERROR: ', err);
        //throw 'ERROR: ' + err;
        done();
      });
  });

  after(function(){
    // delete all users
    test_users.forEach(function(val, idx, collection){
      val.destroy();
    });
  });

  // make sure we have a User model object
  it('Exists', function(){
    expect(User).to.not.equal(null);
  });

  // we should be able to create new users with the User model object
  it('Creates new users with an id property of type uuid', function(){
    expect(test_users[0].get('id')).to.not.equal(null);
  });

   // requires unique email?

   // unique user name?

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
