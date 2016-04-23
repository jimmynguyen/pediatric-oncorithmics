var express        = require("express"),
    mysql          = require('mysql'),
    cors           = require('cors'),
    body_parser    = require('body-parser'),
    md5            = require('md5'),
    app            = express(),
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

// port number
app.listen(process.env.PORT || 3000);