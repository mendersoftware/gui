/*!
 * base-cli <https://github.com/jonschlinkert/base-cli>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var utils = require('./lib/utils');
var cli = require('./lib/cli');

module.exports = function(options) {
  options = options || {};

  return function(app) {
    this.use(utils.ask());
    this.use(utils.config.create('cli'));
    cli(this, options.keys || []);
  };
};
