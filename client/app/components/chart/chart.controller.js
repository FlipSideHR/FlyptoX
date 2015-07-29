(function(){
var app = angular.module('FlyptoX.chart', ['nvd3']);

app.controller('chartCtrl', ['$scope', '$interval', '$http', function($scope, $interval, $http){
  $scope.options = {
            chart: {
                type: 'sparklinePlus',
                height: 450,
                x: function(d, i){return i;},
                xTickFormat: function(d) {
                    return d3.time.format('%x')(new Date($scope.data[d].x))
                },
                transitionDuration: 250
            }
        };

// time.getTime();
  $scope.priceData = [];

  $scope.getTrades = function () {
        $http({
          method: 'GET',
          url: '/api/v1/products/1/trades'
          })
        .success(function(data, status, headers, config, statusText){
          // console.log("success", data);
          for (var i =0; i < data.length; i++){
            $scope.priceData[i] = {
              y: parseFloat(data[i].price),
              x: Date.parse(data[i].time)
            };
            // console.log("saved data of: ", $scope.priceData[i]);
            // console.log("final data", $scope.priceData);
          }
        })
        .error(function(data, status, headers, config, statusText) {
          console.log("error", data);
        });
      };

  $scope.getTrades();

        //$scope.data = sine();
        $scope.data = volatileChart(130.0, 0.02);
        // console.log("nvd3 data", $scope.data);
        //$scope.data = volatileChart(25.0, 0.09,30);

        /* Random Data Generator (took from nvd3.org) */
        function sine() {
            var sin = [];
            var now =+new Date();

            for (var i = 0; i < 100; i++) {
                sin.push({x: now + i * 1000 * 60 * 60 * 24, y: Math.sin(i/10)});
            }

            return sin;
        }
        function volatileChart(startPrice, volatility, numPoints) {
            var rval =  [];
            var now =+new Date();
            numPoints = numPoints || 100;
            for(var i = 1; i < numPoints; i++) {

                rval.push({x: now + i * 1000 * 60 * 60 * 24, y: startPrice});
                var rnd = Math.random();
                var changePct = 2 * volatility * rnd;
                if ( changePct > volatility) {
                    changePct -= (2*volatility);
                }
                startPrice = startPrice + startPrice * changePct;
            }
            return rval;
        }



  socket.on('trade', function(tradeData) {
        // trade = {
        //   type: 'buy',
        //   price: 286,
        //   size: 1,
        //   maker_id: 'c33767d9-3c1f-4833-91af-863f976f3f4a',
        //   taker_id: 'c33767d9-3c1f-4833-91af-863f976f3f4a',
        //   maker_order_id: 'e0ba9920-34ad-11e5-827e-ab2fa4070236',
        //   taker_order_id: '62061980-34b5-11e5-ab7b-c782cd928800',
        //   currency_pair_id: 1,
        //   updated_at: Mon Jul 27 2015 19:15:34 GMT-0400 (EDT),
        //   created_at: Mon Jul 27 2015 19:15:34 GMT-0400 (EDT),
        //   id: '620c3400-34b5-11e5-ab7b-c782cd928800'
        // }
        $scope.priceData.push({
          y: parseFloat(tradeData.price),
          x: Date.parse(tradeData.time)
        });
      });
  }]);
})();


