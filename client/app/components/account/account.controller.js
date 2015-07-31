(function(){
  var app = angular.module('FlyptoX.account', []);

  app.controller('AccountCtrl', ['$scope', '$http', 'APIService',
    function($scope, $http, APIService) {
      $scope.section = 'history';
      $scope.filter = 'orders';
      $scope.columns = {
        'trades': ['currency_pair', 'price', 'size'],
        'orders': ['currency_pair', 'price', 'size', 'side', 'status'],
        'transactions': ['credit', 'debit', 'type']
      };
      $scope.records = {};
      $scope.balances = {};

      $scope.getTrades = function() {
        // [
        //   {
        //     "id": trade-id,
        //     "currency_pair": "BTC-USD",
        //     "price": "10.00",
        //     "size": "0.01",
        //     "order_id": "d50ec984-77a8-460a-b958-66f114b0de9b",
        //     "created_at": "2014-11-07 22:19:28.578544+00",
        //     "liquidity": "T",
        //     "side": "buy"
        //   },
        //    ...
        // ]

        APIService.get('trades', function(data) {
          $scope.records['trades'] = data;
        });
      };

      $scope.getOrders = function() {
        // [
        //  {
        //    "id":"418dac00-34a5-11e5-9537-73b2a3c55ecd",
        //    "size":"13.00000000",
        //    "price":"290.00000000",
        //    "currency_pair":"BTC-USD",
        //    "status":"open",
        //    "side":"sell",
        //    "created_at":"2015-07-27T21:20:07.872Z",
        //    "done_reason":null
        //  },
        //  ...
        // ]

        APIService.get('orders', function(data) {
          $scope.records['orders'] = data;
        });
      };

      $scope.getTransactions = function(currency_id) {
        // [
        //  {
        //   id: account.id,
        //   currency: 'USD'
        //  },
        //  ...
        // ]
        APIService.get('accounts', function(accounts) {
          // [
          //  {
          //   id: transaction.id,
          //   created_at: transaction.get('created_at'),
          //   credit: 
          //   debit: 
          //   type: transaction.get('type'),
          //   order_id: transaction.get('order_id'),
          //   trade_id: transaction.get('trade_id')
          //   //transfer_id: transaction.get('transfer_id'),
          //  }
          // ]
          APIService.get('accounts/' + accounts[currency_id].id + '/ledger', function(data) {
            $scope.records['transactions'] = data;
          });
        });
      };

      // Initialize data
      (function(){
        // Balances
        APIService.get('accounts', function(accounts) {
          APIService.get('accounts/' + accounts[0].id, function(data) {
            $scope.balances['usd'] = data.balance;
            $scope.balances['usd-available'] = data.available;
          });

          APIService.get('accounts/' + accounts[1].id, function(data) {
            $scope.balances['btc'] = data.balance;
            $scope.balances['btc-available'] = data.available;
          });
        });

        // Trades, orders, and transactions
        $scope.getTrades();
        $scope.getOrders();
        $scope.getTransactions(0); // 0 is USD
      })();

    }]); // app.controller
})(); // anonymous function
