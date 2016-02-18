/*!
 * question-store <https://github.com/jonschlinkert/question-store>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var use = require('use');
var path = require('path');
var utils = require('./utils');

/**
 * Create new `Question` store `name`, with the given `options`.
 *
 * ```js
 * var question = new Question(name, options);
 * ```
 * @param {String} `name` The question property name.
 * @param {Object} `options` Store options
 * @api public
 */

function Question(name, val, options) {
  if (utils.isObject(name)) {
    return new Question(name.name, name, val);
  }

  if (typeof val === 'string') {
    val = { message: val };
  }

  if (typeof name === 'string' && !val) {
    val = { message: name };
  }

  this.options = utils.merge({}, options, val);
  this.isQuestion = true;
  this.cache = {};
  this.name = name;

  this.init(this.options);
}

/**
 * Initialize defaults
 */

Question.prototype.init = function(opts) {
  opts.locale = opts.locale || 'en';
  opts.type = opts.type || 'input';
  opts.name = this.name;
  opts.message = opts.message || this.name;

  utils.define(this, 'inquirer', opts.inquirer || utils.inquirer());
  delete opts.inquirer;

  this.answer = new utils.Answer(this.name, opts);
  this.project = this.answer.project;
  use(this);

  if (opts.debug === true) return;

  this.inspect = function() {
    var msg = opts.message;
    if (msg[msg.length - 1] !== '?') msg += '?';
    var val = this.answer.get(this.locale) || 'nothing yet';
    return '<Question "' + msg + '" <' + val + '>>';
  };
};

/**
 * Return true if the question has been answered for the current locale
 * and the current working directory.
 *
 * ```js
 * question.set('foo', 'bar');
 * ```
 * @param {String} `locale` Optionally pass a locale
 * @api public
 */

Question.prototype.set = function(key, val) {
  utils.set(this, key, val);
  return this;
};

/**
 * Get `key` from the question.
 *
 * ```js
 * question.set('foo', 'bar');
 * question.get('foo');
 * //=> 'bar'
 * ```
 * @param {String} `key`
 * @api public
 */

Question.prototype.get = function(key) {
  return utils.get(this, key);
};

/**
 * Return true if the question has been answered for the current locale
 * and the current working directory.
 *
 * ```js
 * question.hasAnswer(locale);
 * ```
 * @param {String} `locale` Optionally pass a locale
 * @api public
 */

Question.prototype.hasAnswer = function(locale) {
  return this.answer.has(locale) || this.answer.hasDefault(locale);
};

/**
 * Erase the answer for a question.
 *
 * ```js
 * question.erase();
 * question.hasAnswer();
 * //=> false
 * ```
 * @return {Boolean}
 * @api public
 */

Question.prototype.erase = function(locale) {
  this.answer.erase();
  return this;
};

/**
 * Force the question to be asked.
 *
 * ```js
 * question.options.force = true;
 * question.isForced();
 * //=> true
 * ```
 * @return {Boolean}
 * @api public
 */

Question.prototype.force = function() {
  this.options.force = true;
  return this;
};

/**
 * Return true if the question will be forced (asked even
 * if it already has an answer).
 *
 * ```js
 * question.options.force = true;
 * question.isForced();
 * //=> true
 * ```
 * @return {Boolean}
 * @api public
 */

Question.prototype.isForced = function() {
  return this.options.force === true || this.options.init === true;
};

/**
 * Ask the question.
 *
 * - If an answer has already been stored for the current locale and cwd it will be returned directly without asking the question.
 * - If `options.force` is **true**, the answer will be asked asked even if the answer is already stored.
 * - If `options.save` is **false**, the answer will not be persisted to the file system, and the question will be re-asked each time `.ask()` is called (which means it's also not necessary to define `force` when `save` is false).
 *
 * ```js
 * question.ask({force: true}, function(err, answer) {
 *   console.log(answer);
 * });
 * ```
 * @param {Object|Function} `options` Question options or callback function
 * @param {Function} `callback` callback function
 * @api public
 */

Question.prototype.ask = function(options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  var opts = utils.merge({}, this.options, options);
  var answer = this.answer.get(opts.locale);

  if (this.hasAnswer(opts.locale) && opts.force !== true) {
    cb(null, utils.toAnswer(opts.name, answer));
    return;
  }

  if (opts.skip === true) {
    cb();
    return;
  }

  if (typeof answer !== 'undefined') {
    opts.default = typeof answer[this.name] !== 'undefined'
      ? answer[this.name]
      : answer;
  }

  if (typeof opts.default === 'undefined' || opts.default === null) {
    delete opts.default;
  }

  setImmediate(function() {
    this.inquirer.prompt(opts, function(answer) {
      var val = utils.get(answer, opts.name);
      if (opts.isDefault === true) {
        this.answer.setDefault(val);
      }
      if (opts.save !== false && !opts.isDefault && val !== opts.default) {
        this.answer.set(val);
      }
      cb(null, utils.set({}, opts.name, val));
    }.bind(this));
  }.bind(this));
};

/**
 * Persist the answer to the file system for the current locale and cwd.
 *
 * ```js
 * question.save();
 * ```
 */

Question.prototype.save = function() {
  this.answer.save();
  return this;
};

/**
 * Getter/setter for answer cwd
 */

Object.defineProperty(Question.prototype, 'cwd', {
  set: function(cwd) {
    this.cache.cwd = cwd;
  },
  get: function() {
    if (this.cache.cwd) {
      return this.cache.cwd;
    }
    var cwd = this.options.cwd || process.cwd();
    return (this.cache.cwd = cwd);
  }
});

/**
 * Getter/setter for answer dest
 */

Object.defineProperty(Question.prototype, 'dest', {
  set: function(dest) {
    this.answer.dest = dest;
    this.cache.dest = dest;
  },
  get: function() {
    if (this.cache.dest) {
      return this.cache.dest;
    }
    var dest = utils.resolveDir(this.options.dest || '~/answers');
    this.answer.dest = dest;
    this.cache.dest = dest;
    return dest;
  }
});

/**
 * Getter/setter for answer path
 */

Object.defineProperty(Question.prototype, 'path', {
  set: function(fp) {
    this.cache.path = fp;
  },
  get: function() {
    if (this.cache.path) {
      return this.cache.path;
    }
    var fp = path.resolve(this.dest, this.name + '.json');
    return (this.cache.path = fp);
  }
});

/**
 * Getter/setter for answer path
 */

Object.defineProperty(Question.prototype, 'locale', {
  set: function(locale) {
    this.cache.locale = locale;
  },
  get: function() {
    return this.cache.locale || this.options.locale || 'en';
  }
});

/**
 * Expose `Question`
 */

module.exports = Question;
