/*!
 * answer-store <https://github.com/jonschlinkert/answer-store>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var path = require('path');
var utils = require('./utils');

/**
 * Create new `Answer` store `name`, with the given `options`.
 *
 * @param {String} `name` The answer property name.
 * @param {Object} `options` Store options
 * @api public
 */

function Answer(name, options) {
  if (typeof name !== 'string') {
    throw new TypeError('expected the first argument to be a string');
  }

  this.cache = {};
  this.options = options || {};
  this.name = name;

  /**
   * Custom inspect method
   */

  if (this.options.debug !== true) {
    this.inspect = function() {
      var answer = '"' + this.get(this.locale) + '"';
      return '<Answer ' + this.locale + ': ' + answer + '>';
    };
  }
}

/**
 * Store the specified `value` for the current (or given) local, at the current cwd.
 *
 * ```js
 * answer.set('foo');
 * ```
 * @param {any} `value` The answer value.
 * @param {String} `locale` Optionally pass the locale to use, otherwise the default locale is used.
 * @api public
 */

Answer.prototype.set = function(val, locale) {
  utils.set(this.data, this.toKey(locale), val);
  this.save();
  return this;
};

/**
 * Get the stored answer for the current (or given) `locale` at the current `cwd`.
 *
 * ```js
 * answer.get(locale);
 * ```
 * @param {String} `locale` Optionally pass the locale to use, otherwise the default locale is used.
 * @api public
 */

Answer.prototype.get = function(locale) {
  return utils.get(this.data, this.toKey(locale));
};

/**
 * Return true if an answer has been stored for the current
 * (or given) locale at the working directory.
 *
 * ```js
 * answer.has('foo');
 * ```
 * @param {String} `locale` Optionally pass the locale to use, otherwise the default locale is used.
 * @api public
 */

Answer.prototype.has = function(locale) {
  return utils.has(this.data, this.toKey(locale));
};

/**
 * Delete the stored values for the current (or given) locale, at the current cwd.
 *
 * ```js
 * answer.del(locale);
 * ```
 * @param {String} `locale` Optionally pass the local to delete.
 * @api public
 */

Answer.prototype.del = function(locale) {
  utils.unset(this.data, this.toKey(locale));
  this.save();
  return this;
};

/**
 * Erase all stored values and delete the answer store from the file system.
 *
 * ```js
 * answer.erase();
 * ```
 * @api public
 */

Answer.prototype.erase = function() {
  this.data = {};
  utils.del.sync(this.path);
  return this;
};

/**
 * Persist the answer to disk.
 *
 * ```js
 * answer.save();
 * ```
 */

Answer.prototype.save = function() {
  utils.writeJson.sync(this.path, this.data);
};

/**
 * Set the default answer for the currently defined `locale`.
 *
 * ```js
 * answer.setDefault('foo');
 * ```
 * @param {String} `locale` Optionally pass the locale to use, otherwise the default locale is used.
 * @api public
 */

Answer.prototype.setDefault = function(val, locale) {
  utils.set(this.data, this.defaultKey(locale), val);
  this.save();
  return this;
};

/**
 * Get the default answer for the currently defined `locale`.
 *
 * ```js
 * answer.getDefault();
 * ```
 * @param {String} `locale` Optionally pass the locale to use, otherwise the default locale is used.
 * @api public
 */

Answer.prototype.getDefault = function(locale) {
  return utils.get(this.data, this.defaultKey(locale));
};

/**
 * Return true if a value is stored for the current (or given) locale, at the current cwd.
 *
 * ```js
 * answer.hasDefault(locale);
 * ```
 * @param {String} `locale` Optionally pass the locale to use, otherwise the default locale is used.
 * @api public
 */

Answer.prototype.hasDefault = function(locale) {
  return utils.has(this.data, this.defaultKey(locale));
};

/**
 * Delete the stored values for the current (or given) locale.
 *
 * ```js
 * answer.delDefault(locale);
 * ```
 * @param {String} `locale` Optionally pass the local to delete.
 * @api public
 */

Answer.prototype.delDefault = function(locale) {
  utils.unset(this.data, this.defaultKey(locale));
  this.save();
};

/**
 * Create the property key to use for getting and setting
 * the `default` value for the current locale.
 */

Answer.prototype.defaultKey = function(locale) {
  return (locale || this.locale) + '.default';
};

/**
 * Create the property key to use for getting and setting
 * values for the current locale and cwd.
 */

Answer.prototype.toKey = function(locale) {
  return utils.toKey(locale || this.locale, this.cwd);
};

/**
 * Getter/setter for answer.data
 */

Object.defineProperty(Answer.prototype, 'data', {
  set: function(data) {
    this.cache.data = data;
    this.save();
  },
  get: function() {
    if (this.cache.data) {
      return this.cache.data;
    }
    return (this.cache.data = utils.readJson(this.path));
  }
});

/**
 * Getter/setter for answer cwd
 */

Object.defineProperty(Answer.prototype, 'cwd', {
  set: function(cwd) {
    this.cache.cwd = cwd;
  },
  get: function() {
    var cwd = this.cache.cwd || this.options.cwd || process.cwd();
    return (this.cache.cwd = cwd);
  }
});

/**
 * Getter/setter for answer dest
 */

Object.defineProperty(Answer.prototype, 'dest', {
  set: function(dest) {
    this.cache.dest = dest;
  },
  get: function() {
    if (this.cache.dest) {
      return this.cache.dest;
    }
    var dest = utils.resolveDir(this.options.dest || '~/answers');
    return (this.cache.dest = dest);
  }
});

/**
 * Getter/setter for answer path
 */

Object.defineProperty(Answer.prototype, 'path', {
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

Object.defineProperty(Answer.prototype, 'locale', {
  set: function(locale) {
    this.cache.locale = locale;
  },
  get: function() {
    return this.cache.locale || this.options.locale || 'en';
  }
});

/**
 * Expose `Answer`
 */

module.exports = Answer;
