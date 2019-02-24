# Write JSON Webpack Plugin

[![Build Status](https://travis-ci.com/aponyx/write-json-webpack-plugin.svg?branch=master)](https://travis-ci.com/aponyx/write-json-webpack-plugin)

Emits a JSON file that contains data passed through to it

## Install

```bash
npm install --save-dev write-json-webpack-plugin
```

## Configuration

```js
// Add to your Webpack config file
var WriteJsonPlugin = require('write-json-webpack-plugin');

module.exports = {
  plugins: [new WriteJsonPlugin()]
};  
```

## Options

Write JSON Webpack Plugin accepts three options, the object to write, the path and filename

```js
new WriteJsonPlugin({
  object: [object],
  path: 'public',
  filename: 'timestamp.json',
  pretty: true,
  extendFiles: [],
  extendFilesMerger: values => Object.assign.apply(null, values)
})
```

| key                 | type            | default value                      | description                                                                               |
|---------------------|-----------------|------------------------------------|-------------------------------------------------------------------------------------------|
| `object`            | object          | `{}`                               | object to serialize                                                                       |
| `path`              | string          | `''`                               | output path                                                                               |
| `filename`          | string          | `'timestamp.json'`                 | output filename                                                                           |
| `pretty`            | boolean         | `false`                            | human-readable when true                                                                  |
| `extendFiles`       | array of string | `[]`                               | absolute file paths to serialize                                                          |
| `extendFilesMerger` | function        | `v=> Object.assign.apply(null, v)` | takes `extendFiles` contents and `object` as argument and returns the object to serialize |
