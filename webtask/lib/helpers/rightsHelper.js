var connection = require('../helpers/mongoConnection');

var RightsHelper = function() {
  // Collections to exclude from mongoBridge clients
  this.excludedCollections = ['mongoBridgeSettings', 'system.indexes'];

  // Allowed methods for client
  this.validMethods = ['find', 'findOne', 'insert', 'update', 'remove'];

  // After ininitializes contains the permissions of each collection
  this.permissions = null;
};

/**
 * Reload the permissions of the collections. This should be done
 * upon initialization and after modifying the permissions.
 * @param {bool} force - Force reloading permissions from DB
 */
RightsHelper.prototype.reloadPermissions = function(force) {
  var self = this;
  if (!this.permissions || force) {
    connection.db.collection('mongoBridgeSettings').find({}, function(err, data) {
      if (err) throw('Error reloading permissions');

      data.toArray(function(err, data) {
        if (err) throw('Error reloading permissions');

        self.permissions = {};
        data.forEach(function(item, index) {
          self.permissions[item.collectionName] = item.allow;
        });
      })
    });
  }
}

module.exports = new RightsHelper();
