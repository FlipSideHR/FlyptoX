var tokens = require("./tokens");
var users = module.exports;

//method for registering a new user account and returns a new token
users.signup = function(email, password){
  return User.signup(email, password)
    .then(function(user){
      return tokens.generateToken(user.get("id"));
      //TODO ... emit event: new user registered,  (through app events object)
      //event should be consumed by:
      //Email verification Controller - to send email verification link
      //Accounts controller - to create new USD and BTC accounts for the user
    });
};

//generates a jwt token for a valid email password combination if
//found in the database. This token is used to authenticate the user
//when making api calls
users.signin = function(email, password) {
  return User.signin(email, password)
    .then(function(user){
      //store the userId in the token
      return tokens.generateToken(user.get("id"));
    });
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
