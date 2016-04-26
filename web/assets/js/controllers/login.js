'use strict';

angular.module('pediatricOncorithmics.controllers')

.controller('login_controller', function($scope, $location, $http, $cookies) {

	$cookies.putObject('API_URL','http://localhost:3000');

	/*************************************************
	 * Define scope functions
	 ************************************************/
	$scope.login = function(user) {
		// call login api call
		$http.post(API_URL + '/user/login', user)
		.success(function(response) {
			if (response[0].is_correct_login) {
				$cookies.putObject('user',response[0]);
				$location.path('/patients');
			} else {
				$('#div_login_message').html('Incorrect login credentials.<br/>Please try again');
				$('#div_login_message').removeClass().addClass('alert').addClass('alert-danger');
			}
		});
	}

	$scope.register = function(newUser) {
		// call login api call
		$http.post(API_URL + '/user/create', newUser)
		.success(function(response) {
			if (response.code == 200) {
				$('#form_createAccount')[0].reset();
				$('#div_login_message').html('Account successfully created.<br/>Please login to continue');
				$('#div_login_message').removeClass().addClass('alert').addClass('alert-success');
			} else {
				$('#form_createAccount')[0].reset();
				$('#div_login_message').html('An error has occurred.<br/>Please try again');
				$('#div_login_message').removeClass().addClass('alert').addClass('alert-danger');
			}
			$('#createAccountModal').modal('toggle');
		});
	}

	/*************************************************
	 * Initialize
	 ************************************************/
	var API_URL = $cookies.getObject('API_URL');
	
	$('body').css('background','#ddd');

});