/* exported FlyptoX */
var FlyptoX = angular.module('FlyptoX', []);

FlyptoX.controller('orderbookCtrl', ['$scope', function($scope) {
	$scope.data = {
  		orderSize: 10,
  		price: 50,
  		filled: "yes"
  	};
}]);
