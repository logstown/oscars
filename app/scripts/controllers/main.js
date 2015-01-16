'use strict';

/**
 * @ngdoc function
 * @name oscarsApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the oscarsApp
 */
angular.module('oscarsApp')
    .controller('MainCtrl', function($scope, $firebase, Auth) {
        $scope.awesomeThings = [
            'HTML5 Boilerplate',
            'AngularJS',
            'Karma'
        ];

        $scope.auth = Auth;
        $scope.user = $scope.auth.$getAuth();
        console.log($scope.user)

        $scope.picks = []

        var ref = new Firebase("https://oscars.firebaseio.com/awards");
        // create an AngularFire reference to the data
        var sync = $firebase(ref);
        // download the data into a local object
        $scope.awards = sync.$asArray();

        console.log($scope.awards)

        $scope.getInfo = function() {
            console.log($scope.picks[4])
        }
    });