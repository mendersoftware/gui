/*!
 * base-config <https://github.com/jonschlinkert/base-config>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var path = require('path');
var utils = require('./utils');

/**
 * Expose `config`
 */

module.exports = function(options) {
  return create('config', options);
};

/**
 * Create a function for mapping `app` properties onto the
 * given `prop` namespace.
 *
 * @param {String} `prop` The namespace to use
 * @param {Object} `argv`
 * @return {Object}
 * @api public
 */

function create(prop, options) {
  if (typeof prop !== 'string') {
    throw new Error('expected the first argument to be a string.');
  }

  options = options || {};

  return function(app) {
    if (this.isRegistered('base-' + prop)) return;

    if (typeof options.is === 'string') {
      if (!app[options.is]) return;
    }

    // emit the plugin for debugging
    app.emit('plugin', prop, app, options);

    // map config
    var config = utils.mapper(app, options)
      .alias('options', 'option')
      .map('option')
      .map('data')
      .map('store', store(app.store))
      .map('set')
      .map('del')
      .map('enable')
      .map('disable')
      .map('has', function(prop) {
        utils.arrayify(prop).forEach(function(key) {
          app.has(key);
        });
      })
      .map('get', function(prop)  {
        utils.arrayify(prop).forEach(function(key) {
          app.get(key);
        });
      })
      .map('cwd', function(cwd) {
        app.set('options.cwd', cwd);
      })
      .map('use', function(names) {
        utils.arrayify(names).forEach(function(name) {
          var cwd = app.get('options.cwd') || process.cwd();
          app.use(utils.tryRequire(name, cwd));
        });
      });

    // Expose `prop` (config) on the instance
    app.define(prop, proxy(config));

    // Expose `process` on app[prop]
    app[prop].process = config.process;
  };

  function store(app) {
    if (!app) return {};
    var mapper = utils.mapper(app)
      .map('get')
      .map('set')
      .map('del')

    app.define(prop, proxy(mapper));
    return mapper;
  }
}


/**
 * Proxy to support `app.config` as a function or object
 * with methods, allowing the user to do either of
 * the following:
 *
 * ```js
 * base.config({foo: 'bar'});
 *
 * // or
 * base.config.map('foo', 'bar');
 * ```
 */

function proxy(config) {
  function fn(key, val) {
    if (typeof val === 'string') {
      config.alias.apply(config, arguments);
      return config;
    }

    if (typeof key === 'string') {
      config.map.apply(config, arguments);
      return config;
    }

    if (!utils.isObject(key)) {
      throw new TypeError('expected key to be a string or object');
    }

    for (var prop in key) {
      fn(prop, key[prop]);
    }
    return config;
  }
  fn.__proto__ = config;
  return fn;
}

/**
 * Expose `create`
 */

module.exports.create = create;
