var express = require('express');
var ObjectID = require('mongodb').ObjectID;
var assert = require('assert');
var bodyParser = require('body-parser');
var conn = require('./helpers/mongoConnection');
var rightsHelper = require('./helpers/rightsHelper');
var routes = require('./routes/index');
var rightsRoutes = require('./routes/rights');

var app = express();

// Initialize DB
//var url = 'mongodb://localhost:27017/rmongo';
var url = 'mongodb://mongobridgeuser:mongobridgepasswd@ds145385.mlab.com:45385/santiagorp_mongotest';
conn.initialize(url, function(err, data) {
  if (err) throw("Error connecting to mongo DB");
  console.log("Connected to mongoDB!");
  rightsHelper.reloadPermissions();
});

// Initialize CORS
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

// Setup JSON parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Router
app.use('/', routes);
app.use('/rights', rightsRoutes);

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

module.exports = app;
