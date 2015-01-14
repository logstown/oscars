'use strict';

/**
 * @ngdoc function
 * @name oscarsApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the oscarsApp
 */
angular.module('oscarsApp')
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
