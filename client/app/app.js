(function() {

  // INITIALIZATION
  //---------------------------------------------------------
  // Dependencies for module 'FlyptoX'
  var dependencies = [
    'ui.router',
    'FlyptoX.auth',
    'FlyptoX.orderbook'
  ];

  // Create a new module named 'FlyptoX' using 'dependencies'.
  // This is the main module for the app, and is expected by
  // the ng-app directive in index.html. Assigned to 'app'
  // for convenience when defining controllers, services, etc.
  var app = angular.module('FlyptoX', dependencies);
  //---------------------------------------------------------

  // ROUTING
  //---------------------------------------------------------
  app.config(['$locationProvider', '$httpProvider', '$stateProvider', '$urlRouterProvider', function($locationProvider, $httpProvider, $stateProvider, $urlRouterProvider) {
    // For any unmatched URL, redirect to /login
    $urlRouterProvider.otherwise('/');

    // Set up states
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'app/app.html'
        // this needs a controller
        // but right now its a mishmash
      });
      $httpProvider.interceptors.push('AttachTokens');
      // use the HTML5 History API
      $locationProvider.html5Mode(true);
  }]);
  //---------------------------------------------------------

  // SIGNUP
  //---------------------------------------------------------
  // app.controller('SignupCtrl', ['$scope', 
  //   function($scope){
  //     $scope.visible = false;
  //     $scope.toggle = function() {
  //         $scope.visible = !$scope.visible;
  //     };
  //     $scope.authData = {};
  // }]);
  //---------------------------------------------------------

  // AUTHENTICATION
  //---------------------------------------------------------

  app.factory('AttachTokens', ['$window', function ($window) {
      // this is an $httpInterceptor
      // its job is to stop all out going request
      // then look in local storage and find the user's token
      // then add it to the header so the server can validate the request
      var attach = {
        request: function (object) {
          var jwt = $window.localStorage.getItem('com.flyptox');
          if (jwt) {
            object.headers['x-access-token'] = jwt;
          }
          object.headers['Allow-Control-Allow-Origin'] = '*';
          return object;
        }
      };
      return attach;
    }])

    .factory('Auth', ['$http', '$location', '$window', function ($http, $location, $window) {
      // This service responsible for authenticating our user
      // by exchanging the user's email and password
      // for a JWT from the server
      // that JWT is then stored in localStorage as 'com.flyptox'

      // user: {email:string, password:string}
      var signin = function (user) {
        return $http({
          method: 'POST',
          url: '/api/auth/signin',
          data: user
        })
        .then(function (resp) {
          return resp.data.token;
        });
      };

      // user: {email:string, password:string}
      var signup = function (user) {
        return $http({
          method: 'POST',
          url: '/api/auth/signup',
          data: user
        })
        .then(function (resp) {
          return resp.data.token;
        });
      };

      var isAuth = function () {
        return !!$window.localStorage.getItem('com.flyptox');
      };

      var signout = function () {
        $window.localStorage.removeItem('com.flyptox');
        $location.path('/');
      };

      var verifyToken = function () {
        //TODO
      };

      var whoami = function () {
        //TODO
      };

      return {
        signin: signin,
        signup: signup,
        isAuth: isAuth,
        signout: signout
      };
    }])

  //---------------------------------------------------------

})();
