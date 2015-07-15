var express = require('express');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var router = express.Router();

router.use(partials());
// Parse JSON (uniform resource locators)
router.use(bodyParser.json());
// Parse forms (signup/login)
router.use(bodyParser.urlencoded({ extended: true }));

var users = require("../controllers/users");

//middleware to restrict access to api to authenticated users
var privateApi = require("../controllers/tokens").decodeToken;

/*
todo: add a route for OAuth2 service
  .....

The API router will have to determine which user is issuing the api/call
In the web app:
  An authed user will send their JWT token in HTTP headers (which they get from Login service)

For 3rd-party clients or web apps
  option a. A REST client will use an api key, secret and passphrase to sign their api calls
  option b. OAuth2 tokens (will need to implement OAuth2 service)

Public API Methods

getProducts

getProductOrderBook //differnet levels (limit the size)

getProductTicker

getProductTrades //paged - default latest 100, can ask for additional pages

publicClient.getProductHistoricRates({'granularity': 3000}, callback);

getProduct24HrStats

getCurrencies

getTime


Private API Methods
getAccounts

getAccount(accountID, callback);

getAccountHistory(accountID, {'before': 3000}, callback);
getAccountHolds(accountID, callback);

getAccountHolds(accountID, {'before': 3000}, callback);

// Buy 1 BTC @ 100 USD
var buyParams = {
  'price': '100.00', // USD
  'size': '1',  // BTC
  'product_id': 'BTC-USD',
};

buy(buyParams, callback); //returns and orderId

// Sell 1 BTC @ 110 USD
var sellParams = {
  'price': '110.00', // USD
  'size': '1', // BTC
  'product_id': 'BTC-USD',
};

sell(sellParams, callback); //returns an orderId

cancelOrder(orderID, callback);

getOrders(callback); //paged

getOrder(orderID, callback);

getFills(callback);//paged

getFills({'before': 3000}, callback);//paged

*/
module.exports = router;
