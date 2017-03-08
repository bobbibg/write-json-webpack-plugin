var fs = require('fs');
var path = require('path');

var Plugin = function(options) {
    this.options = options || {};
    this.options.object = options.object || {};
    this.options.path = options.path || '';
    this.options.filename = options.filename || 'timestamp.json';
};

Plugin.prototype.apply = function(compiler) {
    var _this, output;

    _this = this;
    output = path.join(_this.options.path, _this.options.filename);

    compiler.plugin('after-emit', function(compilation, callback) {
        _this.createObj(compilation, output, _this.options.object, callback);
    });
};

Plugin.prototype.createObj = function(compilation, outputFull, object, callback) {
    var json = JSON.stringify(object);

    fs.writeFile(outputFull, json, function(err) {
        if (err) {
            compilation.errors.push(new Error('Write JSON Webpack Plugin: Unable to save to ' + outputFull));
        }
        callback();
    });
};

module.exports = Plugin;
