var jwt  = require('jwt-simple');
var TOKEN_SECRET = process.env.TOKEN_SECRET || "secret";
var bookshelf = require('../utils/bookshelf');

module.exports = {
  //use this as middleware for routes that need to be authenticated
  decodeToken: function (req, res, next) {
    var token = req.headers['x-access-token'];
    var userId;

    if (!token) {
      return res.send(403); // send forbidden if a token is not provided
    }

    try {
      // decode token and attach userId to the request
      userId = jwt.decode(token, TOKEN_SECRET);
      bookshelf.model('User').where({id:userId}).fetch().then(function(user){
        if(user){
          req.userId = userId;
          next();
        }else{
          res.send(401);//user not in DB
        }
      }).catch(function(){
        res.send(500);
      });
    } catch(error) {
      //invalid token
      res.send(401);
    }

  },

  //store the user's id in the token
  generateToken: function (data) {
    return jwt.encode(data, TOKEN_SECRET);
  }

};
