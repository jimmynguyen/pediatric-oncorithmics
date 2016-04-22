'use strict';

angular.module('pediatricOncorithmics.routes')

.config(function($routeProvider) {
	$routeProvider
	.when('/', {
		templateUrl: 'assets/templates/login.html',
		controller: 'login_controller',
		controllerAs: 'login'
	})
	.when('/patients', {
		templateUrl: 'assets/templates/patients.html',
		controller: 'patients_controller',
		controllerAs: 'patients'
	})
	.otherwise({
		redirectTo: '/'
	});
});