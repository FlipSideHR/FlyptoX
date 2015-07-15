var express = require('express');
var router = express.Router();
var users = require("../controllers/users");
var privateApi = require("../controllers/tokens").decodeToken;
var partials = require('express-partials');
var bodyParser = require('body-parser');

router.use(partials());
// Parse JSON (uniform resource locators)
router.use(bodyParser.json());
// Parse forms (signup/login)
router.use(bodyParser.urlencoded({ extended: true }));

//The following routes are intented to be used by angular services

//to signin a user. On success they will return a JSON object containing a token
//todo - rate limiting
router.post('/signin', function(req, res) {
  if(!req.body.email || !req.body.password) return res.send(400);
  users.getToken(req.body.email, req.body.password)
    .then(function(token){
      res.json({token: token});
    })
    .catch(function(err){
      res.send(401);
    });
});

//to signup a new user. On success it will return a JSON object containing a token
//todo rate limiting
router.post('/signup', function(req, res) {
  if(!req.body.email || !req.body.password) return res.send(400);
  users.registerNewUser(req.body.email, req.body.password)
    .then(function(token){
      res.json({token: token});
    })
    .catch(function(err){
      console.log(err);
      res.send(403);
    });
});

//This route is authenticated and can be used by angular to fetch the logged in user's
//details (email, fullname) and serves as a check to verify if the held token is valid.
router.post('/whoami', privateApi, function(req, res) {
  //if the token was valid a userId property is attached to the request
  users.getInfoById(req.userId)
    .then(function(userInfo){
      res.json(userInfo);
    })
    .catch(function(){
      //user no longer exists in the database
      res.send(403);
    });
});

module.exports = router;
