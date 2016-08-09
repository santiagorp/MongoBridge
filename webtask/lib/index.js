var express = require('express');
var assert = require('assert');
var bodyParser = require('body-parser');
var mongoConn = require('./helpers/mongoConnection');
var rightsHelper = require('./helpers/rightsHelper');
var routes = require('./routes/index');
var rightsRoutes = require('./routes/rights');

var app = express();

// Get Mongo Url from ENV var. Otherwise mongoConn will retrieve it from the webtask context.
app.use(mongoConn(process.env.DB_URL));

// Reload permissions if not loaded
app.use(rightsHelper.checkPermissionsMiddleware.bind(rightsHelper));

// Initialize CORS
app.use(function (req, res, next) {
    console.log(req.method + " to " + req.url);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

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
