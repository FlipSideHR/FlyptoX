var express = require('express');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var router = module.exports = express.Router();
var uuid = require("node-uuid");

router.use(partials());
// Parse JSON (uniform resource locators)
router.use(bodyParser.json());
// Parse forms (signup/login)
router.use(bodyParser.urlencoded({ extended: true }));

//middleware to restrict access to api to authenticated users
var privateApi = require("../controllers/tokens").decodeToken;
var bookshelf = require("../utils/bookshelf");
var Account = bookshelf.model('Account');
var Currency = bookshelf.model('Currency');
var CurrencyPair = bookshelf.model('CurrencyPair');
var Order = bookshelf.model('Order');
var Trade = bookshelf.model('Trade');
var Transaction = bookshelf.model('Transaction');
var User = bookshelf.model('User');

var OrderBook = require('../controllers/book');

/*
== Public (products api) ==
GET /products
GET /products/:id/book
GET /products/:id/ticker
GET /products/:id/trades
GET /products/:id/candles (historic prices)
GET /products/:id/stats (24 hour history)
*/

//return an array of currency pairs
//todo - include miniumum size allowed to trade (0.01) ?
router.get("/products", function(req, res){
  CurrencyPair.fetchAll().then(function(pairs){
    res.json(pairs);
  }).catch(function(err){
    console.log(err);
    res.send(500);
  })
});



//return open orders - order statuses could be: open | unsettled | settled
router.get("/products/:id/book", function(req, res){
  //level: req.query.level
  //pair: req.params.id
  OrderBook.level[req.query.level || 2](req.params.id).then(function(book){
    res.json(book);
  })
  .catch(function(err){
    console.log(err);
    res.status(500).json({message:'unable to retrieve orderbook'});
  });
});

/*
should return the latest trade
{
  "trade_id": trade-id,
  "price": "301.00",
  "size": "1.50000000",
  "time": "2015-05-05T23:17:30.310036Z"
}
*/
router.get("/products/:id/ticker", function(req, res){
  //query trades table for latest trade
  Trade.where({currency_pair_id:req.params.id})
  .query('orderBy', 'created_at', 'desc')
  .fetch({columns:['id','price','size','created_at']})
  .then(function(trade){
    if(!trade){
      res.json({});
    } else {
      res.json({
        trade_id: trade.get('id'),
        price: trade.get('price').toFixed(2),
        size: trade.get('size').toFixed(8),
        time: trade.get('created_at').toISOString()
      });
    }
  })
  .catch(function(err){
    console.log(err);
    res.status(500).json({message:'unable to retrieve ticker'});
  });
});

/*
== Private (orders and trades api) ==
POST /orders
DELETE /orders/:id
GET /orders
GET /orders/:id
GET /trades
*/
router.get("/orders", privateApi, function(req, res){
  res.json([{
        "id": "d50ec984-77a8-460a-b958-66f114b0de9b",
        "size": "3.0",
        "price": "100.23",
        "product_id": "BTC-USD",
        "status": "open",
        "filled_size": "1.23",
        "fill_fees": "0.001",
        "settled": false,
        "side": "buy",
        "created_at": "2014-11-14 06:39:55.189376+00"
    }]);
  return;
  /*
  User.getOpenOrders(req.userId).then(function(orders){
    //orders is a collection of the user's open orders
    //todo - use underscore, turn the collection into the expected format
    res.json(orders);
  })
  .catch(function(){
    res.status(500).json({message:'unable to retrieve orders'});
  });
  */
});

router.get("/orders/:id", privateApi, function(req, res){
  res.json({
    "id": "d50ec984-77a8-460a-b958-66f114b0de9a",
    "size": "2.0",
    "price": "150.23",
    "done_reason": "canceled",
    "status": "done",
    "settled": true,
    "filled_size": "1.3",
    "product_id": "BTC-USD",
    "fill_fees": "0.001",
    "side": "buy",
    "created_at": "2014-11-14 06:39:55.189376+00",
    "done_at": "2014-11-14 06:39:57.605998+00"
  });
  return;
  /*
  User.getOrder(req.userId, req.params.id).then(function(order){
    //orders is bookshelf model
    //todo - use underscore, turn the collection into the expected format
    res.json(order);
  })
  .catch(function(){
    res.status(500).json({message:'unable to retrieve orders'});
  });
  */
});

router.post("/orders", privateApi, function(req, res){
  res.status(201).json({
    order_id: uuid.v1()
  });
  return;
  //OrderBook.placeOrder();
});

router.delete("/orders/:id", privateApi, function(req, res){
  res.send(200);
  return;
  //OrderBook.cancelOrder(req.params.id);
});

router.get("/trades", privateApi, function(req, res){
  res.json([]);
  return;
  //query orders table where maker_id or taker_id is the users's id
  /*
  Trade.getUserTrades(req.userId).then(function(trades){

  })
  .catch(function(){
    res.status(500).json({message:"unable to retrieve list of trades"});
  });
  */
});
/*
== Private (accounts api) ==
GET /accounts
GET /accounts/:id
GET /accounts/:id/ledger
GET /accounts/:id/holds
*/
router.get('/accounts', privateApi, function(req, res){
  Account.forge({user_id:req.userId}).fetchAll().then(function(accounts){
    res.json(accounts);
  });
  /*
  User.getAccounts(req.userId).then(function(accounts){
    res.json(accounts);
  })
  .catch(function(){
    res.status(500).json({message:"unable to retrieve accounts"});
  });
  */
});

router.get('/accounts/:id', privateApi, function(req, res){
  Account.forge({user_id:req.userId, id:req.params.id}).fetch().then(function(account){
    res.json(account);
  });
  /*
  User.getAccount(req.userId, req.params.id).then(function(account){
    res.json(account);
  })
  .catch(function(){
    res.status(500).json({message:"unable to retrieve account"});
  });
  */
});
