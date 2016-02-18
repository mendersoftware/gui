/*!
 * to-choices <https://github.com/jonschlinkert/to-choices>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var isObject = require('isobject');
var extend = require('extend-shallow');
var gray = require('ansi-gray');

/**
 * Create a question object with the given `name`
 * and array of `choices`.
 *
 * ```js
 * toChoices(name[, options]);
 * ```
 * @param {String|Object} `name` Name of the question or object with a `name` property.
 * @param {Object|Array} `options` Question options or array of choices. If an array of choices is specified, the name will be used as the `message`.
 * @return {Object}
 * @api public
 */

function toChoices(name, options) {
  var opts = {};

  if (typeof name === 'string') {
    opts.name = name;
  } else if (isObject(name)) {
    opts = extend({}, options, name);
  }

  if (Array.isArray(options)) {
    opts.choices = options;
    opts.message = opts.name + '?';
  } else if (isObject(options)) {
    opts = extend({}, options, name);
  }

  if (!opts.message) {
    opts.message = opts.name;
  }

  var question = {
    type: 'checkbox',
    name: opts.name,
    message: opts.message,
    choices: []
  };

  /**
   * Create the `all` choice
   */

  if (opts.choices.length > 1) {
    question.choices.push({name: 'all', value: opts.choices});
    question.choices.push({type: 'separator', line: gray('————')});
  }

  /**
   * Generate the list of choices
   */

  opts.choices.forEach(function(item) {
    question.choices.push({ name: item });
  });
  return question;
};

/**
 * Expose `toChoices`
 */

module.exports = toChoices;
