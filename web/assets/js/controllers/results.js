'use strict';

angular.module('pediatricOncorithmics.controllers')

.controller('results_controller', function($scope, $location, $http, $cookies) {

	/*************************************************
	 * Define scope functions
	 ************************************************/
	$scope.getMRSData = function() {
        $http.get(API_URL + '/data/' + $cookies.getObject('mrs_file_id'))
        .success(function(response) {
            $scope.data = response[0];
            if ($scope.data.grade > 0) {
				$("#grade").addClass('col-sm-offset-' + $scope.data.grade*3);
				$("#grade").addClass('col-md-offset-' + $scope.data.grade*3);
            }

            if ($scope.data.grade == 0) {
            	$scope.grade = 'A Normal grade classification indicates that there are no presence of tumors.';
            	$scope.treatment = 'No indications of tumor presence.';
            } else if ($scope.data.grade == 1) {
            	$scope.grade = 'A Grade 1 classification is considered a low grade and indicates that cells are well differentiated. Low-grade cancer cells look more like normal cells and tend to grow and spread more slowly than high-grade cancer cells.';
            	$scope.treatment = 'Observe for 3 months and revisit doctor if symptoms worsen.';
            } else if ($scope.data.grade == 2) {
            	$scope.grade = 'A Grade 2 classification is considered an intermediate grade and indicates that cells are moderately differentiated.';
            	$scope.treatment = 'Surgical intervention';
            } else if ($scope.data.grade == 3) {
            	$scope.grade = 'A Grade 3 classification is considered a high grade and indicates that cells are poorly differentiated. High-grade cancer cells tend to grow and spread more quickly than low-grade cancer cells.';
            	$scope.treatment = 'Surgical intervention and radiotherapy/chemotherapy';
            } else if ($scope.data.grade == 3) {
            	$scope.grade = 'A Grade 4 classification is considered a high grade and indicates that cells are undifferentiated. High-grade cancer cells tend to grow and spread more quickly than low-grade cancer cells.';
            	$scope.treatment = 'Palliative care';
            }

            var amplitude = JSON.parse($scope.data.amplitude);
            var frequency = JSON.parse($scope.data.frequency);
            var data = new Array(amplitude.length);
			for (var i = 0; i < amplitude.length; i++) {
            	data[i] = {
            		amplitude: amplitude[i],
            		frequency: frequency[i]
            	};
            }

            var l2 = JSON.parse($scope.data.l2);
            var l1 = JSON.parse($scope.data.l1);
            var naa = JSON.parse($scope.data.naa);
            var cr = JSON.parse($scope.data.cr);
            var cho = JSON.parse($scope.data.cho);

            l2 = [{
            	frequency: l2.freq,
            	amplitude: l2.peak
            }];
            l1 = [{
            	frequency: l1.freq,
            	amplitude: l1.peak
            }];
            naa = [{
            	frequency: naa.freq,
            	amplitude: naa.peak
            }];
            cr = [{
            	frequency: cr.freq,
            	amplitude: cr.peak
            }];
            cho = [{
            	frequency: cho.freq,
            	amplitude: cho.peak
            }];

            $scope.plotMRSData(data, l2, l1, naa, cr, cho);

        });
	}

	$scope.plotMRSData = function(data, l2, l1, naa, cr, cho) {
		var margin = {top: 30, right: 20, bottom: 80, left: 50},
		    width = 800 - margin.left - margin.right,
		    height = 450 - margin.top - margin.bottom;

		// Parse the date / time
		var parseDate = d3.time.format("%d-%b-%y").parse;

		// Set the ranges
		var x = d3.scale.linear().range([width,0]);
		var y = d3.scale.linear().range([height, 0]);

		// Define the axes
		var xAxis = d3.svg.axis().scale(x)
		    .orient("bottom").ticks(5)
		    .innerTickSize(-height)
		    .outerTickSize(0)
		    .tickPadding(10);

		var yAxis = d3.svg.axis().scale(y)
		    .orient("left").ticks(5)
		    .innerTickSize(-width)
		    .outerTickSize(0)
		    .tickPadding(10);

		// Define the line
		var valueline = d3.svg.line()
		    .x(function(d) { return x(d.frequency); })
		    .y(function(d) { return y(d.amplitude); });
		    
		// Adds the svg canvas
		var svg = d3.select("#advancedView")
		    .append("svg")
		        .attr("width", width + margin.left + margin.right)
		        .attr("height", height + margin.top + margin.bottom)
		    .append("g")
		        .attr("transform", 
		              "translate(" + margin.left + "," + margin.top + ")");

	    // Scale the range of the data
	    x.domain([0,4.5]);
	    y.domain([d3.min(data, function(d) { return d.amplitude; }) - d3.max(data, function(d) { return d.amplitude; })*0.25, d3.max(data, function(d) { return d.amplitude; }) * 1.25]);

	    // Add the valueline path.
	    svg.append("path")
	        .attr("class", "line")
	        .attr("d", valueline(data));

	    svg.selectAll("dot")
	        .data(l2)
	      	.enter().append("circle")
	      		.attr("data-legend","L2")
	      		.attr("data-legend-color","red")
	        	.attr("r", 7)
	        	.attr("cx", function(d) { return x(d.frequency); })
	        	.attr("cy", function(d) { return y(d.amplitude); })
    			.style("fill", "white")
    			.style("stroke", "red");

	    svg.selectAll("dot")
	        .data(l1)
	      	.enter().append("circle")
	      		.attr("data-legend","L1")
	      		.attr("data-legend-color","orange")
	        	.attr("r", 7)
	        	.attr("cx", function(d) { return x(d.frequency); })
	        	.attr("cy", function(d) { return y(d.amplitude); })
    			.style("fill", "white")
    			.style("stroke", "orange");

	    svg.selectAll("dot")
	        .data(naa)
	      	.enter().append("circle")
	      		.attr("data-legend","NAA")
	      		.attr("data-legend-color","green")
	        	.attr("r", 7)
	        	.attr("cx", function(d) { return x(d.frequency); })
	        	.attr("cy", function(d) { return y(d.amplitude); })
    			.style("fill", "white")
    			.style("stroke", "green");

	    svg.selectAll("dot")
	        .data(cr)
	      	.enter().append("circle")
	      		.attr("data-legend","Cr")
	      		.attr("data-legend-color","indigo")
	        	.attr("r", 7)
	        	.attr("cx", function(d) { return x(d.frequency); })
	        	.attr("cy", function(d) { return y(d.amplitude); })
    			.style("fill", "white")
    			.style("stroke", "indigo");

	    svg.selectAll("dot")
	        .data(cho)
	      	.enter().append("circle")
	      		.attr("data-legend","Cho")
	      		.attr("data-legend-color","violet")
	        	.attr("r", 7)
	        	.attr("cx", function(d) { return x(d.frequency); })
	        	.attr("cy", function(d) { return y(d.amplitude); })
    			.style("fill", "white")
    			.style("stroke", "violet");

	    // Add the X Axis
	    svg.append("g")
	        .attr("class", "x axis")
	        .attr("transform", "translate(0," + height + ")")
	        .call(xAxis)
	        .append("text")
	            .attr("text-anchor", "middle")
	            .attr("transform", "translate(" + width/2 + ",40)")
	            .style("font-size","16px")
	            .style("font-weight","bold")
	            .text("Frequency");

	    // Add the Y Axis
	    svg.append("g")
	        .attr("class", "y axis")
	        .call(yAxis)
	        .append("text")
	            .attr("text-anchor", "middle")
	            .attr("transform", "translate(-30," + height/2 + ")rotate(-90)")
	            .style("font-size","16px")
	            .style("font-weight","bold")
	            .text("Amplitude");
	    
	    $('svg circle').tipsy({ 
	        gravity: 'w', 
	        html: true, 
	        title: function() {
	            var d = this.__data__;
	            return "<table><tr><td>frequency</td><td style='padding-left:10px'>" + parseFloat(Math.round(d.frequency * 10000) / 10000).toFixed(4) + "</td></tr><tr><td>amplitude</td><td style='padding-left:10px'>" + parseFloat(Math.round(d.amplitude * 10000) / 10000).toFixed(4) + "</td></tr></table>";
	        }
	    });

	    var legend = svg.append("g")
	        .attr("class","legend")
	        .attr("transform","translate(50,30)")
	        .style("font-size","12px")
	        .call(d3.legend);

	    setTimeout(function() { 
	        legend
	            .style("font-size","20px")
	            .attr("data-style-padding",10)
	            .call(d3.legend);
	    },1000);

	    $('.legend-box').addClass('hide');
	}

	$scope.toggleAdvancedView = function() {
		$('#advancedView').toggle('slow');
		if ($scope.buttonText == 'Show More') {
			$scope.buttonText = 'Show Less';
		} else {
			$scope.buttonText = 'Show More';
		}
	}

	$scope.backToPatient = function() {
		$cookies.remove('mrs_file_id');
		$location.path('/patient');
	}

	/*************************************************
	 * Initialize
	 ************************************************/
	var API_URL = 'http://localhost:3000';
    $('.modal-backdrop').fadeOut();
    $('body').removeClass('modal-open');

	// check if logged in
	if ($cookies.getObject('user') === undefined || $cookies.getObject('patient') === undefined || $cookies.getObject('mrs_file_id') === undefined) {
		$location.path('/patients');
	}

	$scope.getMRSData();

	$('#advancedView').hide();
	$scope.buttonText = 'Show More';

});