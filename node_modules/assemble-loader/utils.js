'use strict';

/**
 * Lazily required module dependencies
 */

var utils = require('lazy-cache')(require);

/**
 * Trick browserify into recognizing lazy-cached modules
 */

var fn = require;
require = utils;
require('file-contents', 'contents');
require('mixin-deep', 'merge');
require('load-templates', 'loader');
require('isobject', 'isObject');
require('is-valid-glob');
require('has-glob');
require = fn;

utils.isGlob = function(key, val) {
  if (typeof val === 'undefined' || utils.isObject(val)) {
    return utils.hasGlob(key);
  }
  return false;
};

/**
 * Return true if the given value is an object.
 * @return {Boolean}
 */

utils.hasAny = function(obj, keys) {
  var len = keys.length;
  while (len--) {
    if (obj.hasOwnProperty(keys[len])) {
      return true;
    }
  }
  return false;
};

/**
 * Return true if the given value looks like an options
 * object.
 */

utils.isOptions = function(val) {
  if (!utils.isObject(val)) {
    return false;
  }
  if (val.isView || val.isItem) {
    return false;
  }
  return utils.hasAny(val, ['base', 'cwd']);
};

/**
 * Return true if a key looks like a valid filepath,
 * not a glob pattern or the key for a view object
 * and not a view.
 */

utils.isFilepath = function(key, value) {
  return (typeof key === 'string' && typeof value === 'undefined')
    || utils.isOptions(value);
};

/**
 * Expose utils
 */

module.exports = utils;
