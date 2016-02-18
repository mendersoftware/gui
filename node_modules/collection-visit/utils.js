'use strict';

/**
 * Lazily required module dependencies
 */

var utils = require('lazy-cache')(require);
require = utils; // trick browserify
require('map-visit');
require('object-visit', 'visit');

/**
 * Expose `utils`
 */

module.exports = utils;
