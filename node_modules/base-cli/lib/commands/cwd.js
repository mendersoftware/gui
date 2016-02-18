'use strict';

var path = require('path');
var utils = require('../utils');

/**
 * Set the current working directory.
 *
 * ```sh
 * # set working directory to "foo"
 * $ --cwd=foo
 * # display cwd
 * $ --cwd
 * ```
 * @name cli
 * @api public
 * @cli public
 */

module.exports = function(app) {
  return function(val, next) {
    if (utils.show(val)) {
      console.log('cwd: "%s"', app.cwd);
      process.exit(0);
    }

    val = path.resolve(val);
    app.cwd = val;

    if (typeof app.option === 'function') {
      app.option('cwd', val);
    } else {
      app.options.cwd = val;
      app.emit('option', 'cwd', val);
    }
    next();
  };
};
