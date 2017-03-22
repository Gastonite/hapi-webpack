
const Webpack = require('webpack');
const Joi = require('joi');
const Path = require('path');
const WebpackDevMiddleware = require('webpack-dev-middleware');
const WebpackHotMiddleware = require('webpack-hot-middleware');

const internals = {};


internals.hotMiddlewareEntry = 'webpack-hot-middleware/client?path=/__webpack_hmr';
/**
 * Creates the Webpack compiler.
 *
 * @param {string|Object|Webpack} options
 * @return {Webpack}
 */
internals.makeCompiler = options => {


  console.log(options.constructor.name);
  console.log(Webpack.name);

  if (options instanceof Webpack.Compiler) {
    return options;
  }

  if (typeof options === 'string') {

    const webpackConfigPath = Path.resolve(options);

    let webpackConfig = require(webpackConfigPath);

    if (typeof webpackConfig === 'function') {
      webpackConfig = webpackConfig(process.env.NODE_ENV);
    }

    if (typeof webpackConfig.entry === 'string') {
      webpackConfig.entry = [webpackConfig.entry];
    }

    if (webpackConfig.entry instanceof Array) {

      webpackConfig.entry.push(internals.hotMiddlewareEntry);

    } else {

      Joi.assert(webpackConfig.entry, Joi.object().label('configuration entry').required());

      webpackConfig.entry.hotMiddleware = internals.hotMiddlewareEntry;
    }

    options = webpackConfig;
  }

  return new Webpack(options);
};

/**
 * Registers the plugin.
 */
exports.register = (server, options, next) => {

  options = Joi.attempt(options, Joi.object({
    config: Joi.alternatives(Joi.object(), Joi.string()).default('webpack.config.js'),
    dev: Joi.object().default(),
    hot: Joi.alternatives(Joi.boolean(), Joi.object()),
    html: Joi.alternatives(Joi.boolean(), Joi.object()),
  }).default());

  const compiler = internals.makeCompiler(options.config);

  const webpackDevMiddleware = WebpackDevMiddleware(compiler, options.dev);

  server.ext('onRequest', (request, reply) => {

    const { req, res } = request.raw;

    webpackDevMiddleware(req, res, (error) => {

      if (error) {
        return reply(error);
      }

      return reply.continue();
    });
  });

  if (options.hot) {

    const webpackHotMiddleware = WebpackHotMiddleware(compiler, options.hot);

    server.ext('onRequest', (request, reply) => {

      const { req, res } = request.raw;

      webpackHotMiddleware(req, res, (error) => {

        if (error) {
          return reply(error);
        }

        reply.continue();
      });
    });
  }

  if (options.html) {


    server.ext('onPreResponse', (request, reply) => {

      // This assumes you are using the html-webpack-plugin
      // If you are serving a static html file just reply with that file directly
      const filename = Path.join(compiler.outputPath, 'index.html');

      compiler.outputFileSystem.readFile(filename, (err, result) => {

        if (err) {
          return reply(err);
        }

        reply(result).type('text/html');
      });
    });
  }

  server.expose({ compiler });

  return next();
};

exports.register.attributes = {
  name: 'webpack',
  pkg: require('../package.json'),
  multiple: true
};
