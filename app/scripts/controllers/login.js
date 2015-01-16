'use strict';

/**
 * @ngdoc function
 * @name oscarsApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the oscarsApp
 */
angular.module('oscarsApp')
    .controller('LoginCtrl', function($scope, $location, Auth, currentAuth) {
        if (currentAuth !== null) {
            $location.path('/')
        }

        $scope.login = function() {
            Auth.$authWithOAuthPopup('facebook').then(function(result, error) {
                $location.path('/')
            })
        }
    });