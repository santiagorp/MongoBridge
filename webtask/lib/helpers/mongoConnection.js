var MongoClient = require('mongodb').MongoClient;

module.exports = function(initUri, opts) {
  var connection;
  opts = opts || {};

  return function mongoDBConn(req, res, next) {
    var url = initUri || req.webtaskContext.secrets.DB_URL;
    if (!connection) {
      console.log("Connecting to DB...");
      connection = MongoClient.connect(url, opts);
    }

    connection.then(function(db) {
      console.log("DB connection: OK");
      req.db = db;
      next();
    }).catch(function(err) {
      console.log("ERROR: NOT connected!");
      connection = undefined;
      next(err);
    });
  }
}
