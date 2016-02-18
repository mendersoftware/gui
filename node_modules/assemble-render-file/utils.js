'use strict';

/**
 * Module dependencies
 */

var utils = require('lazy-cache')(require);
var fn = require;

require = utils;
require('mixin-deep', 'merge');
require('through2', 'through');
require = fn;

/**
 * Expose `utils`
 */

module.exports = utils;
