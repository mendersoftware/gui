'use strict';

/**
 * Module dependencies
 */

var utils = require('lazy-cache')(require);
var fn = require;
require = utils;

/**
 * Lazily required module dependencies
 */

require('arr-union', 'union');
require('collection-visit', 'visit');
require('get-value', 'get');
require('kind-of', 'typeOf');
require('mixin-deep', 'merge');
require('omit-empty');
require('set-value', 'set');
require('sort-object-arrays', 'sortArrays');
require('union-value');
require = fn;

/**
 * Return true if `obj` has property `key`, and its value is
 * not undefind, null or an empty string.
 *
 * @param {any} `val`
 * @return {Boolean}
 */

utils.hasValue = function(key, obj) {
  if (!obj.hasOwnProperty(key)) {
    return false;
  }
  var val = obj[key];
  if (typeof val === 'undefined' || val === 'undefined') {
    return false;
  }
  if (val === null || val === '') {
    return false;
  }
  return true;
};

/**
 * Return true if `val` is an object, not an array or function.
 *
 * @param {any} `val`
 * @return {Boolean}
 */

utils.isObject = function(val) {
  return utils.typeOf(val) === 'object';
};

/**
 * Cast `val` to an array.
 *
 * @param {String|Array} val
 * @return {Array}
 */

utils.arrayify = function(val) {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
};

/**
 * Return the indefinite article(s) to use for the given
 * JavaScript native type or types.
 *
 * @param {String|Array} `types`
 * @return {String}
 */

utils.article = function(types) {
  if (typeof types === 'string' || types.length === 1) {
    var prefix = /^[aeiou]/.test(String(types)) ? 'an ' : 'a ';
    return prefix + types;
  }
  return types.map(function(type) {
    return utils.article(type);
  }).join(' or ');
};

/**
 * Expose `utils` modules
 */

module.exports = utils;
