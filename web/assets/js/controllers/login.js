'use strict';

angular.module('pediatricOncorithmics.controllers')

.controller('login_controller', function($scope, $location, $http) {
	
	/*************************************************
	 * Initialize
	 ************************************************/
	$('body').css('background','#ddd');

	/*************************************************
	 * Define scope functions
	 ************************************************/
	$scope.login = function(user) {
		$('body').css('background','white');
		$location.path('/patients');
	}

	$scope.register = function() {

	}

});