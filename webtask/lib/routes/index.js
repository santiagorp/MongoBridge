var express = require('express');
var ObjectID = require('mongodb').ObjectID;
var router = express.Router();
var rightsHelper = require('../helpers/rightsHelper');
var conn = require('../helpers/mongoConnection');

router.get('/', function(req, res, next) {
  res.end('This is the index');
});

/**
 * Get an array with the name of the available collections on the server
 */
router.get('/collections', function(req, res) {
  conn.db.command({listCollections: 1}, function(err, data) {
    if (err) throw data;
    var result = data.cursor.firstBatch.map(function(x) {
      return x.name;
    }).filter(function(x) {
      return rightsHelper.excludedCollections.indexOf(x) < 0;
    });
    return res.json(result);
  });
});

/**
 * Query the DB using the mongo client.
 */
router.post('/query', function(req, res) {
  var params = req.body.params;
  var colName = params.shift();

  if (rightsHelper.excludedCollections.indexOf(colName) >= 0)
    throw('Error');

  var method = params.shift();
  // Parse _ids and convert to mongo ObjectIDs
  params = params.map(function(o) {
    if (o._id) {
      o._id = ObjectID(o._id);
    }
    return o;
  });

  // Add callback to last parameter
  params.push(function(err, data) {
    if (data.cursorState) {
      data.toArray(function(err, data) {
        res.json(data);
      });
    } else {
      res.json(data);
    }
  });

  var hasPermissions = rightsHelper.permissions[colName].indexOf(method) >= 0;
  if (!hasPermissions) {
    throw("No rights");
  }
  var col = conn.db.collection(colName);
  col[method].apply(col, params);
});

module.exports = router;
