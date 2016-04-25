var express        = require("express"),
    mysql          = require('mysql'),
    cors           = require('cors'),
    body_parser    = require('body-parser'),
    md5            = require('md5'),
    app            = express(),
    fft            = require('fft'),
    connectionPool = mysql.createPool({
        connectionLimit : 100, //important
        host     : 'localhost',
        user     : 'root',
        password : '',
        database : 'pediatric_oncorithmics',
        debug    :  true
    });

app.use(cors());

// parse application/x-www-form-urlencoded
app.use(body_parser.urlencoded({
  extended: true
}));

// parse application/json
app.use(body_parser.json());

// user
app.get('/user', function(request, response) {
    var user = require('./routes/user');
    user.read(request, response, connectionPool);
});
app.post('/user/create', function(request, response) {
    var user = require('./routes/user');
    user.create(request, response, connectionPool, md5);
});
app.post('/user/login', function(request, response) {
    var user = require('./routes/user');
    user.login(request, response, connectionPool, md5);
});

// patient
app.get('/patient', function(request, response) {
    var patient = require('./routes/patient');
    patient.read(request, response, connectionPool);
});
app.get('/patient/:name', function(request, response) {
    var patient = require('./routes/patient');
    patient.searchByName(request, response, connectionPool);
});
app.get('/patient/doctor/:doctor_id', function(request, response) {
    var patient = require('./routes/patient');
    patient.searchByDoctorId(request, response, connectionPool);
});
app.post('/patient/create', function(request, response) {
    var patient = require('./routes/patient');
    patient.create(request, response, connectionPool);
});

// mrs data
app.get('/data/patient/:patient_name', function(request, response) {
    var data = require('./routes/data');
    data.getDataByPatient(request, response, connectionPool);
});
app.get('/data/:id', function(request, response) {
    var data = require('./routes/data');
    data.getDataById(request, response, connectionPool);
});
app.post('/data/upload', function(request, response) {
    var data = require('./routes/data');
    data.upload(request, response, connectionPool, fft);
});

// port number
app.listen(process.env.PORT || 3000);