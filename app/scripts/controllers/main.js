'use strict';

/**
 * @ngdoc function
 * @name oscarsApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the oscarsApp
 */
angular.module('oscarsApp')
    .controller('MainCtrl', function($scope, $rootScope, $firebase, $location, $timeout, $modal, Auth, User) {

        function getUserScores() {
            $scope.winner = _.every($scope.awards, function(award) {
                return _.has(award, 'winner')
            })

            last.on('value', function(snapshot) {

                var lastAward = snapshot.val().last;

                $scope.userScores = _.chain($scope.users)
                    .map(function(user) {

                        var score = _.reduce($scope.awards, function(score, award, key) {
                            if (award.winner !== undefined && award.winner == user.picks[key]) {
                                score += award.points;
                            }
                            return score;
                        }, 0)

                        var lastCorrect = lastAward !== '' && user.picks[lastAward] == $scope.awards[lastAward].winner

                        return {
                            id: user.id,
                            name: user.name,
                            score: score,
                            lastCorrect: lastCorrect
                        }

                    })
                    .sort(function(a, b) {
                        return d3.descending(a.score, b.score)
                    })
                    .value()

                $scope.$apply();
            })

        }

        function addPicks() {
            angular.forEach($scope.awards, function(award, aI) {
                angular.forEach($scope.users, function(user, uI) {
                    var userPick = user.picks[aI]

                    if (userPick === undefined) {
                        return;
                    }

                    if (award.nominees[userPick].users === undefined) {
                        award.nominees[userPick].users = [];
                    }
                    award.nominees[userPick].users.push(uI)
                })
            })
        }

        function getFanboy() {
            var winningCounts = _.map($scope.users, function(user) {
                console.log(user)

                if (user.picks === undefined) {
                    return {
                        user: 'facebook:' + user.id,
                        movie: 'boo',
                        count: 0
                    }
                }
                var counts = _.countBy(user.picks, function(nomI, awardI) {
                    if (nomI === undefined) {
                        return 'stupid'
                    }
                    return $scope.awards[awardI].nominees[nomI].film
                })

                var max = _.max(counts)
                var movie = _.findKey(counts, function(count) {
                    return count === max
                })

                return {
                    user: 'facebook:' + user.id,
                    movie: movie,
                    count: max
                }
            })

            console.log(winningCounts)

            return _.max(winningCounts, 'count')
        }

        function getPeoplePerson() {
            var peopleCounts = _.map($scope.users, function(user) {

                if (user.picks === undefined) {
                    return {
                        user: 'facebook:' + user.id,
                        count: 0
                    }
                }

                var count = _.reduce(user.picks, function(result, nomI, awardI) {
                    if (nomI !== undefined && $scope.awards[awardI].nominees[nomI].nominee !== '' && $scope.awards[awardI].winner == nomI) {
                        result += 1;
                    }
                    return result;
                }, 0)

                return {
                    user: 'facebook:' + user.id,
                    count: count
                }
            })

            console.log(peopleCounts)

            return _.max(peopleCounts, 'count')
        }

        function getSuperlatives() {
            var superlatives = [{
                name: 'Fanboy',
                description: 'Chose the same movie most frequently as the winner.',
                winner: getFanboy()
            }, {
                name: 'People Person',
                description: 'Chose the most winners amongst awards given to people',
                winner: getPeoplePerson()
            }]
        }

        function afterStart() {
            var usersRef = new Firebase($rootScope.url + "users");
            var usersSync = $firebase(usersRef);
            $scope.users = usersSync.$asArray();

            $scope.users.$loaded().then(function() {
                $scope.user = _.find($scope.users, {
                    id: user.facebook.id
                })

                $scope.awards.$loaded().then(function() {
                    getSuperlatives()

                    // addPicks()
                    // getUserScores()

                    // $scope.awards.$watch(function(thing) {

                    //     last.set({
                    //         last: thing.key
                    //     })

                    //     getUserScores();

                    //     if ($scope.winner) {
                    //             $scope.endingModal = $modal({
                    //             title: 'We have a winner!',
                    //             contentTemplate: 'views/ending-modal.html',
                    //             show: true,
                    //             animation: 'am-fade-and-scale'
                    //         });
                    //     }
                    // })
                })
            })
        }

        var ref = new Firebase($rootScope.url + 'awards');

        // create an AngularFire reference to the dataf
        var sync = $firebase(ref);
        // download the data into a local object
        $scope.awards = sync.$asArray();

        var last = new Firebase($rootScope.url + 'last')

        $scope.time = new Date();
        $scope.oscarStart = new Date(2015, 1, 22, 24, -$scope.time.getTimezoneOffset())

        $scope.auth = Auth;
        var user = $scope.auth.$getAuth();


        $scope.dropdown = [{
            "text": "Logout",
            "click": "logout()"
        }];

        if ($scope.time > $scope.oscarStart) {
            var hasNotRun = true;

            User(user.auth.uid).$bindTo($scope, 'user').then(function() {
                $scope.$watch('user', function(newVal, oldVal) {
                    var newVals = _.values(newVal.picks)
                    var oldVals = _.values(oldVal.picks)
                    if (_.every(newVals) && newVals.length === 23 && (!_.every(oldVals) || oldVals.length < 23)) {
                        console.log('done')
                        $modal({
                            title: 'All Done!',
                            content: 'Come back during the Oscars Ceremony to check on your progress.',
                            show: true,
                            animation: 'am-fade-and-scale'
                        });
                    }
                }, true)
            })

            $scope.$watch('time', function() {
                $timeout(function() {
                    $scope.time = new Date();
                    if ($scope.time.getTime() >= $scope.oscarStart.getTime() && hasNotRun) {
                        afterStart()
                        hasNotRun = false
                    }
                }, 1000);
            });


        } else {
            afterStart()
        }

        $scope.logout = function() {
            $scope.auth.$unauth()
        }
    });