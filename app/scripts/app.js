'use strict';

/**
 * @ngdoc overview
 * @name oscarsApp
 * @description
 * # oscarsApp
 *
 * Main module of the application.
 */
angular
    .module('oscarsApp', [
        'ngAnimate',
        'ngMessages',
        'ngRoute',
        'ngTouch',
        'firebase',
        'mgcrea.ngStrap',
        'mgcrea.ngStrap.helpers.dimensions',
        'duScroll',
        'timer'
    ])
    .config(function($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/main.html',
                controller: 'MainCtrl',
                resolve: {
                    // controller will not be loaded until $requireAuth resolves
                    // Auth refers to our $firebaseAuth wrapper in the example above
                    "currentAuth": ["Auth", function(Auth) {
                        // $requireAuth returns a promise so the resolve waits for it to complete
                        // If the promise is rejected, it will throw a $stateChangeError (see above)
                        return Auth.$requireAuth();
                    }]
                }
            })
            .when('/about', {
                templateUrl: 'views/about.html',
                controller: 'AboutCtrl'
            })
            .when('/login', {
                templateUrl: 'views/login.html',
                controller: 'LoginCtrl',
                resolve: {
                    // controller will not be loaded until $waitForAuth resolves
                    // Auth refers to our $firebaseAuth wrapper in the example above
                    "currentAuth": ["Auth", function(Auth) {
                        // $waitForAuth returns a promise so the resolve waits for it to complete
                        return Auth.$waitForAuth();
                    }]
                }
            })
            .otherwise({
                redirectTo: '/'
            });
    })
    .run(function($rootScope, $location, Auth) {
        $rootScope.url = 'https://oscars.firebaseio.com/'
        $rootScope.$on("$routeChangeError", function(event, next, previous, error) {
            // We can catch the error thrown when the $requireAuth promise is rejected
            // and redirect the user back to the home page
            if (error === "AUTH_REQUIRED") {
                $location.path("/login");
            }
        });

        $rootScope.auth = Auth;
        $rootScope.auth.$onAuth(function(authData) {
            if (authData) {
                console.log("Logged in as:", authData.uid);
                $location.path('/')
            } else {
                console.log("Logged out");
                $location.path('/login')
            }
        });
    });
