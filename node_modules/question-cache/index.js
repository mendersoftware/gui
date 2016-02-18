/*!
 * question-cache <https://github.com/jonschlinkert/question-cache>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var utils = require('./lib/utils');

/**
 * Create an instance of `Questions` with the
 * given `options`.
 *
 * ```js
 * var inquirer = require('inquirer')
 * var questions = new Questions({inquirer: inquirer});
 * ```
 *
 * @param {Object} `options` Pass your instance of [inquirer] on the `inquirer` option.
 * @api public
 */

function Questions(options) {
  if (!(this instanceof Questions)) {
    return new Questions(options);
  }
  if (isObject(options) && 'prompt' in options) {
    options = {inquirer: options};
  }

  this.options = options || {};
  var inquirer = this.options.inquirer;
  if (typeof inquirer === 'undefined') {
    inquirer = utils.inquirer();
  }

  define(this, 'inquirer', inquirer);
  delete this.options.inquirer;
  this.cache = {};
  this.queue = [];
}

/**
 * Store a question object by `key`.
 *
 * ```js
 * questions.set('name', {
 *   type: 'input',
 *   message: 'Project name?',
 *   default: 'undefined'
 * });
 * ```
 *
 * @param {String} `key` Unique question id.
 * @param {Object} `value` Question object that follows [inquirer] conventions.
 * @api public
 */

Questions.prototype.set = function(key, value) {
  if (typeof key === 'undefined') {
    throw new TypeError('expected set to be a string or object.');
  }

  if (typeof key === 'object') {
    value = key;
    key = value.name;
  }

  if (typeof value === 'string') {
    value = {message: value};
  } else if (typeof key === 'string' && !value) {
    value = {message: addQmark(key)};
  }

  value = value || {};
  if (isObject(key)) {
    value = utils.merge({}, value, key);
  }

  value.type = value.type || 'input';
  value.name = value.name || value.key || key;

  utils.set(this.cache, key, value);
  this.queue.push(value);
  return this;
};

/**
 * Get a question by `key`.
 *
 * ```js
 * questions.get('name');
 * //=> {type: 'input', message: 'What is your name?', default: ''}
 * ```
 *
 * @param {String} `key` Unique question id.
 * @param {Object} `value` Question object that follows [inquirer] conventions.
 * @api public
 */

Questions.prototype.get = function(key) {
  return utils.get(this.cache, key);
};

/**
 * Return true if the given question name is stored on
 * question-cache.
 *
 * ```js
 * var exists = questions.has('name');
 * //=> true or false
 * ```
 *
 * @param {String} `key` Unique question id.
 * @param {Object} `value` Question object that follows [inquirer] conventions.
 * @api public
 */

Questions.prototype.has = function(key) {
  return utils.has(this.cache, key);
};

/**
 * Returns an array of question objects from an array of keys. Keys
 * may use dot notation.
 *
 * @param  {Array} `keys` Question names or object paths.
 * @return {Array} Array of question objects.
 * @api public
 */

Questions.prototype.resolve = function(keys) {
  keys = arrayify(keys);
  var len = keys.length, i = -1;
  var questions = [];

  while (++i < len) {
    var question = {};
    var key = keys[i];

    if (typeof key === 'string') {
      question = this.get(key);
    } else if (isObject(key)) {
      question = this.normalizeObject(key);
    }

    if (!question) {
      question = this.toQuestion(key);
    }

    if (question.hasOwnProperty('type')) {
      questions.push(question);
      continue;
    }

    for (var prop in question) {
      this.set(prop, question[prop]);
      var val = this.get(prop);

      if (question.hasOwnProperty(prop)) {
        questions.push(val);
      }
    }
  }
  return questions;
};

/**
 * Normalize questions into a consistent object format
 * following [inquirer][] conventions.
 *
 * @param {Object} `questions`
 * @param {Object} `options`
 * @return {Object}
 */

Questions.prototype.normalizeObject = function(questions) {
  var res = [];

  for (var key in questions) {
    if (questions.hasOwnProperty(key)) {
      var val = questions[key];
      var question;

      if (typeof val === 'string') {
        question = this.toQuestion(key, val);

      } else if (typeof val === 'object') {
        question = this.toQuestion(key, val);
      }

      if (question) res = res.concat(question);
    }
  }
  return res;
};

/**
 * Create a question object from a string. Uses the `input` question type,
 * and does the following basic normalization:
 *
 *   - when `foo` is passed, a `?` is added to the question. e.g. `foo?`
 *   - when `foo?` is passed, `?` is removed on the question key, so the answer to `foo?` is
 *   `{foo: 'bar'}`
 *
 * @param  {String} `key`
 * @return {Object} Returns a question object.
 * @api public
 */

Questions.prototype.toQuestion = function(key, value) {
  var obj = {};
  if (isReserved(key) && typeof value === 'string') {
    obj[key] = value;

  } else if (typeof key === 'string') {
    obj.name = key;

  } else if (typeof value === 'string') {
    obj.message = value;
  }
  if (isObject(value)) {
    obj = utils.merge({}, obj, value);
  }
  obj.name = stripQmark(obj.name || key);
  if (!obj.message) {
    obj.message = addQmark(obj.name);
  }
  obj.type = obj.type || 'input';
  return obj;
};

/**
 * Ask a question or array of questions.
 *
 * ```js
 * questions.ask(['name', 'homepage']);
 * //=> { name: 'foo', homepage: 'https://github/foo' }
 * ```
 *
 * @param {String} `key` Unique question id.
 * @param {Object} `value` Question object that follows [inquirer] conventions.
 * @api public
 */

Questions.prototype.ask = function(keys, cb) {
  if (isObject(keys)) keys = [keys];

  var questions = [];
  if (typeof keys === 'function') {
    cb = keys;
    questions = this.queue;
  } else {
    questions = this.resolve(keys);
  }

  if (questions.length === 0) {
    return cb(new Error('no questions found.'));
  }

  try {
    this.prompt(questions, function(answers) {
      cb(null, setEach({}, answers));
    });
  } catch(err) {
    cb(err);
  }
};

/**
 * Exposes the `prompt` method on [inquirer] as a convenience.
 *
 * ```js
 * questions.prompt({
 *   type: 'list',
 *   name: 'chocolate',
 *   message: 'What\'s your favorite chocolate?',
 *   choices: ['Mars', 'Oh Henry', 'Hershey']
 * }, function(answers) {
 *   //=> {chocolate: 'Hershey'}
 * });
 * ```
 *
 * @param {Object|Array} `question` Question object or array of question objects.
 * @param {Object} `callback` Callback function.
 * @api public
 */

Questions.prototype.prompt = function() {
  return this.inquirer.prompt.apply(this.inquirer, arguments);
};

/**
 * Utility for setting values on properties defined using
 * dot notation (object paths).
 *
 * @param {object} `obj` Object to store values on.
 * @param {object} `answers` Answers object.
 */

function setEach(obj, answers) {
  for (var key in answers) {
    if (answers.hasOwnProperty(key)) {
      utils.set(obj, key, answers[key]);
    }
  }
  return obj;
}

function addQmark(str) {
  if (str && str.slice(-1) !== '?') {
    return str + '?';
  }
  return str;
}

function stripQmark(str) {
  if (str && str.slice(-1) === '?') {
    return str.slice(0, -1);
  }
  return str;
}

function isReserved(key) {
  return ['name', 'input', 'message'].indexOf(key) > -1;
}

/**
 * Utility for casting a value to an array.
 */

function arrayify(val) {
  return val ? (Array.isArray(val) ? val : [val]) : [];
}

/**
 * Utility for casting a value to an array.
 */

function isObject(val) {
  return utils.typeOf(val) === 'object';
}

/**
 * Utility for definining a non-enumerable property.
 */

function define(obj, prop, val) {
  Object.defineProperty(obj, prop, {
    configurable: true,
    enumerable: false,
    writable: true,
    value: val
  });
}

/**
 * Expose `Questions`
 */

module.exports = Questions;
