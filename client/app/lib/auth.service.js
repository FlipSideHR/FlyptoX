(function(){
  angular.module('FlyptoX.authService', []).
  factory('AuthService', ['$http', '$state', '$window', function($http, $state, $window){
    var auth = {};
    // user: {email:string, password:string}
    auth.signin = function (user) {
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
    auth.signup = function (user) {
      return $http({
        method: 'POST',
        url: '/api/auth/signup',
        data: user
      })
      .then(function (resp) {
        return resp.data.token;
      });
    };

    auth.isAuth = function () {
      return !!$window.sessionStorage.getItem('com.flyptox');
    };

    auth.signout = function () {
      $window.sessionStorage.removeItem('com.flyptox');
      $state.go('^.home');
    };

    //var verifyToken = function () {
    //  //TODO
    //};

    //var whoami = function () {
    //  //TODO
    //};


    return auth;
  }]);
})();
