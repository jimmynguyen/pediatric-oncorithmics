module.exports.getDataByPatient = function(request, response, connectionPool) {
    connectionPool.getConnection(function(error, connection) {
        if (error && connection !== null && connection !== undefined) {
            connection.release();
            response.json({"code" : 500, "status" : "Error in database connection"});
            return;
        } else if (error) {
            response.json({"code" : 500, "status" : "Error in database connection"});
            return;
        } else {
            var patient_name = request.params.patient_name;

            var query = "select * from mrs_file where patient_name = ? order by date";

            connection.query(query, [patient_name], function(error,rows){
                connection.release();
                if (!error) {
                    response.json(rows);
                    return;
                } else {
                    response.json({"code" : 500, "status" : "Error in database query"});
                    return;         
                }
            });
        }
    });
}

module.exports.getDataById = function(request, response, connectionPool) {
    connectionPool.getConnection(function(error, connection) {
        if (error && connection !== null && connection !== undefined) {
            connection.release();
            response.json({"code" : 500, "status" : "Error in database connection"});
            return;
        } else if (error) {
            response.json({"code" : 500, "status" : "Error in database connection"});
            return;
        } else {
            var id = request.params.id;

            var query = "select * from mrs_file where id = ? order by date";

            connection.query(query, [id], function(error,rows){
                connection.release();
                if (!error) {
                    response.json(rows);
                    return;
                } else {
                    response.json({"code" : 500, "status" : "Error in database query"});
                    return;         
                }
            });
        }
    });
}

module.exports.upload = function(request, response, connectionPool, fft) {
    connectionPool.getConnection(function(error, connection) {
        if (error && connection !== null && connection !== undefined) {
            connection.release();
            response.json({"code" : 500, "status" : "Error in database connection"});
            return;
        } else if (error) {
            response.json({"code" : 500, "status" : "Error in database connection"});
            return;
        } else {
            var name = request.body.name,
                data = request.body.data;

            var dataset = identifyPeaks(JSON.parse(data),fft);

            var l2  = JSON.stringify(dataset.l2),
                l1  = JSON.stringify(dataset.l1),
                naa = JSON.stringify(dataset.naa),
                cr  = JSON.stringify(dataset.cr),
                cho = JSON.stringify(dataset.cho),
                amplitude = JSON.stringify(dataset.amplitude),
                frequency = JSON.stringify(dataset.frequency);

            var query = "insert into mrs_file (date,patient_name,data,l2,l1,naa,cr,cho,amplitude,frequency) values (NOW(),?,?,?,?,?,?,?,?,?)";

            connection.query(query, [name,data,l2,l1,naa,cr,cho,amplitude,frequency], function(error, results) {
                connection.release();
                if (!error) {
                    response.json({"code" : 200, "status" : "Success", "id" : results.insertId})
                    return;
                } else {
                    response.json({"code" : 500, "status" : "Error in database query"});
                    return;
                }
            });
        }
    });
}

identifyPeaks = function(complexNumber, fft) {

    var CHEMICAL_SHIFT_RANGE = 2000/128;
    var ZERO_ORDER_PHASE_ANGLE = -10.9;

    // get real and imaginary components from dataset
    var re = getCol(complexNumber,0);
    var im = getCol(complexNumber,1);

    function getCol(matrix, col){
       var column = [];
       for(var i=0; i<matrix.length; i++){
          column.push(matrix[i][col]);
       }
       return column;
    }

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

    // find water peak
    var water_peak = 0, water_peak_ndx;
    for (var i = 0; i < amplitude.length; i++) {
        if (water_peak < Math.abs(amplitude[i])) {
            water_peak = Math.abs(amplitude[i]);
            water_peak_ndx = i;
        }
    }

    // calculate frequency
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
    
    // reverse amplitude
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

    // get normalized peaks
    l2.peak = amplitude[l2.peak_ndx];
    l1.peak = amplitude[l1.peak_ndx];
    naa.peak = amplitude[naa.peak_ndx];
    cr.peak = amplitude[cr.peak_ndx];
    cho.peak = amplitude[cho.peak_ndx];

    // get frequency normalized to naa (2.0)
    l2.freq = frequency[l2.peak_ndx];
    l1.freq = frequency[l1.peak_ndx];
    naa.freq = frequency[naa.peak_ndx];
    cr.freq = frequency[cr.peak_ndx];
    cho.freq = frequency[cho.peak_ndx];

    var frequency_cropped = [];
    var amplitude_cropped = [];

    for (var i = 0; i < frequency.length; i++) {
        if (frequency[i] <= 4.5 && frequency[i] >= 0) {
            frequency_cropped.push(frequency[i]);
            amplitude_cropped.push(amplitude[i]);
        }
    }

    // get output
    var out_data = {
        amplitude: amplitude_cropped,
        frequency: frequency_cropped,
        l2: l2,
        l1: l1,
        naa: naa,
        cr: cr,
        cho: cho
    };

    return out_data;
}