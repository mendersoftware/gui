'use strict';

var utils = require('lazy-cache')(require);
var fn = require;
require = utils;

/**
 * Module dependencies
 */

require('expand-object', 'expand');
require('kind-of', 'typeOf');
require('mixin-deep', 'merge');
require('set-value', 'set');
require = fn;

/**
 * Expose `utils`
 */

module.exports = utils;
