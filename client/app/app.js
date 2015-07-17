// INITIALIZATION
//---------------------------------------------------------
// Dependencies for module 'flyptox'
var dependencies = [
  'ui.router'
];

// Create a new module named 'flyptox' using 'dependencies'.
// This is the main module for the app, and is expected by
// the ng-app directive in index.html. Assigned to 'app'
// for convenience when defining controllers, services, etc.
var app = angular.module('flyptox', dependencies);
//---------------------------------------------------------

// ROUTING
//---------------------------------------------------------
app.config(function($stateProvider, $urlRouterProvider) {
  // For any unmatched URL, redirect to /login
  $urlRouterProvider.otherwise('/login');

  // Set up states
  $stateProvider
    .state('login', {
      url: '/login',
      templateUrl: 'components/login/login.html',
      controller: 'LoginCtrl as login'
    });
});
//---------------------------------------------------------
