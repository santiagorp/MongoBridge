module.exports = {
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
