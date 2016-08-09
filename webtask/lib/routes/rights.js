var express = require('express');
var router = express.Router();
var rightsHelper = require('../helpers/rightsHelper');
var requestHelper = require('../helpers/requestHelper');

/**
 * Get rights for the specified collection name
 */
router.get('/:collection', function(req, res) {
  var colName = req.params.collection;
  if (!colName) {
    return res.json([]);
  }
  req.db.collection('mongoBridgeSettings').findOne({collectionName: colName}, function(err, data) {
    var allow = data && data.allow ? data.allow : [];
    res.json(allow);
  });
});

/**
 * Allow the specified methods for the collection
 */
router.use('/:collection/allow', function(req, res, next) {
  requestHelper.processPOST(req, res, next).then(function(data) {
    var colName = req.params.collection;
    if (rightsHelper.excludedCollections.indexOf(colName) >= 0) throw "Error";

    var methods = data.methods;
    if (!colName || !methods || !(methods instanceof Array))
      throw("Error");

    var parsed = methods.filter(function(x) {
      return rightsHelper.validMethods.indexOf(x) >= 0;
    });

    req.db.collection('mongoBridgeSettings').update(
      {collectionName: colName},
      {$addToSet: {
        allow: { $each: parsed }
      }},
      {
        upsert: true,
      },
      function(err, data) {
        rightsHelper.reloadPermissions(req.db, true)
        .then(function(permissions) {
          res.json(data);
        }).catch(function(err){
          next(err);
        });
      }
    );
  });
});

/**
 * Deny the specified methods for the collection
 */
router.use('/:collection/deny', function(req, res, next) {
  requestHelper.processPOST(req, res, next).then(function(data) {
    var colName = req.params.collection;
    if (rightsHelper.excludedCollections.indexOf(colName) >= 0) throw "Error";

    var methods = data.methods;
    if (!colName || !methods || !(methods instanceof Array))
      throw("Error");

    req.db.collection('mongoBridgeSettings').update(
      {collectionName: colName},
      {$pullAll: {
        allow: methods
      }},
      function(err, data) {
        rightsHelper.reloadPermissions(req.db, true)
        .then(function(permissions) {
          res.json(data);
        }).catch(function(err){
          next(err);
        });
      }
    );
  });
});

module.exports = router;
