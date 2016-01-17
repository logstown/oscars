'use strict';

/**
 * @ngdoc function
 * @name oscarsApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the oscarsApp
 */
angular.module('oscarsApp')
    .controller('LoginCtrl', function($scope, $rootScope, $firebase, $location, $timeout, Auth, currentAuth) {
        if (currentAuth !== null) {
            $location.path('/')
        }

        $scope.login = function() {
            Auth.$authWithOAuthPopup('facebook')
                .then(function(result, error) {
                    var ref = new Firebase($rootScope.url + 'users/' + result.auth.uid);
                    // create an AngularFire reference to the data

                    ref.on("value", function(snapshot) {
                        if (snapshot.val() === null) {
                            var sync = $firebase(ref);

                            // var ref2 = new Firebase($rootScope.url + 'picks/' + result.auth.uid)
                            // var sync2 = $firebase(ref2)
                            // download the data into a (psuedo read-only), sorted array
                            // all server changes are applied in realtime
                            sync.$set(result.facebook.cachedUserProfile)
                                // sync2.$set('')
                        }
                    }, function(errorObject) {
                        console.warn("The read failed: " + errorObject.code);
                    });
                })
        }
    });
