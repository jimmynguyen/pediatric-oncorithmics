'use strict';

angular.module('pediatricOncorithmics.controllers')

.controller('patients_controller', function($scope, $location, $http, $cookies, md5) {

	/*************************************************
	 * Define scope functions
	 ************************************************/
	$scope.getPatientsByDoctorId = function() {
		// get patients
		$http.get(API_URL + '/patient/doctor/' + $cookies.getObject('user').id)
		.success(function(response) {
	        $scope.patients = response;
            var date_options = {
                weekday: "long", year: "numeric", month: "long",
                day: "numeric", hour: "2-digit", minute: "2-digit",
                second: "2-digit"
            };
            for (var i = 0, date; i < $scope.patients.length; i++) {
                date = new Date($scope.patients[i].date);
                $scope.patients[i].date = date.toLocaleDateString('en-us',date_options);
            }
		});	
	}

	$scope.addPatient = function(patient) {
		patient = {
			name     : md5.createHash(patient.name),
			doctor_id: $cookies.getObject('user').id
		};

		// save patient to database
		$http.post(API_URL + '/patient/create', patient)
		.success(function(response) {
			if (response.code == 200) {
				$cookies.putObject('patient',patient);
				$cookies.putObject('isNewPatient',true);
				$location.path('/patient');
			} else {
				$('#div_patients_message').html('An error has occurred.<br/>Please try again');
				$('#div_patients_message').addClass('alert').addClass('alert-success');
			}
			$('#addPatientModal').modal('toggle');
			$scope.patientAdd = '';
		});
	}

	$scope.searchPatient = function(patient) {
		// save patient to database
		$http.get(API_URL + '/patient/' + md5.createHash(patient.name))
		.success(function(response) {
			$('#searchPatientModal').modal('toggle');
			if (response.length > 0) {
				$cookies.putObject('isNewPatient',false);
				$cookies.putObject('patient',response[0]);
				$location.path('/patient');
			} else {
				$('#div_patients_message').html('Patient not found. Please try again');
				$('#div_patients_message').addClass('alert').addClass('alert-danger');
				$scope.patientSearch = '';
			}
		});
	}

	$scope.goToPatient = function(patient) {
		patient = {
			name: patient.name
		};
		$cookies.putObject('patient',patient);
		$location.path('/patient');
	}

	/*************************************************
	 * Initialize
	 ************************************************/
    var API_URL = $cookies.getObject('API_URL');

	// check if logged in
	if ($cookies.getObject('user') === undefined) {
		$location.path('/');
	}

	$scope.getPatientsByDoctorId();

});