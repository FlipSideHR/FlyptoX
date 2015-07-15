var express = require('express');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var router = module.exports = express.Router();

router.use(partials());
// Parse JSON (uniform resource locators)
router.use(bodyParser.json());
// Parse forms (signup/login)
router.use(bodyParser.urlencoded({ extended: true }));

var users = require("../controllers/users");

//middleware to restrict access to api to authenticated users
var privateApi = require("../controllers/tokens").decodeToken;

/*
== Public (anonymous) ==
GET /products
GET /products/:id/book
GET /products/:id/ticker
GET /products/:id/trades
GET /products/:id/candles (historic prices)
GET /products/:id/stats (24 hour history)
*/

//return an array of currency pairs
router.get("/products", function(req, res){
  res.json([
    {
      id:0,
      currency_pair:"BTC-USD"
    }
  ]);
});


/*
== Private (authenticated) ==
GET /accounts
GET /accounts/:id
GET /accounts/:id/ledger (history)
GET /accounts/:id/holds
POST /orders
DELETE /orders/:id
GET /orders
GET /orders/:id
GET /trades  (fills)
*/

/*
todo: add a route for OAuth2 service
  .....

The API router will have to determine which user is issuing the api/call
In the web app:
  An authed user will send their JWT token in HTTP headers (which they get from Login service)

For 3rd-party clients or web apps
  option a. A REST client will use an api key, secret and passphrase to sign their api calls
  option b. OAuth2 tokens (will need to implement OAuth2 service)
*/
