'use strict';

/**
 * @ngdoc service
 * @name oscarsApp.Auth
 * @description
 * # Auth
 * Factory in the oscarsApp.
 */
angular.module('oscarsApp')
    .factory('Auth', function($firebaseAuth) {
        var ref = new Firebase("https://oscars.firebaseio.com/")
        return $firebaseAuth(ref)
    });