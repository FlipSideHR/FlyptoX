(function(){
var app = angular.module('FlyptoX.auth', []);
app.controller('AuthController', ['$scope', '$window', '$location', 'Auth',
  function ($scope, $window, $location, Auth) {
    $scope.user = {};
    $scope.visible = false;
    $scope.authData = {};

    $scope.signin = function () {
      Auth.signin($scope.user)
        .then(function (token) {
          $window.localStorage.setItem('com.flyptox', token);
          //redirect user after successful login
          // $location.path('/'); // TODO: Probably need to use $state.to(...) here
        })
        .catch(function (error) {
          console.error(error);
        });
    };

    $scope.signup = function () {
      Auth.signup($scope.user)
        .then(function (token) {
          $window.localStorage.setItem('com.flyptox', token);
          //redirect user after successful login
          // $location.path('/');
        })
        .catch(function (error) {
          console.error(error);
        });
    };

    $scope.signout = function() {
      Auth.signout();
      //redirect after logout
      // $location.path('/');
    };

    $scope.toggle = function() {
      console.log('Test!');
      $scope.visible = !$scope.visible;
    };

}]);
})();
