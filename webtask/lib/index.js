var express = require('express');
var assert = require('assert');
var bodyParser = require('body-parser');
var conn = require('./helpers/mongoConnection');
var rightsHelper = require('./helpers/rightsHelper');
var routes = require('./routes/index');
var rightsRoutes = require('./routes/rights');

var app = express();

var myMongoURL = ''; // Your mongoDB connection here!
var dbURL = myMongoURL || process.env.DB_URL;
if (!dbURL) {
  throw("Error: DB connection url not found!");
}

conn.initialize(dbURL)
.then(rightsHelper.reloadPermissions.bind(rightsHelper))
.then(function() {
  console.log("Setting up server...");

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
});

module.exports = app;
