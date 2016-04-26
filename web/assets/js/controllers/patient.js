'use strict';

angular.module('pediatricOncorithmics.controllers')

.controller('patient_controller', function($scope, $location, $http, $cookies, fileUpload) {

    /*************************************************
     * Define scope functions
     ************************************************/
    $scope.uploadFile = function(file){
        var reader; //GLOBAL File Reader object for demo purpose only

        /**
         * Check for the various File API support.
         */
        function checkFileAPI() {
            if (window.File && window.FileReader && window.FileList && window.Blob) {
                reader = new FileReader();
                return true; 
            } else {
                alert('The File APIs are not fully supported by your browser. Fallback required.');
                return false;
            }
        }

        /**
         * read text input
         */
        function readText(file) {
            var output = ""; //placeholder for text output
            if(file) {           
                reader.onload = function (e) {
                    output = e.target.result;
                    $scope.fileText = output;
                    var data = $scope.fileText.substring($scope.fileText.indexOf("BEGIN_DATA") + "BEGIN_DATA 1024 ".length);
                    var arr  = data.split(String.fromCharCode(10));
                    var row;
                    var dataset = new Array(arr.length);
                    for (var i = 0; i < arr.length; i++) {
                        row = arr[i].split(" ");
                        dataset[i] = new Array(+row[0],+row[1]);
                    }
                    $scope.$apply();

                    var uploadData = {
                        name: $scope.patientName,
                        data: JSON.stringify(dataset)
                    };

                    $http.post(API_URL + '/data/upload', uploadData)
                    .success(function(response) {
                        if (response.code == 200) {
                            $scope.goToResults(response);
                        } else {
                            $('#div_patient_message').html('An error has occurred. Please try again.');
                            $('#div_patient_message').addClass('alert').addClass('alert-danger');
                        }
                    });
                };//end onload()
                reader.readAsText(file);
            }//end if html5 filelist support
            else { //this is where you could fallback to Java Applet, Flash or similar
                return false;
            }       
            return true;
        }

        checkFileAPI();
        readText(file);
    };

    $scope.getData = function() {
        $http.get(API_URL + '/data/patient/' + $scope.patientName)
        .success(function(response) {
            $scope.data = response;
            var date_options = {
                weekday: "long", year: "numeric", month: "long",
                day: "numeric", hour: "2-digit", minute: "2-digit",
                second: "2-digit"
            };
            for (var i = 0, date; i < $scope.data.length; i++) {
                date = new Date($scope.data[i].date);
                $scope.data[i].date = date.toLocaleDateString('en-us',date_options);
            }
        });
    }
    
    $scope.goToResults = function(datum) {
        $cookies.putObject('mrs_file_id',datum.id);
        $location.path('/results');
    }
    
    $scope.backToPatients = function(datum) {
        $location.path('/patients');
    }

    /*************************************************
     * Initialize
     ************************************************/
    var API_URL = $cookies.getObject('API_URL');
    $('.modal-backdrop').fadeOut();
    $('body').removeClass('modal-open');

    // check if logged in
    if ($cookies.getObject('user') === undefined || $cookies.getObject('patient') == undefined) {
        $location.path('/patients');
    }

    if ($cookies.getObject('isNewPatient')) {
        $cookies.remove('isNewPatient');
        $('#div_patient_message').html('Patient has been added successfully');
        $('#div_patient_message').addClass('alert').addClass('alert-success');
    }

    $scope.patientName = $cookies.getObject('patient').name;
    $scope.getData();

});