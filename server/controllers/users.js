var users = module.exports;
var bookshelf = require("../utils/bookshelf");
var Promise = require("bluebird");

var User = require("../models/User");
var Account = require("../models/Account");
var Transaction = require("../models/Transaction");

//method for registering a new user account - returns new user
users.signup = Promise.method(function(email, password){
  if (!email || !password) throw new Error('Email and password are both required');
  return bookshelf.transaction(function(t){
    return new User({email: email, password:password})
      .save(null, {transacting: t})
      .tap(function(user){
        return Promise.map([
          {user_id:user.get('id'), currency_id:1},
          {user_id:user.get('id'), currency_id:2},
        ],function(info){
          return Account.forge(info)
            .save(null, {transacting: t});
        })
        .then(function(accounts){
          return Transaction.forge({
            account_id:accounts[0].id,
            credit:100000,
            type:'open'
          }).save(null, {transacting: t}).then(function(){
            return Transaction.forge({
              account_id:accounts[1].id,
              credit:500,
              type:'open'
            }).save(null, {transacting: t});
          })
        })
      });
  });
});

//generates a jwt token for a valid email password combination if
//found in the database. This token is used to authenticate the user
//when making api calls
users.signin = function(email, password) {
  return User.verify(email, password);
};


/*
  It returns a promise that on success will resolve to an object with user's information
*/
users.info = function(id){
  return new User({id:id}).fetch()
    .then(function(user){
      if (!user) return {};
      return {
        email: user.get("email"),
        username: user.get("username"),
        fullname: user.get("fullname")
      };
    });
};
