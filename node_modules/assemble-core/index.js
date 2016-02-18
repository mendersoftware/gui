'use strict';

/**
 * module dependencies
 */

var Templates = require('templates');
var utils = require('./utils');

/**
 * Create an `assemble` application. This is the main function exported
 * by the assemble module.
 *
 * ```js
 * var assemble = require('assemble');
 * var app = assemble();
 * ```
 * @param {Object} `options` Optionally pass default options to use.
 * @api public
 */

function Assemble(options) {
  if (!(this instanceof Assemble)) {
    return new Assemble(options);
  }

  this.options = options || {};
  Templates.call(this, options);
  this.name || 'assemble';

  /**
   * Load core plugins
   */

  this.use(utils.tasks(this.name));
  this.use(utils.fs());
  this.use(utils.streams);
  this.use(utils.render());
}

/**
 * `Assemble` prototype methods
 */

Templates.extend(Assemble);

/**
 * Expose the `Assemble` constructor
 */

module.exports = Assemble;

/**
 * Expose static properties for unit tests
 */

Assemble.utils = Templates.utils;
Assemble._ = Templates._;
