'use strict';

var utils = require('lazy-cache')(require);
var fn = require;

/**
 * Lazily required module dependencies
 */

require = utils;
require('inquirer2', 'inquirer');
require('answer-store', 'Answer');
require('arr-union', 'union');
require('async');

// object
require('define-property', 'define');
require('get-value', 'get');
require('has-value', 'has');
require('set-value', 'set');
require('mixin-deep', 'merge');
require('object-visit', 'visit');
require('isobject', 'isObject');

// path/fs
require('global-modules', 'gm');
require('project-name', 'project');
require('resolve-dir');
require = fn;

/**
 * Force exit if "ctrl+c" is pressed
 */

utils.forceExit = function() {
  var stdin = process.stdin;
  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding('utf8');
  stdin.setMaxListenders(0);
  stdin.on('data', function(key) {
    if (key === '\u0003') {
      process.stdout.write('\u001b[1A');
      process.exit();
    }
  });
};

/**
 * Cast val to an array
 */

utils.arrayify = function(val) {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
};

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
 * Return true if `str` equals `key` or has `key` as a
 * sub-string.
 *
 * @param {String} `key`
 * @param {String} `str`
 * @return {Boolean}
 */

utils.hasKey = function(key, str) {
  if (typeof str !== 'string') {
    return false;
  }
  if (key === str) {
    return true;
  }
  if (str.indexOf('.') === -1) {
    return false;
  }
  if (str.indexOf(key) === 0) {
    return true;
  }
  return false;
};

/**
 * Returns true if a value is an object and appears to be a
 * question object.
 */

utils.isQuestion = function(val) {
  return utils.isObject(val) && (val.isQuestion || !utils.isOptions(val));
};

/**
 * Returns true if a value is an object and has one or more question
 * objects as properties.
 */

utils.hasQuestion = function(obj) {
  if (!utils.isObject(obj)) return false;
  for (var key in obj) {
    if (obj[key].isQuestion) {
      return true;
    }
  }
  return false;
};

/**
 * Return an answer with dot notation in answer keys fully expanded.
 */

utils.toAnswer = function(key, answer) {
  var val = utils.isObject(answer) ? answer[key] : answer;
  var res = {};
  utils.set(res, key, val);
  return res;
};

/**
 * Returns true if a value is an object and appears to be an
 * options object.
 */

utils.isOptions = function(val) {
  if (!utils.isObject(val)) {
    return false;
  }
  if (val.hasOwnProperty('locale')) {
    return true;
  }
  if (val.hasOwnProperty('force')) {
    return true;
  }
  if (val.hasOwnProperty('type')) {
    return false;
  }
  if (val.hasOwnProperty('message')) {
    return false;
  }
  if (val.hasOwnProperty('choices')) {
    return false;
  }
  if (val.hasOwnProperty('name')) {
    return false;
  }
};

/**
 * Expose `utils`
 */

module.exports = utils;
