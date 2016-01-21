'use strict';

/**
 * @ngdoc service
 * @name oscarsApp.user
 * @description
 * # user
 * Factory in the oscarsApp.
 */
angular.module('oscarsApp')
	.factory('User', function($rootScope, $firebaseObject) {
		return function(id) {
			// create a reference to the users profile
			var ref = new Firebase($rootScope.url + "users/").child(id);
			// return it as a synchronized object
			return $firebaseObject(ref);
		}
	});
