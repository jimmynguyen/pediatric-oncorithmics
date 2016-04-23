'use strict';

angular.module('pediatricOncorithmics.controllers')

.controller('patients_controller', function($scope, $location, md5) {

	/*************************************************
	 * Define scope functions
	 ************************************************/
	$scope.addPatient = function(patient) {
		patient.id = md5.createHash(patient.name);

		// save patient to database
	}

});