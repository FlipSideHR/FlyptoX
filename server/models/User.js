var bookshelf = require('../utils/bookshelf');
var Promise  = require('bluebird');
var bcrypt   = Promise.promisifyAll(require('bcrypt-nodejs'));
var uuid = require("node-uuid");

require("./Account");
require("./Order");

var User = module.exports = bookshelf.model('User', {
  tableName: 'users',
  hasTimestamps: ['created_at', 'updated_at'],

  accounts: function(){
    return this.hasMany("Account", "user_id");
  },

  orders: function(){
    return this.hasMany("Order", "user_id");
  },

  initialize: function(){
    this.on('creating', this.onCreate, this);
  },

  onCreate: function() {
    var self = this;

    // self.get('password') returns undefined if password doesnt exist
    // so we must verify that these exist
    if (self.get('password') === undefined){
      throw Error('Password Required');
    }
    if (self.get('email') === undefined){
      throw Error('Email Required');
    }

    // do other (email/password) validations here

    // create a unique id
    self.set('id', uuid.v4());

    // normalize email address
    self.set('email', self.get('email').toLowerCase().trim());

    // salt and hash
    return bcrypt.genSaltAsync(10).then(function(salt){
      return bcrypt.hashAsync(self.get('password'), salt, null).then(function(hash){
          self.set('password', hash);
          self.set('salt', salt);
          return;
      });
    });
  }
});

//return user model if email and password are valid, null otherwise
User.verify = Promise.method(function(email, password){
  if (!email || !password) return null;
  return new User({email: email.toLowerCase().trim()})
    .fetch().then(function(user) {
      if(!user) return null;
      return bcrypt.compareAsync(password, user.get('password')).then(function(match){
        if(!match) return null;
        return user;
      });
    });
});
