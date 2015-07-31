(function(){
  var app = angular.module('FlyptoX.orderbook', []);

  app.controller('OrderbookCtrl', ['$scope', '$http', 'AuthService', 'APIService',
    function($scope, $http, AuthService, APIService) {
      $scope.pairs = [{label: 'BTC-USD', value: 1}];
      $scope.types = ['limit', 'market'];
      $scope.sides = ['buy', 'sell'];
      $scope.auth = AuthService;

      $scope.orderData = {
        currency_pair_id: $scope.pairs[0].value,
        type: $scope.types[0],
        side: $scope.sides[0],
        price: 0,
        size: 0
      };

      $scope.myOrders = [];

      $scope.balances = {
        'usd': 0,
        'usd-available': 0,
        'btc': 0,
        'btc-available': 0
      };

      $scope.getBalance = function() {
        //  return {
        //    id: account.id,
        //    currency: account.related('currency').get('currency'),
        //    balance: balances[0],
        //    available: balances[1]
        //  };
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
      };

      $scope.getBook = function () {
        APIService.get('products/1/book/?level=2', function(data) {
          $scope.asks = data.asks.reverse();
          $scope.bids = data.bids.reverse();
        });
      };

      $scope.getOrders = function() {
        APIService.get('orders', function(data) {
          $scope.myOrders = data;
        });
      };

      $scope.getOrderBook = function(id) {
        // Assumes the only product is 'BTC-USD', as shown by the /1 parameter
        APIService.get('products/1/book?level=' + id, function(data) {
          $scope.orderbook = data;
        });
      };

      $scope.placeOrder = function() {
        APIService.post('orders', $scope.orderData, function(data) {
          $scope.getBook();
          $scope.getOrders();
          $scope.getBalance();
        });
      };

      $scope.cancelOrder = function(index) {
        // Cancel the order at index of $scope.myOrders:
        // Post a delete call to the API for that order by using its id
        // Refresh the list of 'my orders'...it should not be there anymore
        var orderId = $scope.myOrders[index].id;

        APIService.delete('orders/' + orderId, function(data) {
          $scope.getOrders();
          $scope.getBook();
        });
      };

      socket.on('order:new', function(orderData) {
        console.log('Server says there is a new order. Add it!');
        $scope.getBook();
      });

      socket.on('trade', function(trade) {
        $scope.getBook();
        $scope.getOrders();
      });

    }]); // app controller
})(); // anonymous function
