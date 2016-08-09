var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');

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

    compiler.plugin('emit', function(compiler, callback) {
        _this.createObj(compiler, output, _this.options.object);
        callback();
    });
};

Plugin.prototype.createObj = function(compiler, outputFull, object) {
    json = JSON.stringify(object);

    mkdirp('/tmp/some/path/foo', function(err) {
        fs.writeFile(outputFull, json, function(err) {
            if (err) {
                compiler.errors.push(new Error('Write JSON Webpack Plugin: Unable to save to ' + outputFull));
            }
        });
    });
};

module.exports = Plugin;
