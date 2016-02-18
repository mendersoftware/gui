/*!
 * base-store <https://github.com/jonschlinkert/base-store>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var path = require('path');
var utils = require('./utils');

module.exports = function(name, options) {
  if (typeof name !== 'string') {
    options = name;
    name = undefined;
  }

  if (typeof name === 'undefined') {
    name = utils.project(process.cwd());
  }

  return function(app) {
    if (this.isRegistered('store')) return;

    var opts = utils.extend({}, options, app.options.store);
    var store = utils.store(name, opts);
    var keys;

    this.define('store', store);

    /**
     * Bubble up specific events to `app`
     */

    this.store.on('set', function(key, val) {
      app.emit('store.set', key, val);
      app.emit('store', 'set', key, val);
    });
    this.store.on('get', function(key, val) {
      app.emit('store.get', key, val);
      app.emit('store', 'get', key, val);
    });
    this.store.on('del', function(key, val) {
      app.emit('store.del', key, val);
      app.emit('store', 'del', key, val);
    });

    /**
     * Adds a namespaced "sub-store", where
     * the `cwd` is in the same directory as
     * the "parent" store.
     */

    this.store.create = function(subname) {
      var root = path.dirname(store.path);
      opts.cwd = path.join(root, name);

      if (typeof subname === 'undefined') {
        subname = utils.project(process.cwd());
      }

      keys = keys || (keys = getKeys(store));
      if (keys.indexOf(subname) !== -1) {
        throw formatError(subname);
      }

      var custom = utils.store(subname, opts);
      store[subname] = custom;
      return custom;
    };
  };
};

function formatError(name) {
  var msg = 'Cannot create store: '
    + '"' + name + '", since '
    + '"' + name + '" is a reserved property key. '
    + 'Please choose a different store name.';
  return new Error(msg);
}

function getKeys(obj) {
  var keys = [];
  for (var key in obj) keys.push(key);
  return keys;
}
