const path = require("path");
const util = require("util");
const fs = require("fs");

class WriteJsonWebpackPlugin {
  constructor(options) {
    this.options = options || {};
    this.options.object = options.object || {};
    this.options.path = options.path || "";
    this.options.filename = options.filename || "timestamp.json";
    this.options.pretty = options.pretty || false;
    this.options.extendFiles = options.extendFiles || [];
    this.options.extendFilesMerger =
      options.extendFilesMerger ||
      (values => Object.assign.apply(null, values));

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
    Promise.all(
      this.options.extendFiles
        .map((extendFile, index) =>
          Promise.resolve()
            .then(() => {
              if (!path.isAbsolute(extendFile)) {
                throw new Error(
                  util.format(
                    "`options.extendFiles[%d]` file path isn't absolute",
                    index
                  )
                );
              }
            })
            .then(() => {
              if (path.extname(extendFile) !== ".json") {
                throw new Error(
                  util.format(
                    "`options.extendFiles[%d]` file extension isn't json",
                    index
                  )
                );
              }
            })
            .then(
              () =>
                new Promise((resolve, reject) => {
                  fs.readFile(extendFile, "utf8", (err, extendFileContent) => {
                    if (err) {
                      reject(
                        new Error(
                          util.format(
                            "`options.extendFiles[%d]` doesn't exist",
                            index
                          )
                        )
                      );
                      return;
                    }
                    try {
                      resolve({
                        content: JSON.parse(extendFileContent),
                        filePath: extendFile,
                      });
                    } catch (error) {
                      reject(
                        new Error(
                          util.format(
                            "`options.extendFiles[%d]` is not a valid JSON file",
                            index
                          )
                        )
                      );
                    }
                  });
                })
            )
        )
        .concat(
          Promise.resolve().then(() => {
            try {
              JSON.stringify(this.options.object);
            } catch (error) {
              throw new Error("`options.object` has a circular structure");
            }
            return { content: this.options.object, filePath: null };
          })
        )
        .map(promise =>
          promise
            .then(info => ({ ...info, error: null }))
            .catch(error => Promise.resolve({ error }))
        )
    ).then(objects => {
      const errors = objects
        .map(({ error }) => error)
        .filter(error => error != null);
      if (errors.length > 0) {
        errors.forEach(error => {
          compilation.errors.push(error);
        });
      } else {
        let json;
        try {
          json = JSON.stringify(
            this.options.extendFilesMerger(
              objects.map(({ content }) => content)
            ),
            null,
            this.options.pretty ? 2 : null
          );
          const output = path.join(this.options.path, this.options.filename);
          objects
            .map(({ filePath }) => filePath)
            .filter(filePath => filePath !== null)
            .forEach(filePath => {
              if (compilation.fileDependencies instanceof Set) {
                compilation.fileDependencies.add(filePath);
              } else if (
                compilation.fileDependencies.indexOf(filePath) === -1
              ) {
                compilation.fileDependencies.push(filePath);
              }
            });

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
        } catch (error) {
          compilation.errors.push(
            Error("`options.extendFilesMerger` generated a circular structure")
          );
        }
      }
      callback();
    });
  }
}

module.exports = WriteJsonWebpackPlugin;
