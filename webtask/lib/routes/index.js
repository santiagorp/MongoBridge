var express = require('express');
var ObjectID = require('mongodb').ObjectID;
var router = express.Router();
var rightsHelper = require('../helpers/rightsHelper');
var requestHelper = require('../helpers/requestHelper');

var app = express();

/**
 * Get an array with the name of the available collections on the server
 */
router.get('/collections', function(req, res) {
  req.db.command({listCollections: 1}, function(err, data) {
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
router.use('/query', function(req, res, next) {
  requestHelper.processPOST(req, res, next).then(function(data) {
    var params = data.params;
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
    console.log("Invoking " + colName + "." + method + JSON.stringify(params));
    var col = req.db.collection(colName);
    col[method].apply(col, params);
  });
});

module.exports = router;
