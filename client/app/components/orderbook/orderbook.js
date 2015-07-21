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

      $scope.orders = {};

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
         //  $scope.asks = [];
         //  $scope.bids = [];
         // console.log(data);
         //  for (var i =0; i < data.length; i++){
         //      console.log("indiv", data[i]);
         //      if (data[i].side === 'buy'){             
         //        $scope.bids[i] = data[i];
         //        console.log("does this work", $scope.bids[i]);
         //        console.log("size", $scope.bids[i].size);
         //        console.log("price", $scope.bids[i].price);
         //    }
         //    if (data[i].side === 'sell'){
         //      $scope.asks[i] = data[i];
         //      console.log("does this work", $scope.asks[i]);
         //      console.log("size", $scope.asks[i].size);
         //      console.log("price", $scope.asks[i].price);
         //    }
         //  }       
        // for (var h =1; h < $scope.bids.length; h++){
        //             console.log("this is h", h);
        //             for (var g =1; g < $scope.bids.length; g++){
        //               console.log("this is h", h);
        //               console.log("this is h price", $scope.bids[h].price);
        //               console.log("this is g price", $scope.bids[g].price);
        //                 if ($scope.bids[h].price === $scope.bids[g].price){
        //                     $scope.bids[h].size += $scope.bids[h].size;
        //                     $scope.bids.splice(h, 1);
        //                 }
        //             }
        //         }

        //   for (var j =1; j < $scope.asks.length; j++){
        //       console.log("this is j", j);
        //       for (var l =1; l < $scope.bids.length; l++){
        //         console.log("this is j price", $scope.asks[j].price);
        //         console.log("this is l price", $scope.asks[l].price);
        //           if ($scope.asks[j].price === $scope.asks[l].price){
        //               $scope.asks[j].size += $scope.asks[l].size;
        //               $scope.asks.splice(l, 1);
        //           }
        //       }
        //   } 

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
          console.log('Success');
        })
        .error(function(data, status, headers, config, statusText) {
          console.log('Error');
        });

      };
    }]);
})();
