"use strict";

angular.module('myApp.routes', ['ngRoute'])

   // configure views; the authRequired parameter is used for specifying pages
   // which should only be available while logged in
   .config(['$routeProvider', function($routeProvider) {
      // $routeProvider.when('/home', {
      //    templateUrl: 'partials/home.html',
      //    controller: 'HomeCtrl'
      // });

      $routeProvider.when('/login', {
         templateUrl: 'partials/login.html',
         controller: 'LoginCtrl'
      });

      $routeProvider.when('/', {
         authRequired: true,
         templateUrl: 'partials/oscars.html',
         controller: 'OscarsCtrl'
      });

      $routeProvider.when('/picks/:id', {
         authRequired: true,
         templateUrl: 'partials/picks.html', 
         controller: 'PicksCtrl'
      });

      $routeProvider.otherwise({redirectTo: '/'});
   }]);