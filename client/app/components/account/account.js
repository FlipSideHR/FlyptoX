(function(){
  var app = angular.module('FlyptoX.account', []);

  app.controller('AccountCtrl', ['$scope', '$http',
    function($scope, $http) {
      

      $scope.getTrades = function() {
        // Sample of return data
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
          $scope.trades = data;
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
      // $scope.placeOrder = function() {
      //   $http({
      //     method: 'POST',
      //     url: '/api/v1/orders',
      //     data: $scope.orderData
      //   })
      //   .success(function(data, status, headers, config, statusText) {
      //     // data – {string|Object} – The response body transformed with the transform functions.
      //     // status – {number} – HTTP status code of the response.
      //     // headers – {function([headerName])} – Header getter function.
      //     // config – {Object} – The configuration object that was used to generate the request.
      //     // statusText – {string} – HTTP status text of the response.
      //     console.log(data, status, statusText);
      //     $scope.getBook();
      //     $scope.getOrders();
      //     console.log('Success');
      //   })
      //   .error(function(data, status, headers, config, statusText) {
      //     console.log('Error');
      //   });

      // };

      // socket.on('trade', function(order) {
      //   console.log('Trade occurred!');
      //   $scope.getBook();
      //   $scope.getOrders();
      // });

    }]); // app.controller
})(); // anonymous function
