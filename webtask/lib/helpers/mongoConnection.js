var MongoClient = require('mongodb').MongoClient;

var Conn = function() {
  this.url = null;
  this.db = null;
};

/**
 * Initialize the database connection with the specified url
 * @param {string} url - The url of the mongo connection (contains the database name as well)
 */
Conn.prototype.initialize = function(url) {
  var self = this;
  console.log("Connecting to " + url);
  return new Promise(function(resolve, reject) {
    if (self.db) {
      return resolve(self.db);
    }

    MongoClient.connect(url, function(err, db) {
      if (err) {
        return reject(err);
      }

      console.log("Connected to MongoDB!");
      self.db = db;
      return resolve(db);
    });
  });
};

module.exports = new Conn();
