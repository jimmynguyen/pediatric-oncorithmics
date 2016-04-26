'use strict';

angular.module('pediatricOncorithmics.controllers')

.controller('navbar_controller', function($scope, $location, $http, $cookies) {

	/*************************************************
	 * Declare scope functions
	 ************************************************/
	$scope.goToPatients = function() {
		$location.path('/patients');
	}

	$scope.logout = function() {
		angular.forEach($cookies.getAll(), function (v, k) {
		    $cookies.remove(k);
		});
		$location.path("/");
	}

	/*************************************************
	 * Initialize
	 ************************************************/
	$('body').css('background','white');

});