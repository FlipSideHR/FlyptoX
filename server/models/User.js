/* exported User */
var Promise  = require('bluebird');
var bcrypt   = Promise.promisifyAll(require('bcrypt-nodejs'));
var uuid = require("node-uuid");

// returns a bookshelf user model
// requires a configured bookshelf object be passed to it
module.exports = function(bookshelf){

  var User = bookshelf.Model.extend({
    tableName: 'users',

    initialize: function(){
      this.on('creating', this.onCreate, this);  
    },

    // event for capturing new user events
    onCreate: function(model, attrs, options) {
      // any kind of validation might go here

      // create a new user id
      this.set('id', uuid.v1());

    },

    signin: Promise.method(function(email, password){
      if (!email || !password) throw new Error('Email and password are both required');
      return new User({email: email.toLowerCase().trim()}).fetch().then(function(user) {
        if(!user) throw new Error("User Not Found");
        return bcrypt.compareAsync(password, user.get('password')).then(function(match){
          if(match) return user;
          throw new Error("Wrong Password");
        });
      });
    }),

    signup: Promise.method(function(email, password){
      if (!email || !password) throw new Error('Email and password are both required');
      return new User({email: email.toLowerCase().trim()}).fetch().then(function(user) {
        if(user) {
          throw new Error('User Exists');
        } else {
          return bcrypt.genSaltAsync(10).then(function(salt){
            return bcrypt.hashAsync(password, salt, null).then(function(hash){
              return user = new User({
                email: email.toLowerCase().trim(),
                password: hash,
                salt: salt
              }).save({}, {method: 'insert'});
            });
          })
        }
      });
    }),

  });

  return User;

};
