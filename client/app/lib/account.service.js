// angular.module('FlyptoX').factory('AccountsService',
//   ['$interval', function($interval){
//     var authedClient = {};

//     var fetchOrders = function(callback){
//       var ordersList = [];
//       var ordersMap = {};
//       authedClient.getOrders({}, function(err, res, data) {
//         // overwrite the wallet array with this dat
//         ordersList = data;

//         // populate an object by trade id
//         for (var order in data){
//           ordersMap[order.id] = order;
//         }

//         if (callback) {
//           callback({list: ordersList, map: ordersMap});
//         }
//       });
//     };

//     // usd, gbp, eur, btc - each wallet contains data about itself
//     // updates an accounts currency wallet info
//     var fetchWallets = function(callback){

//       var wallets = {};

//       // getAccounts returns an array of 'wallets' for each currency
//       authedClient.getAccounts(function(err, res, data){
//         // TODO: error handling
//         if (err){
//           console.error(err);
//           return;
//         }
//         // iterate through the array(each element is a 'wallet' object)
//         data.forEach(function(wallet, index, array){

//           // create the wallet if it doesnt exist yet
//           if (!wallets[wallet.currency]){
//             wallets[wallet.currency] = {};
//           }

//           // copy returned data into our local wallet data
//           for (var key in wallet){
//             if(wallet.hasOwnProperty(key)){
//               wallets[wallet.currency][key] = wallet[key];
//             }
//           }
//         });

//         if (callback){
//          callback(wallets);
//         }

//       });
//     };

//     var sell = function(price, size){
//       console.log(price, size);
//       var sellParams = {
//         'price': price, // USD
//         'size': size,  // BTC
//         'product_id': 'BTC-USD',
//       };
//       authedClient.sell(sellParams, function(err, res, data){
//            // sell order result:
//            // {id, price, size, product_id, side, stp}
//         console.log('Recieved: ',  err, data, ' as sell response');
//       });
//     };

//     // sends a buy order at a price
//     var buy = function(price, size) {
//       console.log(price, size);
//       var buyParams = {
//         'price': price, // USD
//         'size': size,  // BTC
//         'product_id': 'BTC-USD',
//       };
//       console.log(buyParams);
//       authedClient.buy(buyParams, function(err, res, data){
//         console.log('Recieved: ', err, data, ' as buy response');
//       });
//     };

//     var cancel = function(id, callback){
//      authedClient.cancelOrder(id, function(err, res, data){
//        if (err){
//          console.error(err);
//        }
//        callback(data);
//      });
//     };

//     // construct our return object
//     return {
//       fetchWallets: fetchWallets,
//       fetchOrders: fetchOrders,
//       buy: buy,
//       sell: sell,
//       cancel: cancel
//     };
//   }]);
