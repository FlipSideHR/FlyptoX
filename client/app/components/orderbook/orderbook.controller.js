(function(){
  var app = angular.module('FlyptoX.orderbook', []);

  app.controller('OrderbookCtrl', ['$scope', '$http', 'AuthService',
    function($scope, $http, AuthService) {
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
        $http({
          method:'GET',
          url: '/api/v1/accounts'
        })
        .success(function(data) {
          $http({
            method: 'GET',
            url: '/api/v1/accounts/' + data[0].id
          })
          .success(function(data, status, headers, config, statusText){
            $scope.balances['usd'] = data.balance;
            $scope.balances['usd-available'] = data.available;
          })
          .error(function(data, status, headers, config, statusText){

          });

          $http({
            method: 'GET',
            url: '/api/v1/accounts/' + data[1].id
          })
          .success(function(data, status, headers, config, statusText){
            $scope.balances['btc'] = data.balance;
            $scope.balances['btc-available'] = data.available;
          })
          .error(function(data, status, headers, config, statusText){

          });
        })
        .error(function(data) {

        });
      };

      $scope.cancelOrder = function(index) {
        // Cancel the order at index of $scope.myOrders:
        // Post a delete call to the API for that order by using its id
        // Refresh the list of 'my orders'...it should not be there anymore

        var orderId = $scope.myOrders[index].id;

        $http({
          method: 'DELETE',
          url: '/api/v1/orders/' + orderId
        })
        .success(function(data, status, headers, config, statusText){
          $scope.getOrders();
          $scope.getBook();
        })
        .error(function(data, status, headers, config, statusText){

        });
      };

      $scope.getBook = function () {
        $http({
          method: 'GET',
          url: '/api/v1/products/1/book/?level=2'
          })
        .success(function(data, status, headers, config, statusText){
          $scope.asks = data.asks.reverse();
          $scope.bids = data.bids.reverse();
        })
        .error(function(data, status, headers, config, statusText) {

        });
      };

      $scope.getOrders = function() {
        $http({
          method: 'GET',
          url: '/api/v1/orders'
        })
        .success(function(data, status, headers, config, statusText){
          $scope.myOrders = data;
        })
        .error(function(data, status, headers, config, statusText) {

        });
      };

      $scope.getOrderBook = function(id) {
        $http({
          method: 'GET',
          url: '/api/v1/products/1/book?level=' + id
        })
        .success(function(data, status, headers, config, statusText){
          $scope.orderbook = data;
        })
        .error(function(data, status, headers, config, statusText) {

        });
      };

      $scope.placeOrder = function() {
        $http({
          method: 'POST',
          url: '/api/v1/orders',
          data: $scope.orderData
        })
        .success(function(data, status, headers, config, statusText) {
          console.log(data, status, statusText);
          $scope.getBook();
          $scope.getOrders();
          $scope.getBalance();
          console.log('Success');
        })
        .error(function(data, status, headers, config, statusText) {
          console.log('Error');
        });

      };

      socket.on('order:new', function(orderData) {
        console.log('Server says there is a new order. Add it!');
        $scope.getBook();
      });

      socket.on('trade', function(order) {
        console.log('Trade occurred!');
        $scope.getBook();
        $scope.getOrders();
      });

    }]); // app controller
})(); // anonymous function
