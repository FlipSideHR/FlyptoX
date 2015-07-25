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
      // use the HTML5 History API
      $locationProvider.html5Mode(true);
  }]);



  //---------------------------------------------------------
  // controller for our root level page
  app.controller('LandingController', ['$scope', '$state', '$http', function($scope, $state, $http){
    // {
    //   "id": trade-id,
    //   "price": "301.00",
    //   "size": "1.50000000",
    //   "time": "2015-05-05T23:17:30.310036Z"
    // }

    $http({
      method: 'GET',
      url: '/api/v1/products/1/ticker'
    })
    .success(function(data, status, headers, config, statusText) {
      $scope.lastTrade = data;
    })
    .error(function(data, status, headers, config, statusText) {

    });

    socket.on('trade', function(tradeData) {
      console.log('TradeData:', tradeData);
      $scope.lastTrade = tradeData;
    });

    $scope.data = {};
    $state.transitionTo('landing.home');
  }]);



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

   app.controller('walletCtrl', ['$scope',
      '$interval', '$http', function($scope, $interval, $http, AccountsService){
        console.log("got here");
        var blockApiKey = '6cc7-b07d-b22b-f6d2';
        $scope.showWallet;

       $scope.getAddress = function() {
         console.log("GOT HERE");
         $http({
            method: 'GET',
            url: 'https://block.io/api/v2/get_new_address/?api_key='+blockApiKey})
            .success(function(data) {
              console.log(data);
              console.log("walllet", data.data.address);
              $scope.showWallet = data.data.address;
            })
            .error(function(data, status) {
                console.log(data);
            });
       };

   // $scope.serverCall = function() {
   //      $http({method : 'POST',
   //          url : 'https://api.parse.com/1/classes/formData',
   //          data: $scope.formData,
   //          headers: { 'X-Parse-Application-Id':'SwuUqXIiEBCTe0CZ4MdpHY5ehTgFjstgtyaPlQuY',
   //          'X-Parse-REST-API-Key':'raPMJmJxlZvFhx2xGlqkWIKCS5Unuapy2NAQfmr1'}})
   //          .success(function(data) {
   //              console.log("Working!");
   //          })
   //          .error(function(data, status) {
   //              alert("Error");
   //          });
   //  };


      // Parse.Cloud.httpRequest({
      // url: 'https://block.io/api/v2/get_new_address/?api_key='+blockApiKey,
      // success: function (response) {
      //   var walletData = JSON.parse(response.text);

  }]);

  app.controller('signUpCtrl', ['$scope',
      '$interval', function($scope, $interval, AccountsService){
      $scope.visible = false;
      $scope.toggle = function() {
              $scope.visible = !$scope.visible;
          };
      $scope.authData = {};
  }]);
})();
