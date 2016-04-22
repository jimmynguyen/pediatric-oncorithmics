'use strict';

angular.module('pediatricOncorithmics.controllers')

.controller('navbar_controller', function($scope, $location, $http) {

	$scope.logout = function() {
		$('body').css('background','white');
		$location.path("/");
	}

});