/*!
 * base-data <https://github.com/jonschlinkert/base-data>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var utils = require('./utils');

module.exports = function(prop, defaults) {
  if (typeof prop === 'object') {
    defaults = prop;
    prop = 'cache.data';
  }
  if (typeof prop === 'undefined') {
    prop = 'cache.data';
  }

  return function plugin() {
    if (this.isRegistered(prop)) return;

    if (!utils.has(this, prop)) {
      this.set(prop, {});
    }

    if (!this.dataLoaders) {
      this.define('dataLoaders', []);
    }

    /**
     * Register a data loader for loading data onto `app.cache.data`.
     *
     * ```js
     * var yaml = require('js-yaml');
     *
     * app.dataLoader('yml', function(str, fp) {
     *   return yaml.safeLoad(str);
     * });
     *
     * app.data('foo.yml');
     * //=> loads and parses `foo.yml` as yaml
     * ```
     *
     * @name .dataLoader
     * @param  {String} `ext` The file extension for to match to the loader
     * @param  {Function} `fn` The loader function.
     * @api public
     */

    this.define('dataLoader', function(name, fn) {
      this.dataLoaders.push({name: name, fn: fn});
      return this;
    });

    /**
     * Load data onto `app.cache.data`
     *
     * ```js
     * console.log(app.cache.data);
     * //=> {};
     *
     * app.data('a', 'b');
     * app.data({c: 'd'});
     * console.log(app.cache.data);
     * //=> {a: 'b', c: 'd'}
     *
     * // set an array
     * app.data('e', ['f']);
     *
     * // overwrite the array
     * app.data('e', ['g']);
     *
     * // update the array
     * app.data('e', ['h'], true);
     * console.log(app.cache.data.e);
     * //=> ['g', 'h']
     * ```
     * @name .data
     * @param {String|Object} `key` Key of the value to set, or object to extend.
     * @param {any} `val`
     * @return {Object} Returns the instance of `Template` for chaining
     * @api public
     */

    this.define('data', function (key, value, union) {
      var args = [].slice.call(arguments);
      var type = utils.typeOf(key);

      this.emit('data', args);

      if (type === 'object') {
        args = utils.flatten(args);
        var len = args.length, i = -1;
        while (++i < len) {
          utils.mergeValue(this, prop, args[i]);
        }
        return this;
      }

      if (utils.isGlob(key, value)) {
        var opts = utils.extend({}, defaults, this.options);
        if (utils.isObject(args[args.length - 1])) {
          opts = utils.extend({}, opts, args.pop());
        }
        args.push(opts);
        var files = utils.resolve.sync.apply(null, args);
        var len = files.length, i = -1;
        while (++i < len) {
          readFile(this, files[i], opts);
        }
        return this;
      }

      if (type === 'array' && arguments.length === 1) {
        this.visit('data', key);
        return this;
      }

      if (type === 'string') {
        var opts = utils.extend({}, defaults, this.options);
        var last = args[args.length - 1];

        if (utils.isOptions(last)) {
          opts = utils.extend({}, opts, args.pop());
        }

        if (args.length === 1) {
          var res = readFile(this, key, opts);
          if (res === null) {
            return this.get(prop + '.' + key);
          }
          return this;
        }

        key = prop + '.' + key;
        if (typeof value === 'string') {
          utils.set(this, key, value);
          return this;
        }

        if (Array.isArray(value)) {
          if (union) {
            utils.unionValue(this, key, value);
          } else {
            utils.set(this, key, value);
          }
          return this;
        }

        utils.mergeValue(this, key, value);
        return this;
      }

      var msg = 'expected data to be '
        + 'a string, object or array';
      throw new TypeError(msg);
    });

    function readFile(app, fp, options) {
      var fns = utils.matchLoaders(app.dataLoaders, fp);
      if (!fns) return null;

      var opts = utils.extend({}, app.options, options);
      var name = utils.basename(fp);
      var val = utils.tryRead(fp);
      if (val === null) return null;

      var len = fns.length, i = -1;
      while (++i < len) {
        var fn = fns[i];
        val = fn.call(app, val, fp);
      }

      if (opts.namespace || opts.renameKey) {
        app.data(utils.namespace(fp, val, opts));
      } else {
        app.data(val);
      }
      return val;
    }
  };
};

/**
 * Expose `utils`
 */

module.exports.utils = utils;
