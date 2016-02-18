/*!
 * assemble-render-file <https://github.com/jonschlinkert/assemble-render-file>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var utils = require('./utils');

/**
 * Render a vinyl file.
 *
 * ```js
 * app.src('*.hbs')
 *   .pipe(app.renderFile());
 * ```
 *
 * @name .renderFile
 * @param  {Object} `locals` Optionally locals to pass to the template engine for rendering.
 * @return {Object}
 * @api public
 */

module.exports = function(config) {
  return function(app) {
    config = utils.merge({}, app.options, config);

    app.define('renderFile', function(engine, locals) {
      if (typeof engine !== 'string') {
        locals = engine;
        engine = null;
      }

      var opts = {};
      if (locals && !locals.isCollection) {
        opts = utils.merge({}, config, locals);
      }

      var View = opts.View || opts.File || app.View;

      return utils.through.obj(function(file, enc, next) {
        if (file.isNull()) {
          return next(null, file);
        }

        if (!file.isView) file = new View(file);

        // run `onLoad` middleware
        app.handleView('onLoad', file);

        // create the context to pass to templates
        var ctx = utils.merge({}, app.cache.data, locals, file.data);
        ctx.engine = resolveEngine(app, ctx, engine);

        if (!ctx.engine && app.option('engineStrict') === false) {
          next(null, file);
          return;
        }

        // render the file
        app.render(file, ctx, function(err, res) {
          if (err) {
            err.file = file;
            next(err);
            return;
          }

          if (engine) delete res.fn;
          next(null, res);
        });
      });
    });
  };
};

function resolveEngine(app, ctx, engine) {
  ctx.engine = engine || ctx.engine;

  // allow a `noop` engine to be defined
  if (!ctx.engine && app.engines['.noop']) {
    ctx.engine = '.noop';
  }

  return ctx.engine;
}
