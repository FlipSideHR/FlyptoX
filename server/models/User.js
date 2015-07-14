/* exported User */
var Promise  = require('bluebird');
var bcrypt   = Promise.promisifyAll(require('bcrypt-nodejs'));
var uuid = require("node-uuid");

var uuid = require('node-uuid');

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

      // call a function to create a salt
      // this.createSalt()

      // call a function to hash the user password
      // this.hashPass()
    }
  });

  return User;

};
