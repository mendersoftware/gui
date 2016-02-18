/*!
 * composer-runtimes <https://github.com/doowb/composer-runtimes>
 *
 * Copyright (c) 2015, Brian Woodward.
 * Licensed under the MIT License.
 */

'use strict';

var utils = require('lazy-cache')(require);
var fn = require;
require = utils;

require('ansi-gray', 'gray');
require('ansi-cyan', 'cyan');
require('time-stamp', 'time');
require('ansi-green', 'green');
require('pretty-time', 'pretty');
require('ansi-magenta', 'magenta');
require('extend-shallow', 'extend');
require('success-symbol', 'success');
require = fn;

/**
 * Colors noop
 */

utils.clear = function(str) {
  return str;
};

/**
 * Expose `utils`
 */

module.exports = utils;

