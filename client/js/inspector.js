function refreshMaterialiceCssSelects() {
  $(() => {
    $('select').material_select()
  });
}

function refreshInputFields() {
  $(() => {
    Materialize.updateTextFields();
  });
}

var InspectorModel = function() {
  this.collections = ko.observableArray();
  this.selectedCollection = ko.observable('');
  this.methods = ko.observableArray();
  this.selectedMethod = ko.observable('');
  this.parameters = ko.observableArray();
  this.lastExecution = ko.observable("");

  this.selectedCollection.subscribe(function(newValue) {
    if (!newValue)
      return;
    var self = this;
    MongoBridgeClient.getRights(newValue, function(data) {
      self.parameters.removeAll();
      self.methods(data);
      refreshMaterialiceCssSelects();
    });
  }, this);

  this.selectedMethod.subscribe(function(newValue) {
    if (!newValue)
      return;
    this.parameters.removeAll();
  }, this);

  this.commandString = ko.computed(function() {
    var cmd = "MongoBridgeClient.collection(\"" + this.selectedCollection()  + "\")." + this.selectedMethod();
    cmd += "(" + JSON.stringify(this.getQueryParameters()) + ")";
    return cmd;
  }, this);
}

InspectorModel.prototype.initialize = function() {
  var self = this;
  MongoBridgeClient.getCollections(function(data) {
    ko.utils.arrayPushAll(self.collections, data);
    refreshMaterialiceCssSelects();
  });
};

InspectorModel.prototype.addParameter = function() {
  var self = this;
  var options = {
    name: 'name',
    value: 'value',
    onRemove: function(parameter) {
      var index = self.parameters().indexOf(parameter);
      if (index >= 0) {
        self.parameters.splice(index, 1);
      }
    }
  }
  let p = new ParameterModel(options);
  this.parameters.push(p);
  refreshInputFields();
}

InspectorModel.prototype.getQueryParameters = function() {
  let p = {};
  for (var i = 0; i < this.parameters().length; i++) {
    var x = this.parameters()[i];
    var prop = x.name();
    var n = Number(x.value());
    var str = x.value();
    if (str.length > 0 && str[0] == "\"" && str[str.length - 1] == "\"" ) {
      p[prop] = str.substr(1, str.length - 2);
    } else if (n !== n && str.length > 0 && str[0] != "\"" && str[str.length - 1] != "\"" ) {
      p[prop] = x.value();
    } else if(n !== n) {
      p[prop] = x.value();
    } else {
      p[prop] = n;
    }
  }
  return p;
}

InspectorModel.prototype.executeQuery = function() {
  var self = this;
  var params = [this.selectedCollection(), this.selectedMethod(), this.getQueryParameters()];
  MongoBridgeClient.rawQuery(params, function(err, data) {
    if (err) {
      self.lastExecution(err);
    } else {
      self.lastExecution(JSON.stringify(data, undefined, 2));
    }
  })
};


var ParameterModel = function(options) {
  this.name  = ko.observable(options.name || '');
  this.value = ko.observable(options.value || '');
  this.remove = options.onRemove || function() {};
};
