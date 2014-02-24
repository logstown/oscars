'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
   .controller('HomeCtrl', ['$scope', 'syncData', function($scope, syncData) {
      syncData('syncedValue').$bind($scope, 'syncedValue');
   }])

  .controller('ChatCtrl', ['$scope', 'syncData', function($scope, syncData) {
      $scope.newMessage = null;

      // constrain number of messages by limit into syncData
      // add the array into $scope.messages
      $scope.messages = syncData('messages', 10);

      // add new messages to the list
      $scope.addMessage = function() {
         if( $scope.newMessage ) {
            $scope.messages.$add({text: $scope.newMessage});
            $scope.newMessage = null;
         }
      };
   }])

  .controller('OscarsCtrl', ['$scope', 'syncData', '$firebase', '$filter', '$timeout', function($scope, syncData, $firebase, $filter, $timeout) {
      // syncData(['users', $scope.auth.user.uid]).$bind($scope, 'user');
      // syncData('awards').$bind($scope, 'awards');

      var ref = new Firebase('https://oscars.firebaseio.com/users/' + $scope.auth.user.uid)
      var user = $firebase(ref)
      user.$bind($scope, "user").then(function() {
         $scope.progress = function() {
            var length = Object.keys($scope.user.picks).length - 1;
            var type;

            if(length < 8) {
               type = 'danger'
            }
            else if(length < 16) {
               type = 'warning'
            }
            else if(length < 24) {
               type = 'info'
            }
            else {
               type = 'success'
            }

            $scope.type = type;
            return length;
         }
      });

      var userRef = new Firebase('https://oscars.firebaseio.com/users')
      var awardsRef = new Firebase('https://oscars.firebaseio.com/awards')
      $scope.usersd = $firebase(userRef);
      $scope.awards = $firebase(awardsRef)

      // $scope.$watch('user', function() {
      //    console.log('here')
      //    $scope.$apply(function() {
      //       $scope.test = Object.keys($scope.user).length;
      //    })
      // })

      $scope.time = new Date();
      $scope.oscarStart = new Date(2014, 2, 2, 19)
    
      $scope.$watch('time', function(){
        $timeout(function(){
            $scope.time = new Date();
        },1000);
      });

      $scope.initialized = false;

      function getUserScores() {
         var awardsKeys = $scope.awards.$getIndex(); 
         var userKeys = $scope.usersd.$getIndex();

         var userScores = []

         angular.forEach(userKeys, function(key) {
            var user = $scope.usersd[key]

            var score = 0;

            angular.forEach(awardsKeys, function(key) {
               var award = $scope.awards[key];
               if(award.winner === user.picks[key])
                  score += award.points;
            });

            userScores.push({info: user.info, pic: user.icon, score: score})
         })

         userScores.sort(function(a,b) {
            return d3.descending(a.score, b.score)
         })

         $scope.userScores = userScores

      }

      $scope.usersd.$on("loaded", function() {

         $scope.awards.$on("loaded", function() {
            getUserScores();

            $scope.awards.$on("change", function() {
               getUserScores();
            })
         })
      });




  }])

.controller('PicksCtrl', ['$scope', '$firebase', '$routeParams', '$location', function($scope, $firebase, $routeParams, $location) {
      var index = 'facebook:' + $routeParams.id;

      var ref = new Firebase('https://oscars.firebaseio.com/users/' + index)
      var user = $firebase(ref)
      var awardsRef = new Firebase('https://oscars.firebaseio.com/awards')
      $scope.awards = $firebase(awardsRef)

      user.$bind($scope, "user");

      $scope.goBack = function() {
         $location.path('/')
      }

   }])

   .controller('LoginCtrl', ['$scope', '$location', 'firebaseRef', '$http', function($scope, $location, firebaseRef, $http) {
      // $scope.email = null;
      // $scope.pass = null;
      // $scope.confirm = null;
      // $scope.createMode = false;

      $scope.logitin = function() {
         $scope.auth.$login('facebook').then(function(user) {

            var usersRef = firebaseRef('users');

            usersRef.child($scope.auth.user.uid).once('value', function(snapshot) {
               if(snapshot.val() === null) {
                  $http.get('http://graph.facebook.com/' + $scope.auth.user.id, {params: {fields: 'picture'}}).then(function(result) {
                     firebaseRef('users/' + $scope.auth.user.uid).set({info: $scope.auth.user, picks: {setit: 'now'}, icon: result.data.picture.data.url})
                  });
               }
               else {
                  console.log('exists')
               }
            });
         })
      }

      // $scope.login = function(cb) {
      //    $scope.err = null;
      //    if( !$scope.email ) {
      //       $scope.err = 'Please enter an email address';
      //    }
      //    else if( !$scope.pass ) {
      //       $scope.err = 'Please enter a password';
      //    }
      //    else {
      //       loginService.login($scope.email, $scope.pass, function(err, user) {
      //          $scope.err = err? err + '' : null;
      //          if( !err ) {
      //             cb && cb(user);
      //          }
      //       });
      //    }
      // };

      // $scope.createAccount = function() {
      //    $scope.err = null;
      //    if( assertValidLoginAttempt() ) {
      //       loginService.createAccount($scope.email, $scope.pass, function(err, user) {
      //          if( err ) {
      //             $scope.err = err? err + '' : null;
      //          }
      //          else {
      //             // must be logged in before I can write to my profile
      //             $scope.login(function() {
      //                loginService.createProfile(user.uid, user.email);
      //                firebaseRef('users/'+user.uid+'/picks').set({});

      //                $location.path('/account');
      //             });
      //          }
      //       });
      //    }
      // };

      // function assertValidLoginAttempt() {
      //    if( !$scope.email ) {
      //       $scope.err = 'Please enter an email address';
      //    }
      //    else if( !$scope.pass ) {
      //       $scope.err = 'Please enter a password';
      //    }
      //    else if( $scope.pass !== $scope.confirm ) {
      //       $scope.err = 'Passwords do not match';
      //    }
      //    return !$scope.err;
      // }
   }])

   .controller('AccountCtrl', ['$scope', 'loginService', 'syncData', '$location', function($scope, loginService, syncData, $location) {
      syncData(['users', $scope.auth.user.uid]).$bind($scope, 'user');

      console.log($scope.auth.user)

      $scope.logout = function() {
         loginService.logout();
      };

      $scope.oldpass = null;
      $scope.newpass = null;
      $scope.confirm = null;

      $scope.reset = function() {
         $scope.err = null;
         $scope.msg = null;
      };

      $scope.updatePassword = function() {
         $scope.reset();
         loginService.changePassword(buildPwdParms());
      };

      function buildPwdParms() {
         return {
            email: $scope.auth.user.email,
            oldpass: $scope.oldpass,
            newpass: $scope.newpass,
            confirm: $scope.confirm,
            callback: function(err) {
               if( err ) {
                  $scope.err = err;
               }
               else {
                  $scope.oldpass = null;
                  $scope.newpass = null;
                  $scope.confirm = null;
                  $scope.msg = 'Password updated!';
               }
            }
         }
      }

   }]);