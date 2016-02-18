'use strict';

var fs = require('fs');
var path = require('path');
var utils = require('lazy-cache')(require);
var fn = require;

/**
 * Lazily required module dependencies
 */

require = utils;
require('extend-shallow', 'extend');
require('unset-value', 'unset');
require('set-value', 'set');
require('get-value', 'get');
require('has-value', 'has');
require('rimraf', 'del');
require('resolve-dir');
require('write-json');
require = fn;

/**
 * Create the key to use for getting and setting values.
 * If the key contains a filepath, and the filepath has
 * dots in it, we need to escape them to ensure that
 * `set-value` doesn't split on those dots.
 */

utils.toKey = function(fp, key) {
  if (typeof fp !== 'string') {
    throw new TypeError('expected fp to be a string');
  }
  fp = fp.split('.').join('\\.');
  return fp + (key ? ('.' + key) : '');
};

/**
 * Read a JSON file.
 *
 * @param {String} `fp`
 * @return {Object}
 */

utils.readJson = function(fp) {
  try {
    var str = fs.readFileSync(path.resolve(fp), 'utf8');
    return JSON.parse(str);
  } catch (err) {}
  return {};
};

/**
 * Expose `utils`
 */

module.exports = utils;
