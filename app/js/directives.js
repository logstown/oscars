'use strict';

/* Directives */


angular.module('myApp.directives', []).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }]);


 angular.module('myApp.directives', []).
  directive('scoreboard', ['$location', function($location) {
	return {
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
      	var w = element.parent().width() - 30;
      	var margin = 10;

      	var xScale = d3.scale.linear().range([0,(w-60)])

        var svg = d3.select(element[0]).append('svg')
        	.attr('width', w)

        var rectsGroup = svg.append('g')
        	.attr('clas', 'rects')

        var picsGroup = svg.append('g')
			.attr('class', 'pics')

		var scoresGroup = svg.append('g')
			.attr('class', 'scores')

        var namesGroup = svg.append('g')
            .attr('class', 'names')

        var key = function(d) {
        	return d.info.id;
        }

        var dur = 1000;

        scope.$watch('userScores', function(newval) {
            if(newval === undefined) {
                return;
            }

            var h = newval.length * (50+margin);

            svg.attr('height', h)		

    		var max = d3.max(newval, function(d) {
    			return d.score;
    		})

        	xScale.domain([0, 34])

        	var rects = rectsGroup.selectAll('rect')
    			.data(newval, key)
    			
    		rects.enter().append('rect')
    			.attr('x', 60)
    			.attr('height', 50)


    		rects.transition()
    			.duration(dur)
                .style('fill', function(d) {
                    if(scope.winner && d.score === max) {
                        return 'steelblue'
                    }
                    else if(d.lastCorrect) {
                        return '#B4F59A'
                    }
                    else {
                        return 'pink';
                    }
                })
    			.attr('width', function(d) {
					return xScale(d.score)
				})
				.transition()
				.delay(dur)
				.duration(function(d,i) {
					return 500 + (i * 50)
				})
				.attr('y', function(d,i) {
					return i * (50 + margin)
				})

			rects.exit().remove();



    		var pics = picsGroup.selectAll('image')
    			.data(newval, key)

    		pics.enter().append('image')
    			.attr('x', 0)
    			// .text(function(d) {
    			// 	return d.info.first_name;
    			// })
                .attr('xlink:href', function(d) {
                    return d.pic;
                })
                .attr('width', 50)
                .attr('height', 50)
    			.style('cursor', 'pointer')
    			.on('click', function(d) {
    				scope.$apply(function() {
        				$location.path('/picks/' + d.info.id)
    				})
    			})
                .append('svg:title')
                .text(function(d) {
                    return d.info.name;
                })

    		pics.transition()
    			.delay(dur)
    			.duration(function(d,i) {
					return 500 + (i * 50)
				})
	    		.attr('y', function(d, i) {
					return i * (50 + margin)
				})
				// .style('font-size', (yScale.rangeBand()/4) + "px")

			pics.exit().remove();



    		var scores = scoresGroup.selectAll('text')
    			.data(newval, key)
    			
    		scores.enter().append('text')
    			
    		scores.transition()
    			.duration(dur)
				.attr('x', function(d) {
					var x = xScale(d.score) + 35;

                    if(x < 60){
                        return 60;
                    }
                    else {
                        return x;
                    }
				})
                .style('font-size', "32px")
                .transition()
                .delay(dur)
				.text(function(d) {
					return d.score
				})
				.duration(function(d,i) {
					return 500 + (i * 50)
				})
	    		.attr('y', function(d, i) {
					return i * (50 + margin) + 45;
				})
    	
    		scores.exit().remove()

            var names = namesGroup.selectAll('text')
                .data(newval, key)

            names.enter().append('text')
                .attr('x', 60);

            names.transition()
                .delay(dur)
                .duration(function(d,i) {
                    return 500 + (i * 50)
                })
                .attr('y', function(d, i) {
                    return (i * (50 + margin)) + 12
                })
                .text(function(d) {
                    if(scope.winner && d.score === max) {
                        return d.info.name + ' - WINNER!'
                    }
                    return d.info.name;
                });
        })
      }
    };
  }]);
