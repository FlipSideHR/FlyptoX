var jwt  = require('jwt-simple');
var TOKEN_SECRET = process.env.TOKEN_SECRET || "secret";
var bookshelf = require('../utils/bookshelf');

module.exports = {
  //use this as middleware for routes that need to be authenticated
  decodeToken: function (req, res, next) {
    var token = req.headers['x-access-token'];
    var userId;

    if (!token) {
      // send 401 if a token is not provided
      return res.status(401).json({message:"missing access token"});
    }

    try {
      // decode token and attach userId to the request
      userId = jwt.decode(token, TOKEN_SECRET);
      bookshelf.model('User').where({id:userId}).fetch().then(function(user){
        if(user){
          req.userId = userId;
          next();
        }else{
          //user not in DB
          res.status(401).json({message:"invalid user"});
        }
      })
      .catch(function(){
        res.status(500).json({message:"internal server error"});
      });
    } catch(error) {
      //invalid token
      res.status(401).json({message:"malformed token"});
    }

  },

  //store the user's id in the token
  generateToken: function (data) {
    return jwt.encode(data, TOKEN_SECRET);
  }

};
