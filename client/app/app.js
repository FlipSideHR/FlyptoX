(function() {

  // INITIALIZATION
  //---------------------------------------------------------
  // Dependencies for module 'FlyptoX'
  var dependencies = [
    'ui.router'
  ];

  // Create a new module named 'FlyptoX' using 'dependencies'.
  // This is the main module for the app, and is expected by
  // the ng-app directive in index.html. Assigned to 'app'
  // for convenience when defining controllers, services, etc.
  var app = angular.module('FlyptoX', dependencies);
  //---------------------------------------------------------

  // ROUTING
  //---------------------------------------------------------
  app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    // For any unmatched URL, redirect to /login
    $urlRouterProvider.otherwise('/signup');

    // Set up states
    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: 'app/components/login/login.html',
        controller: 'LoginCtrl as login'
      })
      .state('signup', {
        url: '/signup',
        templateUrl: 'app/components/signup/signup.html',
        controller: 'AuthController as auth'
      });
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
  app.config(['$httpProvider', function ($httpProvider) {
      //add http interceptor
      $httpProvider.interceptors.push('AttachTokens');
    }]);


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

    .controller('AuthController', ['$scope', '$window', '$location', 'Auth',
      function ($scope, $window, $location, Auth) {
        $scope.user = {};

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

    }]);
  //---------------------------------------------------------

})();
