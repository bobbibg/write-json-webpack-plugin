const path = require("path");
const fs = require("fs");

class WriteJsonWebpackPlugin {
  constructor(options) {
    if (
      "extendFile" in options &&
      (typeof options.extendFile !== "string" ||
        !path.isAbsolute(options.extendFile) ||
        path.extname(options.extendFile) !== ".json")
    ) {
      throw new TypeError(
        "`options.extendFile` must be an absolute path to a JSON file"
      );
    }
    this.options = options || {};
    this.options.object = options.object || {};
    this.options.path = options.path || "";
    this.options.filename = options.filename || "timestamp.json";
    this.options.pretty = options.pretty;
    this.options.extendFile = options.extendFile;
    this.createObj = this.createObj.bind(this);
  }

  apply(compiler) {
    if (compiler.hooks) {
      compiler.hooks.emit.tapAsync(this.constructor.name, this.createObj);
    } else {
      // Fallback for webpack under version 4
      compiler.plugin("emit", this.createObj);
    }
  }

  createObj(compilation, callback) {
    let obj = this.options.object;

    if (this.options.extendFile) {
      if (Array.isArray(compilation.fileDependencies)) {
        if (
          compilation.fileDependencies.indexOf(this.options.extendFile) === -1
        ) {
          compilation.fileDependencies.push(this.options.extendFile);
        }
      } else if (!compilation.fileDependencies.has(this.options.extendFile)) {
        compilation.fileDependencies.add(this.options.extendFile);
      }

      try {
        obj = Object.assign(
          JSON.parse(fs.readFileSync(this.options.extendFile, "utf8")),
          this.options.object
        );
      } catch (err) {
        compilation.errors.push(err);
        return callback();
      }
    }

    const json = JSON.stringify(obj, null, this.options.pretty ? 2 : null);
    const output = path.join(this.options.path, this.options.filename);

    Object.assign(compilation.assets, {
      [output]: {
        source() {
          return json;
        },
        size() {
          return json.length;
        },
      },
    });

    return callback();
  }
}

module.exports = WriteJsonWebpackPlugin;
