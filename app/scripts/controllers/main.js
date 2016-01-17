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

        $scope.winner = false;

        function getUserScores() {

            last.on('value', function(snapshot) {
                $scope.winner = _.every($scope.awards, function(award) {
                    return _.has(award, 'winner')
                })

                $scope.lastAward = snapshot.val().last;

                $scope.userScores = _.chain($scope.users)
                    .filter('picks')
                    .map(function(user) {
                        var lastCorrect;
                        var score = _.reduce($scope.awards, function(score, award, key) {
                            if (award.winner !== undefined && award.winner == user.picks[key]) {
                                score += award.points;
                            }
                            return score;
                        }, 0)

                        lastCorrect = $scope.lastAward !== '' && user.picks[$scope.lastAward] == $scope.awards[$scope.lastAward].winner

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

                if ($scope.winner) {
                    getChampions();
                    $scope.getSuperlatives()
                }

            })
        }

        function addPicks() {
            $scope.userDist = angular.copy($scope.awards)
            angular.forEach($scope.userDist, function(award, aI) {
                angular.forEach(_.filter($scope.users, 'picks'), function(user) {
                    var userPick = user.picks[aI]

                    if (userPick === undefined) {
                        return;
                    }

                    if (award.nominees[userPick].users === undefined) {
                        award.nominees[userPick].users = [];
                    }
                    award.nominees[userPick].users.push(user.id)
                })
            })

            console.log($scope.userDist)
        }

        function getFanboys() {
            var winningCounts = _.map(_.filter($scope.users, 'picks'), function(user) {
                var counts = _.countBy(user.picks, function(nomI, awardI) {
                    if (nomI === undefined) {
                        return 'stupid'
                    }
                    return $scope.awards[awardI].nominees[nomI].film
                })

                counts = _.omit(counts, 'stupid');
                var max = _.max(counts)
                var movie = _.findKey(counts, function(count) {
                    return count === max
                })

                return {
                    user: user,
                    movie: movie,
                    count: max
                }
            })

            var top = _.max(winningCounts, 'count').count
            return _.filter(winningCounts, {
                count: top
            })
        }

        function getTechAndPeople() {
            var counts = _.map(_.filter($scope.users, 'picks'), function(user) {

                var peopleCount = _.reduce(user.picks, function(result, nomI, awardI) {
                    if (nomI !== undefined && $scope.awards[awardI].nominees[nomI].nominee !== '' && $scope.awards[awardI].winner == nomI) {
                        result += 1;
                    }
                    return result;
                }, 0)

                var techCount = _.reduce(user.picks, function(result, nomI, awardI) {
                    if (nomI !== undefined && $scope.awards[awardI].type === 'technical' && $scope.awards[awardI].winner == nomI) {
                        result += 1;
                    }
                    return result;
                }, 0)

                return {
                    user: user,
                    peopleCount: peopleCount,
                    techCount: techCount
                }
            })

            var topTechie = _.max(counts, 'techCount').techCount
            var techies = _.filter(counts, {
                techCount: topTechie
            });
            var topPeople = _.max(counts, 'peopleCount').peopleCount
            var peoplePeople = _.filter(counts, {
                peopleCount: topPeople
            });

            return {
                techies: techies,
                peoplePeople: peoplePeople
            }
        }

        function getDarkHorses() {
            var userPoints = {}

            angular.forEach($scope.awards, function(award, aI) {

                var correctUsers = _.filter($scope.users, function(user) {
                    return user.picks && user.picks[aI] !== undefined && user.picks[aI] == award.winner
                })

                angular.forEach(correctUsers, function(user) {
                    if (userPoints[user.id] === undefined) {
                        userPoints[user.id] = {
                            user: user,
                            count: 0
                        };
                    }

                    userPoints[user.id].count += (1 / correctUsers.length)
                })
            })

            console.log(userPoints)

            var top = _.max(userPoints, 'count').count;
            return _.filter(userPoints, {
                count: top
            })
        }

        function getChampions() {
            var topScore = _.max($scope.userScores, 'score').score;
            $scope.champions = _.filter($scope.userScores, {
                score: topScore
            })
        }

        $scope.getSuperlatives = function() {
            var techAndPeople = getTechAndPeople();

            $scope.superlatives = [{
                name: 'Fanboy',
                description: 'Chose the same movie the most amount of times.',
                winners: getFanboys(),
                icon: 'images/fanboy.png'
            }, {
                name: 'People Person',
                description: 'Correctly predicted the most awards given to people: Best Director, Best Actor, etc.',
                winners: techAndPeople.peoplePeople,
                icon: 'images/people-person.png'
            }, {
                name: 'Techie',
                description: 'Correctly predicted the most technical awards: Film Editing, Sound Mixing, etc.',
                winners: techAndPeople.techies,
                icon: 'images/techie.jpg'
            }, {
                name: 'Psychic',
                description: 'Correctly predicted awards that went against the opinion of the crowd. Arguably almost as prestigious as the overall winner. Contact Logan if you want more details.',
                winners: getDarkHorses(),
                icon: 'images/psychic.png'
            }]

            console.log($scope.superlatives)

            $scope.endingModal = $modal({
                title: 'We have a winner!',
                contentTemplate: 'views/ending-modal.html',
                show: true,
                scope: $scope,
                animation: 'am-fade-and-scale'
            });
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
                    $scope.highlight = function(aI) {
                        if ($scope.user.picks === undefined || $scope.awards[aI].winner === undefined) {
                            return;
                        }

                        if ($scope.user.picks[aI] == $scope.awards[aI].winner) {
                            return 'correct'
                        } else {
                            return 'incorrect'
                        }
                    }

                    $scope.highlightNom = function(aI, nI) {
                        if ($scope.user.picks === undefined || $scope.awards[aI].winner === undefined) {
                            return;
                        }

                        if ($scope.user.picks[aI] == nI) {
                            if (nI == $scope.awards[aI].winner) {
                                return 'correct'
                            } else {
                                return 'incorrect'
                            }
                        }
                    }

                    $scope.getTooltip = function(voter) {
                        return _.find($scope.users, {
                            id: voter
                        }).first_name;
                    }

                    addPicks()
                    getUserScores()

                    $scope.awards.$watch(function(thing) {

                        last.set({
                            last: thing.key
                        })

                        getUserScores();
                    })
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
        $scope.oscarStart = new Date(2016, 1, 29, 1, 30 - $scope.time.getTimezoneOffset())

        $scope.auth = Auth;
        var user = $scope.auth.$getAuth();


        $scope.dropdown = [{
            "text": "Logout",
            "click": "logout()"
        }];

        if ($scope.time < $scope.oscarStart) {
            var hasNotRun = true;

            User(user.auth.uid).$bindTo($scope, 'user')
                .then(function() {
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
