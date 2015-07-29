(function(){
  var app = angular.module('FlyptoX.account', []);

  app.controller('AccountCtrl', ['$scope', '$http',
    function($scope, $http) {
      $scope.section = 'history';
      $scope.filter = 'orders';
      $scope.columns = {
        'trades': ['currency_pair', 'price', 'size'],
        'orders': ['currency_pair', 'price', 'size', 'side', 'status'],
        'transactions': ['credit', 'debit', 'type']
      };
      $scope.records = {};

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

        $http({
          method: 'GET',
          url: '/api/v1/trades'
        })
        .success(function(data, status, headers, config, statusText) {
          $scope.records['trades'] = data;
        })
        .error(function(data, status, headers, config, statusText) {

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
        $http({
          method: 'GET',
          url: '/api/v1/orders'
        })
        .success(function(data, status, headers, config, statusText){
          $scope.records['orders'] = data;
        })
        .error(function(data, status, headers, config, statusText) {

        });
      };

      $scope.getTransactions = function() {
        $http({
          method: 'GET',
          url: '/api/v1/accounts'
        })
        .success(function(data){
          // [
          //  {
          //   id: account.id,
          //   currency: 'USD'
          //  },
          //  ...
          // ]
          $http({
            method: 'GET',
            url: '/api/v1/accounts/' + data[0].id + '/ledger'
          })
          .success(function(data, status, headers, config, statusText){
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
            $scope.records['transactions'] = data;
          });
        });
      };

    }]); // app.controller
})(); // anonymous function
