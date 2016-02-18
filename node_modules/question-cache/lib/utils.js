'use strict';

/**
 * Module dependencies
 */

var utils = require('lazy-cache')(require);
var fn = require;
require = utils;

/**
 * Module dependencies
 */

require('inquirer2', 'inquirer');
require('kind-of', 'typeOf');
require('mixin-deep', 'merge');
require('get-value', 'get');
require('has-value', 'has');
require('set-value', 'set');

/**
 * Restore `require`
 */

require = fn;

/**
 * Expose `utils` modules
 */

module.exports = utils;
