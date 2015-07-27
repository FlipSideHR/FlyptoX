(function() {

  // INITIALIZATION
  //---------------------------------------------------------
  // Dependencies for module 'FlyptoX'
  var dependencies = [
    'ui.router',
    'angular-chartist',
    'FlyptoX.auth',
    'FlyptoX.orderbook',
    'FlyptoX.chart',
    'FlyptoX.authService',
    'FlyptoX.account'
  ];

  // Create a new module named 'FlyptoX' using 'dependencies'.
  // This is the main module for the app, and is expected by
  // the ng-app directive in index.html. Assigned to 'app'
  // for convenience when defining controllers, services, etc.
  var app = angular.module('FlyptoX', dependencies);

  // ROUTING
  //---------------------------------------------------------
  app.config(['$locationProvider', '$httpProvider', '$stateProvider', '$urlRouterProvider',
    function($locationProvider, $httpProvider, $stateProvider, $urlRouterProvider) {
      // For any unmatched URL, redirect to /login
      $urlRouterProvider.otherwise('/');

      // Set up states
      $stateProvider
        .state('landing', {
          url: '/',
          views: {
            '': {
              templateUrl: 'app/app.html',
              controller: 'LandingController'
            }
          }
        })
        .state('landing.home', {
          url: 'home',
          templateUrl: 'app/landing.html',
          controller: ''
        })
        .state('landing.marketview', {
          url: 'marketview',
          templateUrl: 'app/components/orderbook/orderbook.html',
          controller: 'OrderbookCtrl as orderbook'
        })
        .state('landing.signup', {
          url: 'signup',
          templateUrl: 'app/components/auth/signup.html',
          controller: 'AuthController as auth'
        })
        .state('landing.login', {
          url: 'login',
          templateUrl: 'app/components/auth/login.html',
          controller: 'AuthController as auth'
        })
        // .state('dashboard', {
        //   url: '/dashboard',
        //   templateUrl: 'app/app.html'
        //   // this needs a controller
        //   // but right now its a mishmash
        // })
        .state('orderbook', {
          url: '/orderbook',
          templateUrl: 'app/components/orderbook/orderbook.html',
          controller: 'OrderbookCtrl as orderbook'
        })
        .state('login', {
          url: '/login',
          templateUrl: 'app/components/login/login.html',
          controller: 'AuthController as auth'
        })
        .state('signup', {
          url: '/signup',
          templateUrl: 'app/components/signup/signup.html',
          controller: 'AuthController as auth'
        })
        .state('chart', {
          url: '/chart',
          templateUrl: 'app/components/chart/chart.html',
          controller: 'chartCtrl'
        })
        .state('account', {
          url: '/account',
          templateUrl: 'app/components/account/account.html',
          controller: 'AccountCtrl as account'
        });

      $httpProvider.interceptors.push('AttachTokens');
      $httpProvider.interceptors.push('authHttpResponseInterceptor');

      // use the HTML5 History API
      $locationProvider.html5Mode(true);

  }]);



  //---------------------------------------------------------
  // controller for our root level page
  app.controller('LandingController', ['$scope', '$state', '$http', '$timeout', 'AuthService',
    function($scope, $state, $http, $timeout, AuthService){
      $scope.auth = AuthService;

      $http({
        method: 'GET',
        url: '/api/v1/products/1/ticker'
      })
      .success(function(data, status, headers, config, statusText) {
        // data = {
        //   "id": trade-id,
        //   "price": "301.00",
        //   "size": "1.50000000",
        //   "time": "2015-05-05T23:17:30.310036Z"
        // }
        $scope.lastTrade = data;
      })
      .error(function(data, status, headers, config, statusText) {

      });

      socket.on('trade', function(tradeData) {
        // Sets the tickType so that the ng-class directive gets activated
        // TODO: What should happen when the previous trade price is the same as the most recent trade price?
        $scope.tickType = tradeData.price > $scope.lastTrade.price ? 'uptick' : 'downtick';

        $timeout(function() {
           // Clear the tickType class to reverse the transition
          $scope.tickType = '';
        }, 750); // FYI: Transition duration is currently 0.5s. Check app.scss

        // Store the new trade data
        $scope.lastTrade = tradeData;
      });

      $scope.data = {};
      $state.transitionTo('landing.home');
    }]);


  //---------------------------------------------------------


  // Attach tokens to all outbound requests
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
    }]);

  // listen for 401's and move user to signin page when they happen
  app.factory('authHttpResponseInterceptor',['$q', '$location', function($q, $location){
    return {
      response: function(response){
        if (response.status === 401) {
          console.log("Response 401");
          $location.path('/signin');
        }
        return response || $q.when(response);
      },
      responseError: function(rejection) {
        if (rejection.status === 401) {
          console.log("Response Error 401",rejection);
          $location.path('/signin');
        }
        return $q.reject(rejection);
      }
    }
  }]);

})();
