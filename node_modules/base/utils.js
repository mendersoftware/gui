'use strict';

/**
 * Module dependencies
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
require = utils; // eslint-disable-line

/**
 * Lazily required module dependencies
 */

require('set-value', 'set');
require('get-value', 'get');
require('unset-value', 'del');
require('collection-visit', 'visit');
require('define-property', 'define');
require('to-object-path', 'toPath');
require('class-utils', 'cu');

/**
 * Restore `require`
 */

require = fn; // eslint-disable-line

/**
 * Run an array of functions by passing each function
 * to a method on the given object specified by the given property.
 *
 * @param  {Object} `obj` Object containing method to use.
 * @param  {String} `prop` Name of the method on the object to use.
 * @param  {Array} `arr` Array of functions to pass to the method.
 */

utils.run = function(obj, prop, arr) {
  var len = arr.length, i = 0;
  while (len--) {
    obj[prop](arr[i++]);
  }
};

/**
 * Expose `utils` modules
 */

module.exports = utils;
