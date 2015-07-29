(function(){
  var app = angular.module('FlyptoX.auth', []);
  app.controller('AuthController', ['$scope', '$window', '$state', 'AuthService',
    function ($scope, $window, $state, AuthService) {
      $scope.user = {};
      $scope.visible = false;

      $scope.signin = function () {
        AuthService.signin($scope.user)
          .then(function (token) {
            $window.sessionStorage.setItem('com.flyptox', token);

            $scope.error = ''; // Clear any previous error messages.

            //redirect user after successful login
            $state.go('landing.marketview');
          })
          .catch(function (error) {
            // error is an HTTP response with a 'data' property. Within 'data',
            // the 'message' property describes the reason for the error.
            console.error(error);
            if (error.data.message){
              $scope.error = error.data.message;
            }
          });
      };

      $scope.signup = function () {
        AuthService.signup($scope.user)
          .then(function (token) {
            $window.sessionStorage.setItem('com.flyptox', token);
            $scope.error = ''; // Clear any previous error messages.
            //redirect user after successful login
            $state.go('landing.marketview');
          })
          .catch(function (error) {
            // error is an HTTP response with a 'data' property. Within 'data',
            // the 'message' property describes the reason for the error.
            console.error(error);
            if (error.data.message){
              $scope.error = error.data.message;
            }
          });
      };

      $scope.signout = function() {
        AuthService.signout();
        //redirect after logout
        $state.go('landing.login');
      };

      $scope.toggle = function() {
        console.log('Test!');
        $scope.visible = !$scope.visible;
      };

  }]);
})();
