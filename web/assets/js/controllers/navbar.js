'use strict';

angular.module('pediatricOncorithmics.controllers')

.controller('navbar_controller', function($scope, $location, $http, $cookies) {

	$('body').css('background','white');

	$scope.goToPatients = function() {
		$location.path('/patients');
	}

	$scope.logout = function() {
		angular.forEach($cookies.getAll(), function (v, k) {
		    $cookies.remove(k);
		});
		$location.path("/");
	}

});