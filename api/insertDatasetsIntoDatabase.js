"use strict";

var express        = require("express"),
    mysql          = require('mysql'),
    cors           = require('cors'),
    body_parser    = require('body-parser'),
    md5            = require('md5'),
    fft            = require('fft'),
    kmeans         = require('node-kmeans'),
    app            = express(),
    connection     = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : '',
        database : 'pediatric_oncorithmics',
	});

var fft = require('fft');
var fs = require('fs');

function callback(ndx) {
	if (ndx <= 101) {
		var filename = 'individualDatasets/dataset' + ndx + '.txt';
		console.log(filename);
		fs.readFile(filename, 'utf8', function(err, data) {
			if (err) throw err;

			function getCol(matrix, col){
		       var column = [];
		       for(var i=0; i<matrix.length; i++){
		          column.push(matrix[i][col]);
		       }
		       return column;
			}

			var CHEMICAL_SHIFT_RANGE = 2000/128;
			var ZERO_ORDER_PHASE_ANGLE = -10.9;

			var fileText = data;
			var data = fileText.substring(fileText.indexOf("BEGIN_DATA") + "BEGIN_DATA 1024 ".length);
			var arr  = data.split(String.fromCharCode(10));
			var row;
			var dataset = new Array(arr.length);
			for (var i = 0; i < arr.length; i++) {
			    row = arr[i].split(" ");
			    dataset[i] = new Array(+row[0],+row[1]);
			}

			var re = getCol(dataset,0);
			var im = getCol(dataset,1);

			fft.transform(re,im);

			var re_shifted = new Array(re.length);

			for (var i = Math.floor(re.length/2)-1; i < re.length; i++) {
				re_shifted[i] = re[i-Math.floor(re.length/2)];
			}

			for (var i = 0; i < Math.floor(re.length/2); i++) {
				re_shifted[i] = re[i+Math.floor(re.length/2)];
			}

			re_shifted

			var amplitude = new Array (re_shifted.length);
			var max_amplitude = 0;

			for (var i = 0; i < amplitude.length; i++) {
				amplitude[i] = re_shifted[i]*Math.cos(ZERO_ORDER_PHASE_ANGLE*Math.PI/180);
				if (max_amplitude < amplitude[i]) {
					max_amplitude = amplitude[i];
				}
			}

			// normalize
			for (var i = 0; i < amplitude.length; i++) {
				amplitude[i] = amplitude[i]/max_amplitude;
			}

			var water_peak = 0, water_peak_ndx;
			// find water peak
			for (var i = 0; i < amplitude.length; i++) {
				if (water_peak < Math.abs(amplitude[i])) {
					water_peak = Math.abs(amplitude[i]);
					water_peak_ndx = i;
				}
			}

			var start_frequency = -(1 - (water_peak_ndx+1)/amplitude.length)*CHEMICAL_SHIFT_RANGE;
			var end_frequency = (water_peak_ndx+1)/amplitude.length*CHEMICAL_SHIFT_RANGE;
			function linspace(start,end,numberOfElements) {
				var increment = (end - start)/(numberOfElements - 1);
				var vector = new Array(numberOfElements);
				for (var i = 0; i < numberOfElements; i++) {
					vector[i] = start + increment*i;
				}
				return vector;
			}

			var frequency = linspace(start_frequency,end_frequency,amplitude.length);

			amplitude.reverse();


			// get L2
			var l2 = {
				leftBoundary: 0,
				rightBoundary: 0,
				peak: 0,
				peak_ndx: 0,
				freq: 0
			};
			for (var i = 0; i < frequency.length; i++) {
				if (frequency[i] <= -4) {
					l2.leftBoundary = l2.leftBoundary + 1;
				}
				if (frequency[i] <= -3.55) {
					l2.rightBoundary = l2.rightBoundary + 1;
				}
			}
			var count = 0;
			for (var i = l2.leftBoundary+1; i < l2.rightBoundary+1; i++) {
				if (l2.peak < amplitude[i]) {
					l2.peak = amplitude[i];
					l2.peak_ndx = i;
				}
				count = count + 1;
			}
			l2.freq = frequency[l2.peak_ndx];

			// get L1
			var l1 = {
				leftBoundary: 0,
				rightBoundary: 0,
				peak: 0,
				peak_ndx: 0,
				freq: 0
			};
			for (var i = 0; i < frequency.length; i++) {
				if (frequency[i] <= -3.55) {
					l1.leftBoundary = l1.leftBoundary + 1;
				}
				if (frequency[i] <= -3) {
					l1.rightBoundary = l1.rightBoundary + 1;
				}
			}
			var count = 0;
			for (var i = l1.leftBoundary+1; i < l1.rightBoundary+1; i++) {
				if (l1.peak < amplitude[i]) {
					l1.peak = amplitude[i];
					l1.peak_ndx = i;
				}
				count = count + 1;
			}
			l1.freq = frequency[l1.peak_ndx];

			// get naa
			var naa = {
				leftBoundary: 0,
				rightBoundary: 0,
				peak: 0,
				peak_ndx: 0,
				freq: 0
			};
			for (var i = 0; i < frequency.length; i++) {
				if (frequency[i] <= -3) {
					naa.leftBoundary = naa.leftBoundary + 1;
				}
				if (frequency[i] <= -2) {
					naa.rightBoundary = naa.rightBoundary + 1;
				}
			}
			var count = 0;
			for (var i = naa.leftBoundary+1; i < naa.rightBoundary+1; i++) {
				if (naa.peak < amplitude[i]) {
					naa.peak = amplitude[i];
					naa.peak_ndx = i;
				}
				count = count + 1;
			}
			naa.freq = frequency[naa.peak_ndx];

			// get cr
			var cr = {
				leftBoundary: 0,
				rightBoundary: 0,
				peak: 0,
				peak_ndx: 0,
				freq: 0
			};
			for (var i = 0; i < frequency.length; i++) {
				if (frequency[i] <= -2) {
					cr.leftBoundary = cr.leftBoundary + 1;
				}
				if (frequency[i] <= -1.55) {
					cr.rightBoundary = cr.rightBoundary + 1;
				}
			}
			var count = 0;
			for (var i = cr.leftBoundary+1; i < cr.rightBoundary+1; i++) {
				if (cr.peak < amplitude[i]) {
					cr.peak = amplitude[i];
					cr.peak_ndx = i;
				}
				count = count + 1;
			}
			cr.freq = frequency[cr.peak_ndx];

			// get cho
			var cho = {
				leftBoundary: 0,
				rightBoundary: 0,
				peak: 0,
				peak_ndx: 0,
				freq: 0
			};
			for (var i = 0; i < frequency.length; i++) {
				if (frequency[i] <= -1.55) {
					cho.leftBoundary = cho.leftBoundary + 1;
				}
				if (frequency[i] <= -1.2) {
					cho.rightBoundary = cho.rightBoundary + 1;
				}
			}
			var count = 0;
			for (var i = cho.leftBoundary+1; i < cho.rightBoundary+1; i++) {
				if (cho.peak < amplitude[i]) {
					cho.peak = amplitude[i];
					cho.peak_ndx = i;
				}
				count = count + 1;
			}
			cho.freq = frequency[cho.peak_ndx];

			// recalculate frequency
			start_frequency = -naa.peak_ndx/amplitude.length*CHEMICAL_SHIFT_RANGE;
			end_frequency = (1 - naa.peak_ndx/amplitude.length)*CHEMICAL_SHIFT_RANGE;
			frequency = linspace(start_frequency, end_frequency, amplitude.length);
			for (var i = 0; i < frequency.length; i++) {
				frequency[i] = 2 + frequency[i];
			}

			// normalize to naa
			for (var i = 0; i < amplitude.length; i++) {
				amplitude[i] = amplitude[i]/Math.abs(naa.peak);	
			}

			l2.peak = amplitude[l2.peak_ndx];
			l1.peak = amplitude[l1.peak_ndx];
			naa.peak = amplitude[naa.peak_ndx];
			cr.peak = amplitude[cr.peak_ndx];
			cho.peak = amplitude[cho.peak_ndx];

			l2.freq = frequency[l2.peak_ndx];
			l1.freq = frequency[l1.peak_ndx];
			naa.freq = frequency[naa.peak_ndx];
			cr.freq = frequency[cr.peak_ndx];
			cho.freq = frequency[cho.peak_ndx];

			var out_data = {
				amplitude: amplitude,
				frequency: frequency,
				l2: l2,
				l1: l1,
				naa: naa,
				cr: cr,
				cho: cho
			};

			var name = '01e6d92da6495ea1a1c8b0569604fb81';
			l2 = JSON.stringify(out_data.l2);
			l1 = JSON.stringify(out_data.l1);
			naa = JSON.stringify(out_data.naa);
			cr = JSON.stringify(out_data.cr);
			cho = JSON.stringify(out_data.cho);
			amplitude = JSON.stringify(out_data.amplitude);
			frequency = JSON.stringify(out_data.frequency);
			var data = JSON.stringify(dataset);
	  		var date1 = new Date('2016-04-25 23:48:00');
	  		date1 = new Date(date1.getTime() + (ndx-1)*1000);
	  		var query = "insert into mrs_file (date,patient_name,data,l2,l1,naa,cr,cho,amplitude,frequency) values (?,?,?,?,?,?,?,?,?,?)";

			connection.query(query, [date1,name,data,l2,l1,naa,cr,cho,amplitude,frequency],function(err,result) {
	  			if(err) throw err;
	  			callback(ndx+1);
			});
		});
	}
}

callback(1);