var bookshelf = require('../../../server/utils/bookshelf.js')('test');
var User = require('../../../server/models/User.js')(bookshelf);
var Order = require('../../../server/models/Order.js')(bookshelf);

var utils = module.exports;

// an array of users for testing
var users = [
  {
    password: 'plutox', 
    email: 'msymmes@gmail.com', 
    fullname: 'Mike Symmes'
  },
  {
    password: 'blahblahb', 
    email: 'marky@mark.com', 
    fullname: 'Marky Mark'
  },
  {
    password: 'laskdjlaskjdf', 
    email: 'cash@johnny.com', 
    fullname: 'Johnny Cash'
  }
];

utils.order = {
  createOrder: function(uid){

    var myOrder = {
      sequence: 1,
      currency_pair_id: 1,
      order_type: 'limit',
      side: 'buy',
      price: 300.01,
      original_size: 5,
      remaining_size: 0,
      status: 'filled',
      user_id: uid
    };

    // create the order and save it.
    return Order.forge(myOrder).save({}, {method: 'insert'});
  }
};

utils.user = {
  // create a unique user
  createUUser: function(callback){

    // create a new user object 
    return User.forge(users[0]).save({}, {method: 'insert'});
 
  },
  // create a new user from our test data array
  // only 2 users currently
  usersCreated: 0,
  createUser: function(callback){

    // create a new user object 
    return User.forge(users[this.usersCreated++]).save({}, {method: 'insert'});
 
  }
};

