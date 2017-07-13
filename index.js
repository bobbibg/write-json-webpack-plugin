var path = require('path');

var Plugin = function(options) {
    this.options = options || {};
    this.options.object = options.object || {};
    this.options.path = options.path || '';
    this.options.filename = options.filename || 'timestamp.json';
    this.options.pretty = options.pretty;
};

Plugin.prototype.apply = function(compiler) {
    compiler.plugin('emit', this.createObj.bind(this));
};

Plugin.prototype.createObj = function(compilation, callback) {
    var json = JSON.stringify(this.options.object, null, this.options.pretty ? 2 : null);
    var output = path.join(this.options.path, this.options.filename);

    compilation.assets[output] = {
      source: function() { return json; },
      size: function() { return json.length; }
    }

    callback();
};

module.exports = Plugin;
