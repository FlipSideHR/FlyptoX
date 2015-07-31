(function() {

  // INITIALIZATION
  //---------------------------------------------------------
  // Dependencies for module 'FlyptoX'
  var dependencies = [
    'ui.router',
    'FlyptoX.api',
    'FlyptoX.auth',
    'FlyptoX.orderbook',
    'FlyptoX.chart',
    'FlyptoX.authService',
    'FlyptoX.account'
  ];

  // Create a new module named 'FlyptoX' using 'dependencies'.
  // This is the main module for the app, and is expected by
  // the ng-app directive in index.html.
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
        .state('landing.account', {
          url: 'account',
          templateUrl: 'app/components/account/account.html',
          controller: 'AccountCtrl as account'
        });
        // .state('dashboard', {
        //   url: '/dashboard',
        //   templateUrl: 'app/app.html'
        //   // this needs a controller
        //   // but right now its a mishmash
        // })

        // (DT) Can probably be deleted
        //------------------------------------------------------------
        // .state('orderbook', {
        //   url: '/orderbook',
        //   templateUrl: 'app/components/orderbook/orderbook.html',
        //   controller: 'OrderbookCtrl as orderbook'
        // })
        // .state('login', {
        //   url: '/login',
        //   templateUrl: 'app/components/login/login.html',
        //   controller: 'AuthController as auth'
        // })
        // .state('signup', {
        //   url: '/signup',
        //   templateUrl: 'app/components/signup/signup.html',
        //   controller: 'AuthController as auth'
        // })
        // .state('chart', {
        //   url: '/chart',
        //   templateUrl: 'app/components/chart/chart.html',
        //   controller: 'chartCtrl'
        // })
        // .state('account', {
        //   url: '/account',
        //   templateUrl: 'app/components/account/account.html',
        //   controller: 'AccountCtrl as account'
        // });
        //-----------------------------------------------------

      $httpProvider.interceptors.push('AttachTokens');
      $httpProvider.interceptors.push('authHttpResponseInterceptor');

      // use the HTML5 History API
      $locationProvider.html5Mode(true);

  }]);



  //---------------------------------------------------------
  // controller for our root level page
  app.controller('LandingController', ['$scope', '$state', '$http',
                                       '$timeout', 'AuthService', 'APIService',
    function($scope, $state, $http, $timeout, AuthService, APIService){
      $scope.auth = AuthService;

      APIService.get('products/1/ticker', function(data) {
        $scope.lastTrade = data;
      });

      socket.on('trade', function(tradeData) {
        // Sets the tickType so that the ng-class directive gets activated
        if (tradeData.price > $scope.lastTrade.price) {
          $scope.tickType = 'uptick';
        } else if (tradeData.price < $scope.lastTrade.price) {
          $scope.tickType = 'downtick';
        } else {
          $scope.tickType = 'equaltick';
        }

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
          //only attach token to api calls to same origin
          if(object.url.toLowerCase().indexOf('/api/') === 0) {
            var jwt = $window.sessionStorage.getItem('com.flyptox');
            if (jwt) {
              object.headers['x-access-token'] = jwt;
            }
            object.headers['Allow-Control-Allow-Origin'] = '*';
          }
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
