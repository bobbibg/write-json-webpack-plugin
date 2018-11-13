const tmp = require("tmp");
const fs = require("fs");
const path = require("path");

const webpack2 = require("webpack2");
const { version: WEBPACK2_VERSION } = require("webpack2/package.json");
const webpack3 = require("webpack3");
const { version: WEBPACK3_VERSION } = require("webpack3/package.json");
const webpack4 = require("webpack4");
const { version: WEBPACK4_VERSION } = require("webpack4/package.json");

const WriteJsonPlugin = require("./");

const FAKE_DATA = require("../fixtures/fake_data.json");

[
  {
    title: `Testing with webpack@${WEBPACK2_VERSION}`,
    webpack: webpack2,
    specificWebpackConfig: {},
  },
  {
    title: `Testing with webpack@${WEBPACK3_VERSION}`,
    webpack: webpack3,
    specificWebpackConfig: {},
  },
  {
    title: `Testing with webpack@${WEBPACK4_VERSION}`,
    webpack: webpack4,
    specificWebpackConfig: { mode: "none" },
  },
].forEach(({ title, webpack, specificWebpackConfig }) => {
  let outputDir;
  let compiler = null;

  const compile = pluginOptions =>
    new Promise((resolve, reject) => {
      compiler = webpack(
        {
          context: path.join(process.cwd(), "fixtures", "app"),
          entry: "./index",
          output: {
            path: outputDir.name,
          },
          plugins: [new WriteJsonPlugin(pluginOptions)],
          ...specificWebpackConfig,
        },
        (err, stats) => {
          if (err) {
            reject(err);
          }
          const { errors, warnings } = stats.toJson();
          if (stats.hasErrors()) {
            reject(errors);
          }
          if (stats.hasWarnings()) {
            reject(warnings);
          }
          resolve(stats);
        }
      );
    });

  describe(title, () => {
    beforeEach(() => {
      outputDir = tmp.dirSync({ unsafeCleanup: true });
    });

    afterEach(done => {
      outputDir.removeCallback(done);
      if (compiler) {
        compiler.purgeInputFileSystem();
      }
      compiler = null;
    });

    describe("object option", () => {
      it("creates an empty JSON object when option is not specified", async () => {
        await expect(
          compile({
            path: "",
            filename: "my_data.json",
            pretty: false,
          })
        ).resolves.toEqual(expect.anything());
        expect(
          JSON.parse(
            fs.readFileSync(path.join(outputDir.name, "my_data.json"), {
              encoding: "utf8",
            })
          )
        ).toEqual({});
      });

      it("creates a JSON object based on option value", async () => {
        const myOutputObj = {
          a: true,
          b: false,
        };

        await expect(
          compile({
            object: myOutputObj,
            path: "",
            filename: "my_data.json",
            pretty: false,
          })
        ).resolves.toEqual(expect.anything());
        expect(
          JSON.parse(
            fs.readFileSync(path.join(outputDir.name, "my_data.json"), {
              encoding: "utf8",
            })
          )
        ).toEqual(myOutputObj);
      });
    });

    describe("path option", () => {
      it("generates in ouput directory when option is not specified", async () => {
        await expect(
          compile({
            object: FAKE_DATA,
            filename: "my_data.json",
            pretty: false,
          })
        ).resolves.toEqual(expect.anything());
        expect(
          fs.existsSync(path.join(outputDir.name, "my_data.json"))
        ).toEqual(true);
      });

      it("generates in a sub directory based on option value", async () => {
        await expect(
          compile({
            object: FAKE_DATA,
            path: "output_dir",
            filename: "my_data.json",
            pretty: false,
          })
        ).resolves.toEqual(expect.anything());
        expect(
          fs.existsSync(path.join(outputDir.name, "output_dir", "my_data.json"))
        ).toEqual(true);
      });
    });

    describe("filename option", () => {
      it("generates a file called `timestamp.json` when option is not specified", async () => {
        await expect(
          compile({
            object: FAKE_DATA,
            path: "",
            pretty: false,
          })
        ).resolves.toEqual(expect.anything());
        expect(
          fs.existsSync(path.join(outputDir.name, "timestamp.json"))
        ).toEqual(true);
      });

      it("generates filename based on option value", async () => {
        await expect(
          compile({
            object: FAKE_DATA,
            path: "",
            filename: "my_output.json",
            pretty: false,
          })
        ).resolves.toEqual(expect.anything());
        expect(
          fs.existsSync(path.join(outputDir.name, "my_output.json"))
        ).toEqual(true);
      });
    });

    describe("pretty option", () => {
      it("defaults to minified output", async () => {
        await expect(
          compile({
            object: FAKE_DATA,
            path: "",
            filename: "my_data.json",
          })
        ).resolves.toEqual(expect.anything());
        expect(
          fs.readFileSync(path.join(outputDir.name, "my_data.json"), {
            encoding: "utf8",
          })
        ).toEqual(
          fs.readFileSync(path.join("fixtures", "minifed.json"), {
            encoding: "utf8",
          })
        );
      });

      it("minifies output when option set to false", async () => {
        await expect(
          compile({
            object: FAKE_DATA,
            path: "",
            filename: "my_data.json",
            pretty: false,
          })
        ).resolves.toEqual(expect.anything());
        expect(
          fs.readFileSync(path.join(outputDir.name, "my_data.json"), {
            encoding: "utf8",
          })
        ).toEqual(
          fs.readFileSync(path.join("fixtures", "minifed.json"), {
            encoding: "utf8",
          })
        );
      });

      it("beautifies output when option set to true", async () => {
        await expect(
          compile({
            object: FAKE_DATA,
            path: "",
            filename: "my_data.json",
            pretty: true,
          })
        ).resolves.toEqual(expect.anything());
        expect(
          fs.readFileSync(path.join(outputDir.name, "my_data.json"), {
            encoding: "utf8",
          })
        ).toEqual(
          fs.readFileSync(path.join("fixtures", "beautified.json"), {
            encoding: "utf8",
          })
        );
      });
    });
  });
});
