(function(){
  var app = angular.module('FlyptoX.orderbook', []);

  app.controller('OrderbookCtrl', ['$scope', '$http',
    function($scope, $http) {
      $scope.pairs = [{label: 'BTC-USD', value: 1}];
      $scope.types = ['limit', 'market'];
      $scope.sides = ['buy', 'sell'];

      $scope.orderData = {
        currency_pair_id: $scope.pairs[0].value,
        type: $scope.types[0],
        side: $scope.sides[0],
        price: 0,
        size: 0
      };

      $scope.orders = [];

      $scope.getBook = function () {
        $http({
          method: 'GET',
          url: '/api/v1/products/1/book/?level=2'
          })
        .success(function(data, status, headers, config, statusText){
          $scope.data = data;
          $scope.asks = [];
          $scope.bids = [];
          console.log(data);
          for (var i =0; i < data.length; i++){
              console.log("indiv", data[i]);
              if (data[i].side === 'buy'){             
                $scope.bids[i] = data[i];
                console.log("does this work", $scope.bids[i]);
                console.log("size", $scope.bids[i].size);
                console.log("price", $scope.bids[i].price);
            }
            if (data[i].side === 'sell'){
              $scope.asks[i] = data[i];
              console.log("does this work", $scope.asks[i]);
              console.log("size", $scope.asks[i].size);
              console.log("price", $scope.asks[i].price);
            }
          } 
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
          $scope.orders = data;     
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
          // data – {string|Object} – The response body transformed with the transform functions.
          // status – {number} – HTTP status code of the response.
          // headers – {function([headerName])} – Header getter function.
          // config – {Object} – The configuration object that was used to generate the request.
          // statusText – {string} – HTTP status text of the response.
          console.log(data, status, statusText);
          $scope.getBook();
          console.log('Success');
        })
        .error(function(data, status, headers, config, statusText) {
          console.log('Error');
        });

      };

      socket.on('order:new', function(orderData) {
        $scope.orders.push(orderData);
      });

      socket.on('order:cancelled', function(orderData) {
        for (var i = 0; i < $scope.orders.length; i++) {
          if ($scope.orders[i].id === orderData.id) {
            $scope.orders.splice(i, 1);
            break;
          }
        }
      });

    }]);
})();
