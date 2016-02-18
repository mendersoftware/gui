'use strict';

var util = require('util');
var gutil = require('generator-util');
var utils = require('lazy-cache')(require);
var fn = require;
require = utils;

/**
 * Lazily required module dependencies
 */

utils.gutil = gutil;

// misc
require('empty-dir');
require('opn');
require('try-open');

// data/object utils
require('ansi-colors', 'colors');
require('base-config', 'config');
require('base-questions', 'ask');
require('extend-shallow', 'extend');
require('fancy-log', 'timestamp');
require('is-affirmative');
require('kind-of', 'typeOf');
require('get-value', 'get');
require('set-value', 'set');
require('arr-union', 'union');
require('map-schema', 'Schema');
require('question-match', 'match');

// naming
require('namify');
require('load-pkg', 'pkg');
require('project-name', 'project');
require('write-json');
require = fn;

utils.cyan = utils.colors.cyan;
utils.green = utils.colors.green;
utils.magenta = utils.colors.magenta;
utils.tableize = gutil.tableize;
utils.homeRelative = gutil.homeRelative;

/**
 * Return true if a filepath exists on the file system
 */

utils.logConfig = function(val, color) {
  console.log(utils[color || 'cyan'](util.inspect(val, null, 10)));
  console.log();
  console.log(utils.green(' ✔'), 'finished');
};

// logger noop
utils.white = function(msg) {
  return msg;
};

/**
 * Returns true if `val` is true or is an object with `show: true`
 *
 * @param {String} `val`
 * @return {Boolean}
 * @api public
 */

utils.show = function(val) {
  return val === true || (utils.isObject(val) && val.show === true);
};

/**
 * Return true if a filepath exists on the file system
 */

utils.exists = function(fp) {
  return fp && (typeof utils.tryOpen(fp, 'r') === 'number');
};

/**
 * Cast `val` to an array
 *
 * @param {String|Array} `val`
 * @return {Array}
 */

utils.arrayify = function(val) {
  return val ? (Array.isArray(val) ? val : [val]) : [];
};

/**
 * Return true if a value is an object.
 */

utils.isObject = function(val) {
  return utils.typeOf(val) === 'object';
};

/**
 * Return true if a directory exists and is empty.
 *
 * @param  {*} val
 * @return {Array}
 */

utils.isEmpty = function(dir) {
  return utils.emptyDir(dir, function(fp) {
    return !/\.DS_Store/i.test(fp);
  });
};

/**
 * Expose `utils`
 */

module.exports = utils;
