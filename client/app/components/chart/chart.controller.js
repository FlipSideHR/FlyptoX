(function(){
var app = angular.module('FlyptoX.chart', []);

app.controller('chartCtrl', ['$scope', '$interval', 
  function($scope, $interval){

    this.barData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      series: [
        [5, 4, 3, 7, 5, 10, 3, 4, 8, 10, 6, 8],
        [3, 2, 9, 5, 4, 6, 4, 6, 7, 8, 7, 4]
      ]
    };

    this.barOptions = {
      seriesBarDistance: 15
    };

    function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min)) + min;
    }

    function pushLimit(arr, elem, limit) {
      arr.push(elem);
      if (arr.length > limit) {
        arr.splice(0, 1);
      }
    }

    var barUpdatePromise = $interval(function() {
      var time = new Date();

      pushLimit(this.barData.labels, [
        time.getHours(),
        time.getMinutes(),
        time.getSeconds()
      ].join(':'), 12);

      this.barData.series.forEach(function(series) {
        pushLimit(series, getRandomInt(0, 10), 12);
      });
    }.bind(this), 1000);

    $scope.$on('$destroy', function() {
      $interval.cancel(barUpdatePromise);
    });
}]);
})();
