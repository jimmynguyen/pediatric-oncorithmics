'use strict';

angular.module('pediatricOncorithmics.controllers')

.controller('login_controller', function($scope, $location, $http) {
	
	var API_URL = 'http://localhost:3000';

	/*************************************************
	 * Initialize
	 ************************************************/
	$('body').css('background','#ddd');

	/*************************************************
	 * Define scope functions
	 ************************************************/
	$scope.login = function(user) {

		// call login api call
		$http.post(API_URL + '/user/login', user)
		.success(function(response) {
			if (response[0].is_correct_login) {
				$('body').css('background','white');
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
				$('#button_closeCreateAccountForm').click();
				$('#div_login_message').html('Account successfully created.<br/>Please login to continue');
				$('#div_login_message').removeClass().addClass('alert').addClass('alert-success');
			} else {
				$('#form_createAccount')[0].reset();
				$('#button_closeCreateAccountForm').click();
				$('#div_login_message').html('An error has occurred.<br/>Please try again');
				$('#div_login_message').removeClass().addClass('alert').addClass('alert-danger');
			}
		});
	}

});