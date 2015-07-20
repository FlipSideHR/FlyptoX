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
var Trade = bookshelf.model('Trade');
var CurrencyPair = bookshelf.model('CurrencyPair');

bookshelf.model('Currency');
bookshelf.model('Order');
bookshelf.model('Transaction');
bookshelf.model('User');

var OrderBook = require('../controllers/book');

/*
== Public (products api) ==
GET /products
GET /products/:id/book
GET /products/:id/ticker
GET /products/:id/trades
GET /products/:id/candles (historic prices) -- PENDING
GET /products/:id/stats (24 hour history) -- PENDING
*/

//return an array of currency pairs
/*
[
  {
    "id": "BTC-USD",
    "base_currency": "BTC",
    "quote_currency": "USD",
    "base_min_size": "0.01",
    "base_max_size": "10000.00",
    "quote_increment": "0.01"
  }
]
*/
router.get("/products", function(req, res){
  CurrencyPair.fetchAll({withRelated:['base_currency','quote_currency']}).then(function(pairs){
    res.json(pairs.map(function(pair){
      return {
        id: pair.get('id'),
        currency_pair: pair.get('currency_pair'),
        base_currency: pair.related('base_currency').get('currency'),
        quote_currency: pair.related('quote_currency').get('currency'),
        base_min_size: pair.get('base_min_size').toFixed(8),
        base_max_size: pair.get('base_max_size').toFixed(8),
        quote_increment: pair.get('quote_increment').toFixed(8)
      }
    }));
  }).catch(function(err){
    console.log(err);
    res.send(500);
  })
});



//return open orders - order statuses could be: open | done
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
  "id": trade-id,
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
        id: trade.get('id'),
        price: trade.get('price').toFixed(8),
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

//return array of last 50 trades
/*
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
*/
router.get("/products/:id/trades", function(req, res){
  Trade.where({currency_pair_id:req.params.id})
  .query('orderBy', 'created_at', 'desc')
  .query('limit', 50)
  .fetchAll({columns:['id','price','size','created_at']})
  .then(function(trades){
    res.json(trades.map(function(trade){
      return {
        id: trade.get('id'),
        price: trade.get('price').toFixed(8),
        size: trade.get('size').toFixed(8),
        time: trade.get('created_at').toISOString(),
        side: trade.get('side')
      };
    }));
  })
  .catch(function(err){
    console.log(err);
    res.status(500).json({message:'unable to retrieve trades'});
  });
});

//return an array of candlesitck data for past trades
/*
[
    [1415398768, 0.32, 4.2, 0.35, 4.2, 12.3],
    ...
]
*/
router.get("/products/:id/candles", function(req, res){
  res.json([]);
});

//return open, high, low, close, size (calculated over last 24hrs)
/*
  {
      open: "34.19000000",
      high: "95.70000000",
      low: "7.06000000",
      volume: "2.41000000"
  }
*/
router.get("/products/:id/stats", function(req, res){
  res.json({});
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
  Order.where({status:'open', user_id:req.userId})
    .fetchAll({withRelated:['currency_pair']})
    .then(function(orders){
      return orders.map(function(order){
        return {
          "id": order.id,
          "size": order.get('size').toFixed(8),
          "price": order.get('price').toFixed(8),
          "currency_pair": order.related('currency').get('currency'),
          "status": order.get('status'),
          "filled_size": order.get('filled_size').toFixed(8),
          "side": order.get('side'),
          "created_at": order.get('created_at').toISOString(),
          "done_at": order.get('done_at').toISOString(),
          "done_reason": order.get('done_reason')
        };
      });
    })
    .then(function(data){
      res.json(data);
    })
    .catch(function(){
      res.status(500).json({message:'unable to retrieve orders'});
    });
});

router.get("/orders/:id", privateApi, function(req, res){
  Order.where({status:'open', user_id:req.userId, id:req.params.id})
    .fetch({withRelated:['currency_pair']})
    .then(function(order){
      if(!order) return {};
      return {
        "id": order.id,
        "size": order.get('size').toFixed(8),
        "price": order.get('price').toFixed(8),
        "currency_pair": order.related('currency').get('currency'),
        "status": order.get('status'),
        "filled_size": order.get('filled_size').toFixed(8),
        "side": order.get('side'),
        "created_at": order.get('created_at').toISOString(),
        "done_at": order.get('done_at').toISOString(),
        "done_reason": order.get('done_reason')
      };
    })
    .then(function(data){
      res.json(data);
    })
    .catch(function(err){
      console.log(err);
      res.status(500).json({message:'unable to retrieve order'});
    });
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

/*
[
  {
      "trade_id": trade-id,
      "currency_pair": "BTC-USD",
      "price": "10.00",
      "size": "0.01",
      "order_id": "d50ec984-77a8-460a-b958-66f114b0de9b",
      "created_at": "2014-11-07 22:19:28.578544+00",
      "liquidity": "T",
      "side": "buy"
  },
]
*/
router.get("/trades", privateApi, function(req, res){
  Trade.query({where:{maker_id:req.userId}}, {orWhere:{taker_id:req.userId}})
    .fetchAll({withRelated:['currency_pair']})
    .then(function(trades){
      return trades.map(function(trade){
        return {
          id: trade.id,
          currency_pair: tade.related('currency').get('currency'),
          price: trade.get('price').toFixed(8),
          size: trade.get('size').toFixed(8),
          liquidity: trade.get('maker_id') === req.userId ? "M" : "T",
          order_id: trade.get('maker_id') === req.userId ? trade.get('maker_order_id') : trade.get('taker_order_id'),
          side: trade.get('side'),
          created_at: trade.get('create_at').toISOString()
        };
      });
    })
    .then(function(data){
      res.json(data);
    })
    .catch(function(){
      res.status(500).json({message:"unable to retrieve list of trades"});
    });
});
/*
== Private (accounts api) ==
GET /accounts
GET /accounts/:id
GET /accounts/:id/ledger
GET /accounts/:id/holds
*/
router.get('/accounts', privateApi, function(req, res){
  Account.where({user_id:req.userId})
  .fetchAll({withRelated:['currency'], columns:['id','balance','available','currency_id']})
  .then(function(accounts){
    res.json(accounts.map(function(account){
      return {
        id: account.id,
        balance: account.get('balance'),
        available: account.get('available'),
        currency: account.related('currency').get('currency')
      }
    }));
  })
  .catch(function(err){
    console.log(err);
    res.status(500).json({message:"unable to retrieve accounts"});
  });
});

router.get('/accounts/:id', privateApi, function(req, res){
  Account.where({user_id:req.userId, id:req.params.id})
  .fetch({withRelated:['currency'], columns:['id','balance','available','currency_id']})
  .then(function(account){
    res.json({
      id: account.id,
      balance: account.get('balance'),
      available: account.get('available'),
      currency: account.related('currency').get('currency')
    });
  })
  .catch(function(err){
    console.log(err);
    res.status(500).json({message:"unable to retrieve account"});
  });
});

router.get('/accounts/:id/ledger', privateApi, function(req, res){
  Account.where({user_id:req.userId, id:req.params.id})
  .fetch({withRelated:['transactions']})
  .then(function(account){
    res.json(account.related('transactions').map(function(transaction){
      return {
        id: transaction.id,
        created_at: transaction.get('created_at'),
        amount: transaction.get('amount').toFixed(8),
        balance: transaction.get('balance').toFixed(8),
        type: transaction.get('type'),
        order_id: transaction.get('order_id'),
        trade_id: transaction.get('trade_id')
        //transfer_id: transaction.get('transfer_id'),
      }
    }));
  })
  .catch(function(err){
    console.log(err);
    res.status(500).json({message:"unable to retrieve account history"});
  });
});
