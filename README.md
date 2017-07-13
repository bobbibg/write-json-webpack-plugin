# Write JSON Webpack Plugin

Emits a JSON file that contains data passed through to it

## Install

```bash
npm install --save-dev write-json-webpack-plugin
```

## Configuration

```js
// Add to your Webpack config file
var path = require('path');
var WriteJsonPlugin = require('write-json-webpack-plugin');

module.exports = {
  plugins: [new WriteJsonPlugin()]
};  
```

## Options

Write JSON Webpack Plugin accepts three options, the object to write, the path and filename

```js
new WriteJsonPlugin({
    object: [object]
    path: 'public',
    // default output is timestamp.json
    filename: 'timestamp.json',
    pretty: true // makes file human-readable (default false)
})
```
