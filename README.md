# Hapi Webpack Plugin

Another Webpack middleware for Hapi.
This plugin is a modern adaptation of the work of [Simon Degraeve](https://github.com/SimonDegraeve/hapi-webpack-plugin) with [Hot Module Replacement (HMR)](https://webpack.js.org/concepts/hot-module-replacement/) support aswell.

## Usage

Install this package via NPM:

```bash
$ npm install seldszar/hapi-webpack
```

Now you can use the plugin by registering on Hapi:

```babel
server.register(require('hapi-webpack'), function (err) {
  // ...
});
```

You can also pass the webpack config location, the plugin will instanciate it automatically:

```node
server.register({
  register: require('hapi-webpack'),
  options: {
    compiler: './webpack.config.js',
  },
}, function (err) {
  // ...
});
```

You can also pass an existing Webpack instance:

```node
const Webpack = require('webpack');

const webpackConfig = require('./webpack.config.js');
const webpack = new Webpack(webpackConfig);

server.register({
  register: require('hapi-webpack'),
  options: {
    assets: {
      // Options from https://github.com/webpack/webpack-dev-middleware#usage
    },
    compiler: webpack,
    hot: {
      // Options from https://github.com/glenjamin/webpack-hot-middleware#config
    },
  },
}, function (err) {
  // ...
});
```

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2017 Alexandre Breteau
