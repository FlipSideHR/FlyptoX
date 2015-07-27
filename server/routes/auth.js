var express = require('express');
var router = express.Router();
var users = require("../controllers/users");
var privateApi = require("../controllers/tokens").decodeToken;
var partials = require('express-partials');
var bodyParser = require('body-parser');
var tokens = require("../controllers/tokens");

router.use(partials());
// Parse JSON (uniform resource locators)
router.use(bodyParser.json());
// Parse forms (signup/login)
router.use(bodyParser.urlencoded({ extended: true }));

//The following routes are intented to be used by angular services

/*
to signin a user. On success they will return a JSON object containing a token
todo - rate limiting
todo - return a new 'secret' to be used for HMAC signatures (attached as headers on api calls)
returns a json object
  {
    "token": "9823409sz7632m4b2387fksd....."
  }
*/
router.post('/signin', function(req, res) {
  if(!req.body.email || !req.body.password) return res.status(400).json({
    message: "Both email and password are required."
  });
  users.signin(req.body.email, req.body.password)
    .then(function(user){
      if(user){
        res.json({token: tokens.generateToken(user.get("id"))});
      } else{
        res.status(401).json({message:'invalid email and password'});
      }
    })
    .catch(function(){
      res.status(500).json({message:"internal server error"});
    });
});

/*
to signup a new user. On success it will return a JSON object containing a token
todo - rate limiting
todo - return a new 'secret' to be used for HMAC signatures (attached as headers on api calls)
returns a json object
  {
    "token": "9823409sz7632m4b2387fksd....."
  }
*/
router.post('/signup', function(req, res) {
  if(!req.body.email || !req.body.password) return res.status(400).json({
    message: "Both email and password are required."
  });
  users.signup(req.body.email, req.body.password)
    .then(function(user){
      if(user) {
        res.json({token: tokens.generateToken(user.get("id"))});
      } else {
        res.status(403).json({message:'error creating account'});
      }
    })
    .catch(function(){
      res.status(403).json({message:'error creating account'});
    });
});

/*
This route is authenticated and can be used by angular to fetch the logged in user's
details (email, fullname) and serves as a check to verify if the held token is valid or not.
  returns a json object:
  {
    "email": "user@email.com",
    "fullname": "Full Name"
  }
*/
router.get('/whoami', privateApi, function(req, res) {
  //if the token was valid a userId property is attached to the request
  users.info(req.userId)
    .then(function(userInfo){
      res.json(userInfo);
    })
    .catch(function(){
      //user no longer exists in the database
      res.send(401);
    });
});

//TODO - use this method to update user's details
router.post('/whoami', privateApi, function(req, res) {
  //if the token was valid a userId property is attached to the request
  res.send(200);
});

module.exports = router;
