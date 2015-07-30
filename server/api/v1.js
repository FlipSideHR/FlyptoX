var express = require('express');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var router = module.exports = express.Router();
var debug = require("debug")("api");
var appEvents = require("../controllers/app-events");
var marketEngine = require('../marketEngine');
var accountManager = require('../marketEngine/accountManager');
var Promise = require('bluebird');

router.use(partials());
// Parse JSON (uniform resource locators)
router.use(bodyParser.json());
// Parse forms (signup/login)
router.use(bodyParser.urlencoded({ extended: true }));

//middleware to restrict access to api to authenticated users
var privateApi = require("../controllers/tokens").decodeToken;

var bookshelf = require("../utils/bookshelf");

var Account = bookshelf.model('Account');
var Trade = bookshelf.model('Trade');
var CurrencyPair = bookshelf.model('CurrencyPair');
var Order = bookshelf.model('Order');

var OrderBook = require('../controllers/book');

/*
-- Market Data --
GET /api/v1/products
GET /api/v1/products/:id/book
GET /api/v1/products/:id/ticker
GET /api/v1/products/:id/trades
GET /api/v1/products/:id/candles (historic prices) -- PENDING
GET /api/v1/products/:id/stats (24 hour history) -- PENDING

-- Order Management --
POST /api/v1/orders
DELETE /api/v1/orders/:id
GET /api/v1/orders
GET /api/v1/orders/:id
GET /api/v1/trades

-- Account Management --
GET /api/v1/accounts
GET /api/v1/accounts/:id
GET /api/v1/accounts/:id/ledger
GET /api/v1/accounts/:id/holds -- PENDING
*/

/*
   ===== Market Data =====
*/

/* sample returned json
[
  {
    "id": 1,
    "currency_pair": "BTC-USD",
    "base_currency": "BTC",
    "quote_currency": "USD",
    "base_min_size": "0.01",
    "base_max_size": "10000.00",
    "quote_increment": "0.01"
  }
]

performs: no side effects
description: return array of currency pairs
endpoint:  GET /api/v1/products
body json: none
query params: none
*/
router.get("/products", function(req, res){
  CurrencyPair.fetchAll({withRelated:['base_currency','quote_currency']}).then(function(pairs){
    return pairs.map(function(pair){
      return {
        id: pair.get('id'),
        currency_pair: pair.get('currency_pair'),
        base_currency: pair.related('base_currency').get('currency'),
        quote_currency: pair.related('quote_currency').get('currency'),
        base_min_size: pair.get('base_min_size').toFixed(8),
        base_max_size: pair.get('base_max_size').toFixed(8),
        quote_increment: pair.get('quote_increment').toFixed(8)
      }
    });
  })
  .then(function(data){
    res.json(data);
  })
  .catch(function(err){
    debug(err);
    res.status(500).json({message:'error getting currency pairs'});
  })
});


/*
performs: no side effects
description: returns object - the order book (see /server/controller/book.js for data format)
endpoint:  GET /api/v1/products/:id/book
:id  currency_pair_id (number)
body json: none
query params: level  (1 || 2 || 3)   (2 is default if not specified)
*/
router.get("/products/:id/book", function(req, res){
  //level: req.query.level
  //pair: req.params.id
  OrderBook.level[req.query.level || 2](req.params.id).then(function(book){
    res.json(book);
  })
  .catch(function(err){
    debug(err);
    res.status(500).json({message:'unable to retrieve orderbook'});
  });
});


/* sample json output
{
  "id": trade-id,
  "price": "301.00",
  "size": "1.50000000",
  "time": "2015-05-05T23:17:30.310036Z"
}

performs: no side effects
description: returns object - the latest trade
endpoint:  GET /api/v1/products/:id/ticker
:id  currency_pair_id (number)
body json: none
query params: none
*/
router.get("/products/:id/ticker", function(req, res){
  //query trades table for latest trade
  Trade.where({currency_pair_id:req.params.id})
  .query('orderBy', 'created_at', 'desc')
  .fetch({columns:['id','price','size','created_at']})
  .then(function(trade){
    if(!trade) return;
    return {
      id: trade.get('id'),
      price: trade.get('price').toFixed(8),
      size: trade.get('size').toFixed(8),
      time: trade.get('created_at').toISOString()
    };
  })
  .then(function(data){
    if(data) {
      res.json(data);
    } else{
      // No trades have happened yet!!
      // send an empty array.
      res.json([]);
      //res.status(404).json({message:'currency pair not found'});
    }
  })
  .catch(function(err){
    debug(err);
    res.status(500).json({message:'unable to retrieve ticker'});
  });
});


/* sample json output
[
  {
    "id": trade-id,
    "price": "301.00",
    "size": "1.50000000",
    "time": "2015-05-05T23:17:30.310036Z",
    "side": "buy"
  },
  {

  }
]

performs: no side effects
description: return array of last 50 trades
endpoint:  GET /api/v1/products/:id/trades
:id  currency_pair_id (number)
body json: none
query params: none
*/
router.get("/products/:id/trades", function(req, res){
  Trade.where({currency_pair_id:req.params.id})
  .query('orderBy', 'created_at', 'desc')
  .query('limit', 500)
  .fetchAll({columns:['id','price','size','created_at']})
  .then(function(trades){
    return trades.map(function(trade){
      return {
        id: trade.get('id'),
        price: trade.get('price').toFixed(8),
        size: trade.get('size').toFixed(8),
        time: trade.get('created_at').toISOString(),
        side: trade.get('side')
      };
    });
  })
  .then(function(data){
    res.json(data.reverse());
  })
  .catch(function(err){
    debug(err);
    res.status(500).json({message:'unable to retrieve trades'});
  });
});


/*
[
    [1415398768, 0.32, 4.2, 0.35, 4.2, 12.3],
    ...
]

description: return an array of candlesitck data for past trades (for charts)
*/
router.get("/products/:id/candles", function(req, res){
  res.json([]);
});


/*
  {
      open: "34.19000000",
      high: "95.70000000",
      low: "7.06000000",
      volume: "2.41000000"
  }
description: returns open, high, low, close, size (calculated over last 24hrs)
*/
router.get("/products/:id/stats", function(req, res){
  res.json({});
});

/*
   ===== Order Management ====
*/

/*
performs: no side effects
description: returns array of open orders
endpoint:  GET /api/v1/orders/
body json: none
query params: none
*/
router.get("/orders", privateApi, function(req, res){
  Order.where({status:'open', user_id:req.userId, type:'limit'})
    .fetchAll({withRelated:['currency_pair']})
    .then(function(orders){
      return orders.map(function(order){
        return order.toJSON();
      });
    })
    .then(function(data){
      res.json(data);
    })
    .catch(function(err){
      debug(err);
      res.status(500).json({message:'unable to retrieve orders'});
    });
});

/*
performs: no side effects
description: returns object - order details
endpoint:  GET /api/v1/orders/:id
:id  order-id (uuid)
body json: none
query params: none
*/
router.get("/orders/:id", privateApi, function(req, res){
  Order.where({status:'open', user_id:req.userId, id:req.params.id})
    .fetch({withRelated:['currency_pair']})
    .then(function(order){
      return order.toJSON();
    })
    .then(function(data){
      if(data) {
        res.json(data);
      } else{
        res.status(404).json({message:'order not found'});
      }
    })
    .catch(function(err){
      debug(err);
      res.status(500).json({message:'unable to retrieve order'});
    });
});

/*
{
  id: order-id
}

performs: places a new order
returns: returns object - with new order id
endpoint:  POST /api/v1/orders/
body json: {
  currency_pair_id: number,
  type: 'market' || 'limit',
  price: number,
  side: 'buy' || 'sell',
  size: number
}
query params: none
*/
router.post("/orders", privateApi, function(req, res){
  var order = {
    user_id: req.userId,
    currency_pair_id: req.body.currency_pair_id,
    type: req.body.type,
    price: parseFloat(req.body.price),
    side: req.body.side,
    size: parseFloat(req.body.size)
  };

  // give the order to our the marketEngines order desk
  marketEngine.placeOrder(order)
    // when order desk resolves,
    // it gives us an order id
    .then(function(order){
      res.status(201).json({
        id: order.id
      });
    })
    // TODO - checkout .error();
    .catch(function(err){
      debug(err);
      // TODO send status based on error
      // return an error that we can use to
      // decide what type of status we want to send
      //if (err.name instanceOf InsufficientFundsError){ // could be done like this with custom errors
      if (err.name){
        // send back the error object which should be shaped like:
        // { name: 'requirementsNotMet',
        //   message: 'Insufficient Funds' }
        //   or
        // { name: 'SystemError',
        //   message: 'Some internal server error' }
        res.json(err);
      } else {
        // this error is not one of ours (doesnt have a name)
        // respond with system error
        res.status(500).json(err);
      }
    });
});

/*
performs: cancels an order
returns:
endpoint:  DELETE /api/v1/orders/:id
:id  order-id (uuid)
body json: none
query params: none
*/
router.delete("/orders/:id", privateApi, function(req, res){
  Order.where({user_id:req.userId, id:req.params.id, status:'open', type:'limit'})
    .fetch({withRelated:'currency_pair'})
    .then(function(order){
      if(order){
        order.set('status', 'done');
        order.set('done_reason', 'cancelled');
        order.set('done_at', new Date());
        return order.save();
      }
    })
    .then(function(order){
      res.send(200);
      if(order){
        appEvents.emit('order:cancelled', order.toJSON());
      }
    })
    .catch(function(err){
      debug(err);
      res.status(500).json({message:'unable to cancel order'});
    });
});

/*
[
  {
      "id": trade-id,
      "currency_pair": "BTC-USD",
      "price": "10.00",
      "size": "0.01",
      "order_id": "d50ec984-77a8-460a-b958-66f114b0de9b",
      "created_at": "2014-11-07 22:19:28.578544+00",
      "liquidity": "T",
      "side": "buy"
  },
]
performs: no side effects
returns: returns array - past trades (fills)
endpoint:  GET /api/v1/trades
body json: none
query params: none
*/
router.get("/trades", privateApi, function(req, res){
  Trade.query( { where: {maker_id: req.userId }, orWhere: {taker_id: req.userId} } )
    .fetchAll({withRelated:['currency_pair']})
    .then(function(trades){
      return trades.map(function(trade){
        return {
          id: trade.id,
          currency_pair: trade.related('currency_pair').get('currency_pair'),
          price: trade.get('price').toFixed(8),
          size: trade.get('size').toFixed(8),
          liquidity: trade.get('maker_id') === req.userId ? "M" : "T",
          order_id: trade.get('maker_id') === req.userId ? trade.get('maker_order_id') : trade.get('taker_order_id'),
          side: trade.get('side'),
          created_at: trade.get('created_at').toISOString()
        };
      });
    })
    .then(function(data){
      res.json(data);
    })
    .catch(function(error){
      console.log(error);
      res.status(500).json({message:"unable to retrieve list of trades"});
    });
});


/*
   ===== Account Information =====
*/

/*
performs: no side effects
returns: returns array - currency accounts
endpoint:  GET /api/v1/accounts
body json: none
query params: none
*/
router.get('/accounts', privateApi, function(req, res){
  Account.where({user_id:req.userId})
  .fetchAll({withRelated:['currency'], columns:['id','currency_id']})
  .then(function(accounts){
    return accounts.map(function(account){
      return {
        id: account.id,
        currency: account.related('currency').get('currency')
      }
    });
  })
  .then(function(data){
    res.json(data);
  })
  .catch(function(err){
    debug(err);
    res.status(500).json({message:"unable to retrieve accounts"});
  });
});

/*
performs: no side effects
returns: returns object - account details
endpoint:  GET /api/v1/accounts/:id
:id  account-id (uuid)
body json: none
query params: none
*/
router.get('/accounts/:id', privateApi, function(req, res){
  Account.where({user_id:req.userId, id:req.params.id})
  .fetch({withRelated:['currency'], columns:['id','currency_id', 'user_id']})
  .then(function(account){
    if(!account) return;
    return Promise.all([
      accountManager.getAccountBalance(account),
      accountManager.getAccountAvailableBalance(account),
    ]).then(function(balances){
      return {
        id: account.id,
        currency: account.related('currency').get('currency'),
        balance: balances[0],
        available: balances[1]
      };
    });
  })
  .then(function(data){
    if(data){
      res.json(data);
    } else {
      res.status(404).json({message:'account not found'});
    }
  })
  .catch(function(err){
    debug(err);
    res.status(500).json({message:"unable to retrieve account"});
  });
});

/*
performs: no side effects
returns: returns array - account transaction history
endpoint:  GET /api/v1/accounts/:id/ledger
body json: none
query params: none
*/
router.get('/accounts/:id/ledger', privateApi, function(req, res){
  Account.where({user_id:req.userId, id:req.params.id})
  .fetch({withRelated:['transactions']})
  .then(function(account){
    if(!account) return;
    return account.related('transactions').map(function(transaction){
      return {
        id: transaction.id,
        created_at: transaction.get('created_at'),
        credit: transaction.get('credit').toFixed(8),
        debit: transaction.get('debit').toFixed(8),
        type: transaction.get('type'),
        order_id: transaction.get('order_id'),
        trade_id: transaction.get('trade_id')
        //transfer_id: transaction.get('transfer_id'),
      }
    });
  })
  .then(function(data){
    if(data){
      res.json(data);
    } else{
      res.status(404).json({message:'account not found'});
    }
  })
  .catch(function(err){
    debug(err);
    res.status(500).json({message:"unable to retrieve account history"});
  });
});


//some helper functions
//might be better to override the toJSON method on the bookshelf model?
//function order.toJSON() {
//  if(!order) return;
//  return {
//    "id": order.id,
//    "size": order.get('size').toFixed(8),
//    "price": order.get('price').toFixed(8),
//    "currency_pair": order.related('currency_pair').get('currency_pair'),
//    "status": order.get('status'),
//    "filled_size": order.get('filled_size') ? order.get('filled_size').toFixed(8) : undefined,
//    "side": order.get('side'),
//    "created_at": order.get('created_at').toISOString(),
//    "done_at": order.get('done_at') ? order.get('done_at').toISOString() : undefined,
//    "done_reason": order.get('done_reason')
//  };
//}
