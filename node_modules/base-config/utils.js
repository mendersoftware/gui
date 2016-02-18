'use strict';

var path = require('path');

/**
 * Lazily-required module dependencies (makes the application
 * faster)
 */

var utils = require('lazy-cache')(require);

/**
 * Temporarily re-assign `require` to trick browserify and
 * webpack into reconizing lazy dependencies.
 *
 * This tiny bit of ugliness has the huge dual advantage of
 * only loading modules that are actually called at some
 * point in the lifecycle of the application, whilst also
 * allowing browserify and webpack to find modules that
 * are depended on but never actually called.
 */

var fn = require;
require = utils;

/**
 * Lazily required module dependencies
 */

require('isobject', 'isObject');
require('map-config', 'mapper');
require('resolve-dir', 'resolve');

/**
 * Restore `require`
 */

require = fn;

/**
 * Try to require a module, fail silently if not found.
 */

utils.tryRequire = function tryRequire(name, cwd) {
  try {
    cwd = cwd || process.cwd();
    return require(path.resolve(cwd, name));
  } catch (err) {};
  try {
    return require(name);
  } catch (err) {};
  return null;
};

/**
 * Cast the given value to an array
 */

utils.arrayify = function(val) {
  if (typeof val === 'undefined' || val === null || val === '') {
    return [];
  }
  if (typeof val === 'string') {
    return val.split(',');
  }
  return Array.isArray(val) ? val : [val];
};

function format(arr) {
  var res = '';
  arr.forEach(function(ele) {
    res += ele + '\'' + '\n';
  });
  return res;
}

/**
 * Expose `utils` modules
 */

module.exports = utils;
