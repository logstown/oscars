'use strict';

/**
 * @ngdoc function
 * @name oscarsApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the oscarsApp
 */
angular.module('oscarsApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
