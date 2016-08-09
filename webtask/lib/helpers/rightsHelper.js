var RightsHelper = function() {
  // Collections to exclude from mongoBridge clients
  this.excludedCollections = ['mongoBridgeSettings', 'system.indexes'];

  // Allowed methods for client
  this.validMethods = ['find', 'findOne', 'insert', 'update', 'remove', 'removeOne'];

  // After ininitializes contains the permissions of each collection
  this.permissions = null;
};

/**
 * Reload the permissions of the collections. This should be done
 * upon initialization and after modifying the permissions.
 * @param {bool} force - Force reloading permissions from DB
 */
 RightsHelper.prototype.reloadPermissions = function(db, force) {
   var self = this;
   return new Promise(function(resolve, reject) {
     if (!self.permissions || force) {
       console.log("Loading permissions...");
       db.collection('mongoBridgeSettings').find({}, function(err, data) {
         if (err) throw('Error reloading permissions');
         data.toArray(function(err, data) {
           if (err) throw('Error reloading permissions');

           self.permissions = {};
           data.forEach(function(item, index) {
             self.permissions[item.collectionName] = item.allow;
           });
           resolve(self.permissions);
         });
       });
     } else {
       console.log("Permissions already loaded!");
       resolve(self.permissions);
     }
   });
 };

/**
 * Middleware helper to load mongoBridge permissions if not already loaded.
 */
RightsHelper.prototype.checkPermissionsMiddleware = function(req, res, next) {
  this.reloadPermissions(req.db).then(function(permissions) {
    next();
  }).catch(function(err) {
    next(err);
  });
};

module.exports = new RightsHelper();
