'use strict';

/**
 * Lazily required module dependencies
 */

var utils = require('lazy-cache')(require);
var fn = require;

require = utils;
require('assemble-handle', 'handle');
require('extend-shallow', 'extend');
require('through2', 'through');
require('stream-combiner', 'combine');
require('vinyl-fs', 'vfs');
require = fn;

/**
 * Expose `utils`
 */

module.exports = utils;
