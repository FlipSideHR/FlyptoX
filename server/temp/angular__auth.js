/*
  This will be the code required on client side to make use of the authentication
  service.
*/
angular.module('FlyptoX', [])
  .config(function ($httpProvider) {
    //add http interceptor
    $httpProvider.interceptors.push('AttachTokens');
  })

  .factory('AttachTokens', function ($window) {
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
  })

  .factory('Auth', function ($http, $location, $window) {
    // This service responsible for authenticating our user
    // by exchanging the user's email and password
    // for a JWT from the server
    // that JWT is then stored in localStorage as 'com.flyptox'
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
  })

  .controller('AuthController', function ($scope, $window, $location, Auth) {
    $scope.user = {};

    $scope.signin = function () {
      Auth.signin($scope.user)
        .then(function (token) {
          $window.localStorage.setItem('com.flyptox', token);
          //redirect user after successful login
          $location.path('/');
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
          $location.path('/');
        })
        .catch(function (error) {
          console.error(error);
        });
    };

    $scope.signout = function() {
      Auth.signout();
      //redirect after logout
      $location.path('/');
    };

  });
