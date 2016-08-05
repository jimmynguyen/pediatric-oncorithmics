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
  			
var query = "select l2,l1,cr,cho from mrs_file";

connection.query(query, function(err,rows) {
	var data = rows;

	var vectors = new Array();

	var l2,l1,cr,cho;

	for (var i = 0; i < data.length; i++) {
		l2 = JSON.parse(data[i].l2);
		l1 = JSON.parse(data[i].l1);
		cr = JSON.parse(data[i].cr);
		cho = JSON.parse(data[i].cho);
		vectors[i] = [l2.peak,l1.peak,cr.peak,cho.peak];
	}

	kmeans.clusterize(vectors, {k: 5}, (err, res) => {
		if (err) console.err(err);
		else console.log('%o',res);
	});
});

connection.end();