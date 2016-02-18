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

require('common-questions');
require('for-own');
require('get-value', 'get');
require('is-valid-glob');
require('micromatch', 'mm');
require('mixin-deep', 'merge');
require('question-store', 'questions');
require('set-value', 'set');
require('to-choices');
require = fn;

/**
 * Expose `utils` modules
 */

module.exports = utils;
