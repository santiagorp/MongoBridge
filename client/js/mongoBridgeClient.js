var _url ='';

MongoBridgeClient = (function() {
  var _url = null;

  /*
   * Parse parameters and invoke mongoBridge service
   * @param {string} colName - The collection name to be queried
   * @param {string} method - The mongo method to invoke
   * @param {array} args - The javascript function arguments received.
   *   If the last argument is a callback, it will be extracted.
   */
  function parseAndInvoke(colName, method, args) {
    var argsArray = Array.prototype.slice.call(args);
    var last = argsArray.pop();
    var params = [colName, method].concat(argsArray);
    var callback = null;
    if (typeof last == "function") {
      callback = last;
    } else {
      params.push(last);
    }
    rawQuery(params, callback);
  }

  /*
   * Execute a raw query against the mongoBridge service
   * @param {array} params - The paramters from the query. The array has the
   *   following shape: [collectionName, method, methodArgument1, methodArgument2, ...]
   * @param {function} callback - The callback to be invoked of the shape function(err, data)
   */
  function rawQuery(params, callback) {
    $.ajax({
      url: _url + '/query',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        params: params
      }),
      success: function(data, textStatus, jqxhr) {
        if (callback) callback(null, data);
        console.log(data);
      },
      error: function(jqxhr, textStatus, error) {
        if (callback) callback(textStatus, error);
        console.log(error);
      }
    });
  }
  return {
    initialize: function(serverUrl) {
      _url = serverUrl;
    },
    rawQuery: function(params, callback) {
      rawQuery(params, callback);
    },
    getCollections: function(callback) {
      var url = _url + '/collections';
      $.get(url, function(data) {
        if (callback) callback(data);
      });
    },
    getRights: function(colName, callback) {
      var url = [_url, 'rights', colName].join('/');
      $.get(url, function(data) {
        if (callback) callback(data);
      });
    },
    allow: function(colName, methods, callback) {
      var url = [_url, 'rights', colName, "allow"].join("/");
      $.ajax({
        url: url,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          methods: methods
        }),
        success: function(data, textStatus, jqxhr) {
          if (callback) callback(null, data);
        },
        error: function(jqxhr, textStatus, error) {
          if (callback) callback(textStatus, error);
        }
      });
    },
    deny: function(colName, methods, callback) {
      var url = [_url, 'rights', colName, "deny"].join("/");
      $.ajax({
        url: url,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          methods: methods
        }),
        success: function(data, textStatus, jqxhr) {
          if (callback) callback(null, data);
        },
        error: function(jqxhr, textStatus, error) {
          if (callback) callback(textStatus, error);
        }
      });
    },
    collection: function(colName) {
      return {
        find: function() {
          parseAndInvoke(colName, 'find', arguments);
        },
        findOne: function() {
          parseAndInvoke(colName, 'findOne', arguments);
        },
        insert: function() {
          parseAndInvoke(colName, 'insert', arguments);
        },
        update: function() {
          parseAndInvoke(colName, 'update', arguments);
        },
        remove: function() {
          parseAndInvoke(colName, 'remove', arguments);
        },
        removeOne: function() {
          parseAndInvoke(colName, 'removeOne', arguments);
        }
      };
    }
  };
})();
