module.exports = {
  /**
   * This method checks if we are running from a webtask and returns the request body.
   * Somehow the router.post('/myMethod') are not being invoked when running from a webtask,
   * so we have to use router.use('/mymethod') and invoke to this helper function.
   */
  processPOST: function(req, res, next) {
    return new Promise(function(resolve, reject) {
      if (req.method == 'OPTIONS') {
        res.end();
        return reject();
      } else if (req.method != 'POST') {
        return reject();
      }

      if (req.webtaskContext.body) {
        return resolve(req.webtaskContext.data);
      } else {
        var fullBody = '';
        req.on('data', function(chunk) {
          fullBody += chunk.toString();
        });

        req.on('end', function() {
          var json = JSON.parse(fullBody);
          resolve(json);
        });
      }
    });
  }
};
