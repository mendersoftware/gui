/*!
 * session-cache <https://github.com/doowb/session-cache>
 *
 * Copyright (c) 2014-2015, Brian Woodward.
 * Licensed under the MIT License.
 */

'use strict';

/**
 * Session storage
 */

var storage = require('./lib/storage');

/**
 * Backup cache
 */

var cache = require('./lib/cache');


/**
 * Create a session with the given `name`
 *
 * ```js
 * var session = require('session')('your app');
 * ```
 *
 * @name createSession
 * @param  {String} `name`
 * @return {Object}
 * @api public
 */

module.exports = function createSession(name) {
  var session = storage.get(name) || storage.create(name);
  var res = {
    name: session.name
  };

  /**
   * Set a heuristic for determining if the session
   * is actually active.
   *
   * @return {Boolean} Returns `true` if session is active
   * @api private
   */

  var isActive = function isActive() {
    try {
      var key = '___session is active___';
      return session.get(key) || session.set(key, true);
    } catch (err) {
      return false;
    }
  };

  /**
   * Create a context to run in.
   *
   * @param {Function} `fn` function to run in the session context
   * @api private
   */

  res.run = session.run.bind(session);

  /**
   * Bind a function to the current Session context.
   *
   * ```js
   * function fn (options, next) {
   *   next();
   * }
   * session.bind(fn);
   * ```
   *
   * @param {Function} `fn` Function to bind.
   * @api public
   */

  res.bind = session.bind.bind(session);

  /**
   * Bind an EventEmitter or Stream to the current Session context.
   *
   * ```js
   * var stream = through.obj();
   * session.bindEmitter(stream);
   * ```
   *
   * @param {EventEmitter|Stream} `emitter` EventEmitter or Stream to bind.
   * @api public
   */

  res.bindEmitter = session.bindEmitter.bind(session);

  /**
   * Assign `value` on the current session to `key`.
   *
   * @param {String} `key`
   * @param  {*} `value`
   * @return {*} Returns the set value.
   * @api public
   */

  res.set = function set(key, value) {
    if (isActive()) {
      return session.set(key, value);
    }
    return cache.set(key, value);
  };

  /**
   * Get the stored value of `key` from the current session.
   *
   * @param  {String} `key`
   * @return {*} Value of the key or undefined
   * @api public
   */

  res.get = function get(key) {
    if (isActive()) {
      return session.get(key);
    }
    return cache.get(key);
  };

  return res;
};
