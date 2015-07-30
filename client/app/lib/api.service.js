(function() {
  angular.module('FlyptoX.api', [])
    .factory('APIService', ['$http', function($http) {
      return {

        get: function(url, cb) {
          $http({
            method: 'GET',
            url: '/api/v1/' + url
          })
          .success(function(data) {
            if (cb) {
              cb(data);
            }
          })
          .error(function(data) {
            console.log('Error: GET ' + url);
            console.log(data);
          });
        },

        post: function(url, data, cb) {
          $http({
            method: 'POST',
            url: '/api/v1/' + url,
            data: data
          })
          .success(function(data) {
            if (cb) {
              cb(data);
            }
          })
          .error(function(data) {
            console.log('Error: POST ' + url);
            console.log(data);
          });
        },

        delete: function(url, cb) {
          $http({
            method: 'DELETE',
            url: '/api/v1/' + url
          })
          .success(function(data) {
            if (cb) {
              cb(data);
            }
          })
          .error(function(data) {
            console.log('Error: DELETE ' + url);
            console.log(data);
          });
        }
        
      }; // return object

    }]); // .factory
})(); // anonymous function
