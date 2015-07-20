var jwt  = require('jwt-simple');
var TOKEN_SECRET = process.env.TOKEN_SECRET || "secret";

module.exports = {
  //use this as middleware for routes that need to be authenticated
  decodeToken: function (req, res, next) {
    var token = req.headers['x-access-token'];

    if (!token) {
      return res.send(403); // send forbidden if a token is not provided
    }

    try {
      // decode token and attach userId to the request
      //TODO: should verify that the user still exists in db and return 403?
      req.userId = jwt.decode(token, TOKEN_SECRET);
      next();
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
