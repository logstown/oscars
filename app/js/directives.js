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
      	var h = 400	;

        var svg = d3.select(element[0]).append('svg')
        	.attr('width', w)
        	.attr('height', h);

        scope.$watch('userScores', function(newval) {
        	if(newval !== undefined) {

        		if(!scope.initialized) {

	        		var max = d3.max(newval, function(d) {
	        			return d.score
	        		})

	        		var yScale = d3.scale.ordinal()
	        			.domain(d3.range(newval.length))
	        			.rangeBands([0, h], 0.1)

	        		var xScale = d3.scale.linear()
	        			.domain([0, max])
	        			.range([0,w])

	        		svg.selectAll('rect')
	        			.data(newval)
	        			.enter()
	        			.append('rect')
	        			.style('fill', 'steelblue')
	        			.attr('y', function(d,i) {
	        				return yScale(i)
	        			})
	        			.attr('x', 0)
	        			.attr('height', yScale.rangeBand())
	        			.attr('width', function(d) {
	        				return xScale(d.score)
	        			})

	        		var names = svg.append('g')
	        			.attr('class', 'names')

	        		names.selectAll('text')
	        			.data(newval)
	        			.enter()
	        			.append('text')
	        			.attr('y', function(d, i) {
	        				return yScale(i) + yScale.rangeBand()*.6
	        			})
	        			.attr('x', 0)
	        			.text(function(d) {
	        				return d.name;
	        			})
	        			.style('font-size', (yScale.rangeBand()/4) + "px")
	        			.style('cursor', 'pointer')
	        			.on('click', function() {
	        				scope.$apply(function() {
		        				$location.path('/chat')
	        				})
	        			})

	        		svg.append('g')
	        			.attr('class', 'scores')
	        			.selectAll('text')
	        			.data(newval)
	        			.enter()
	        			.append('text')
	        			.attr('y', function(d, i) {
	        				return yScale(i) + yScale.rangeBand() *.85
	        			})
	        			.attr('x', function(d) {
	        				var x = xScale(d.score) - yScale.rangeBand();

	        				if(x < 100)
	        					return 100;
	        				else
	        					return x;
	        			})
	        			.text(function(d) {
	        				return d.score
	        			})
	        			.style('font-size', yScale.rangeBand() + "px")

	        		scope.initialized = true;
        		}
        		else {

	        		var max = d3.max(newval, function(d) {
	        			return d.score
	        		})

	        		var yScale = d3.scale.ordinal()
	        			.domain(d3.range(newval.length))
	        			.rangeBands([0, h], 0.1)

	        		var xScale = d3.scale.linear()
	        			.domain([0, max])
	        			.range([0,w])

	        		svg.selectAll('rect')
	        			.data(newval)
	        			.transition()
	        			.attr('y', function(d,i) {
	        				return yScale(i)
	        			})
	        			.attr('height', yScale.rangeBand())
	        			.attr('width', function(d) {
	        				return xScale(d.score)
	        			})

	        		svg.selectAll('g.names text')
	        			.data(newval)
	        			.transition()
	        			.attr('y', function(d, i) {
	        				return yScale(i) + yScale.rangeBand()/2
	        			})
	        			.attr('x', 0)
	        			.text(function(d) {
	        				return d.name
	        			})

	        		svg.selectAll('g.scores text')
	        			.data(newval)
	        			.transition()
	        			.attr('y', function(d, i) {
	        				return yScale(i) + yScale.rangeBand() * .85
	        			})
	        			.attr('x', function(d) {
	        				var x = xScale(d.score) - yScale.rangeBand();

	        				if(x < 100)
	        					return 100;
	        				else
	        					return x;
	        			})
	        			.text(function(d) {
	        				return d.score
	        			})
	        			.style('font-size', yScale.rangeBand())
        		}


        	}
        })
      }
    };
  }]);
