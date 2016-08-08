var MongoClient = require('mongodb').MongoClient;

var Conn = function() {
  this.db = null;
};

/**
 * Initialize the database connection with the specified url
 * @param {string} url - The url of the mongo connection (contains the database name as well)
 * @param {function} callback - Callback to be invoked after the initialization
 */
Conn.prototype.initialize = function(url, callback) {
  var self = this;
  MongoClient.connect(url, function(err, db) {
    if (err) {
      return callback(err, null);
    }
    
    self.db = db;
    if (callback) {
      callback(err, db);
    }
  });
};

module.exports = new Conn();
