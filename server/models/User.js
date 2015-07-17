/* exported User */
var Promise  = require('bluebird');
var bcrypt   = Promise.promisifyAll(require('bcrypt-nodejs'));
var uuid = require("node-uuid");

// returns a bookshelf user model
// requires a configured bookshelf object be passed to it
module.exports = function(bookshelf){

  var User = bookshelf.Model.extend({
    tableName: 'users',

    accounts: function(){
      return this.hasMany(Account, "user_id");
    },

    orders: function(){
      return this.hasMany(Order, "user_id");
    },

    initialize: function(){
      this.on('creating', this.onCreate, this);
    },

    onCreate: function(model, attrs, options) {
      var self = this;
      self.set('id', uuid.v4());
      self.set('email', self.get('email').toLowerCase().trim());
      return bcrypt.genSaltAsync(10).then(function(salt){
        return bcrypt.hashAsync(self.get('password'), salt, null).then(function(hash){
            self.set('password', hash);
            self.set('salt', salt);
            return;
        });
      });
    }
  });

  User.verify = Promise.method(function(email, password){
    if (!email || !password) throw new Error('Email and password are both required');
    return new User({email: email.toLowerCase().trim()})
      .fetch({require: true}).tap(function(user) {
        return bcrypt.compareAsync(password, user.get('password')).then(function(match){
          if(!match) throw new Error("Wrong Password");
        });
      });
  });

  return User;
};
