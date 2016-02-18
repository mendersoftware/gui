/*!
 * option-cache <https://github.com/jonschlinkert/option-cache>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var Emitter = require('component-emitter');
var utils = require('./utils');

/**
 * Create a new instance of `Options`.
 *
 * ```js
 * var app = new Options();
 * ```
 *
 * @param {Object} `options` Initialize with default options.
 * @api public
 */

function Options(options) {
  if (!(this instanceof Options)) {
    return new Options(options);
  }
  this.options = options || {};
}

/**
 * `Options` prototype methods.
 */

Options.prototype = Emitter({
  constructor: Options,

  /**
   * Set or get an option.
   *
   * ```js
   * app.option('a', true);
   * app.option('a');
   * //=> true
   * ```
   * @name .option
   * @param {String} `key` The option name.
   * @param {*} `value` The value to set.
   * @return {*} Returns a `value` when only `key` is defined.
   * @api public
   */

  option: function(key, value) {
    if (Array.isArray(key)) {
      if (arguments.length > 1) {
        key = utils.toPath(key);

      } else if (typeof key[0] === 'string') {
        key = utils.toPath(arguments);
      }
    }

    if (typeof key === 'string') {
      if (arguments.length === 1) {
        return utils.get(this.options, key);
      }
      utils.set(this.options, key, value);
      this.emit('option', key, value);
      return this;
    }

    var type = utils.typeOf(key);
    if (type !== 'object' && type !== 'array') {
      var msg = 'expected option to be '
        + 'a string, object or array';
      throw new TypeError(msg);
    }

    var args = [].slice.call(arguments);
    if (type === 'array') {
      args = utils.flatten(args);
    }
    this.visit('option', args);
    return this;
  },

  /**
   * Return true if `options.hasOwnProperty(key)`
   *
   * ```js
   * app.hasOption('a');
   * //=> false
   * app.option('a', 'b');
   * app.hasOption('a');
   * //=> true
   * ```
   * @name .hasOption
   * @param {String} `prop`
   * @return {Boolean} True if `prop` exists.
   * @api public
   */

  hasOption: function(key) {
    var prop = utils.toPath(arguments);
    return prop.indexOf('.') === -1
      ? this.options.hasOwnProperty(prop)
      : utils.has(this.options, prop);
  },

  /**
   * Enable `key`.
   *
   * ```js
   * app.enable('a');
   * ```
   * @name .enable
   * @param {String} `key`
   * @return {Object} `Options`to enable chaining
   * @api public
   */

  enable: function(key) {
    this.option(key, true);
    return this;
  },

  /**
   * Disable `key`.
   *
   * ```js
   * app.disable('a');
   * ```
   * @name .disable
   * @param {String} `key` The option to disable.
   * @return {Object} `Options`to enable chaining
   * @api public
   */

  disable: function(key) {
    this.option(key, false);
    return this;
  },

  /**
   * Check if `prop` is enabled (truthy).
   *
   * ```js
   * app.enabled('a');
   * //=> false
   *
   * app.enable('a');
   * app.enabled('a');
   * //=> true
   * ```
   * @name .enabled
   * @param {String} `prop`
   * @return {Boolean}
   * @api public
   */

  enabled: function(key) {
    var prop = utils.toPath(arguments);
    return Boolean(this.option(prop));
  },

  /**
   * Check if `prop` is disabled (falsey).
   *
   * ```js
   * app.disabled('a');
   * //=> true
   *
   * app.enable('a');
   * app.disabled('a');
   * //=> false
   * ```
   * @name .disabled
   * @param {String} `prop`
   * @return {Boolean} Returns true if `prop` is disabled.
   * @api public
   */

  disabled: function(key) {
    var prop = utils.toPath(arguments);
    return !Boolean(this.option(prop));
  },

  /**
   * Returns true if the value of `prop` is strictly `true`.
   *
   * ```js
   * app.option('a', 'b');
   * app.isTrue('a');
   * //=> false
   *
   * app.option('c', true);
   * app.isTrue('c');
   * //=> true
   *
   * app.option({a: {b: {c: true}}});
   * app.isTrue('a.b.c');
   * //=> true
   * ```
   * @name .isTrue
   * @param {String} `prop`
   * @return {Boolean} Uses strict equality for comparison.
   * @api public
   */

  isTrue: function(key) {
    var prop = utils.toPath(arguments);
    return this.option(prop) === true;
  },

  /**
   * Returns true if the value of `key` is strictly `false`.
   *
   * ```js
   * app.option('a', null);
   * app.isFalse('a');
   * //=> false
   *
   * app.option('c', false);
   * app.isFalse('c');
   * //=> true
   *
   * app.option({a: {b: {c: false}}});
   * app.isFalse('a.b.c');
   * //=> true
   * ```
   * @name .isFalse
   * @param {String} `prop`
   * @return {Boolean} Uses strict equality for comparison.
   * @api public
   */

  isFalse: function(key) {
    var prop = utils.toPath(arguments);
    return this.option(prop) === false;
  },

  /**
   * Return true if the value of key is either `true`
   * or `false`.
   *
   * ```js
   * app.option('a', 'b');
   * app.isBoolean('a');
   * //=> false
   *
   * app.option('c', true);
   * app.isBoolean('c');
   * //=> true
   * ```
   * @name .isBoolean
   * @param {String} `key`
   * @return {Boolean} True if `true` or `false`.
   * @api public
   */

  isBoolean: function(key) {
    var prop = utils.toPath(arguments);
    return typeof this.option(prop) === 'boolean';
  },

  /**
   * Visit `method` over each object in the given collection.
   *
   * @param  {String} `method`
   * @param  {Array|Object} `value`
   */

  visit: function(method, collection) {
    utils.visit(this, method, collection);
    return this;
  }
});

/**
 * Expose `Options`
 */

module.exports = Options;
