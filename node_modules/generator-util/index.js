/*!
 * generate-util <https://github.com/jonschlinkert/generate-util>
 *
 * Copyright (c) 2016, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var fs = require('fs');
var path = require('path');
var debug = require('debug')('base:generator:util');
var utils = require('lazy-cache')(require);
var find = require('./lib/find');
var resolveCache = {};
var requireCache = {};

/**
 * Lazily required module dependencies
 */

var fn = require;
require = utils;
require('extend-shallow', 'extend');
require('global-modules', 'gm');
require('is-absolute');
require('kind-of', 'typeOf');
require('resolve');
require('resolve-dir');
require('try-open');
require = fn;

utils.dest = function(app) {
  var dest = app.dest;

  app.define('dest', function(dir, options) {
    var opts = utils.extend({ cwd: this.cwd }, options);
    if (typeof dir !== 'function' && typeof this.rename === 'function') {
      dir = this.rename(dir);
    }
    return dest.call(this, dir, opts);
  });
};

utils.prompt = function(app) {
  app.define('prompt', function() {
    if (app.enabled('init')) {
      app.questions.enable('force');
    }

    var args = [].slice.call(arguments);
    var cb = args.pop();
    function callback(err, answers) {
      if (err) return cb(err);
      app.data(answers);
      cb();
    }

    args.push(callback);
    return app.ask.apply(this, args);
  });
};

utils.src = function(app) {
  var src = app.src;

  app.define('src', function(patterns, options) {
    var config = { renameKey: utils.renameKey };
    config.collection = 'templates';
    config.cwd = (this.env && this.env.cwd) || process.cwd();

    var opts = utils.extend(config, options);
    return src.call(this, patterns, opts);
  });
};

utils.create = function(options) {
  return function fn(app) {
    if (this.isRegistered('custom-create')) return;
    if (!this.isApp) return;
    var create = this.create;

    this.define('create', function(name, options) {
      var env = this.env || {};
      var cwd = env.templates || path.resolve(this.cwd, 'templates');
      var config = { engine: '*', renameKey: utils.renameKey, cwd: cwd };
      var createOpts = this.option(['create', name]);
      var opts = utils.extend({}, config, createOpts, options);

      var collection = this[name];
      if (typeof collection === 'undefined') {
        collection = create.call(this, name, opts);
      } else {
        collection.option(opts);
      }
      return collection;
    });

    return fn;
  };
};

/**
 * Return a home-relative filepath
 *
 * ```js
 * utils.homeRelative('foo');
 * //=> 'dev/foo'
 * ```
 * @param {String} `filepath`
 * @return {String}
 * @api public
 */

utils.homeRelative = function(fp) {
  if (typeof fp === 'undefined') {
    throw new TypeError('utils.homeRelative expected filepath to be a string');
  }
  var dir = path.resolve(utils.resolveDir(fp));
  var home = path.resolve(utils.resolveDir('~/'));
  fp = path.relative(home, dir);
  if (fp.charAt(0) === '/') {
    fp = fp.slice(1);
  }
  return fp;
};

/**
 * Return true if a filepath exists on the file system.
 *
 * ```js
 * utils.exists('foo');
 * //=> false
 *
 * utils.exists('gulpfile.js');
 * //=> true
 * ```
 * @param {String} `filepath`
 * @return {Boolean}
 * @api public
 */

utils.exists = function(fp) {
  return fp && (typeof utils.tryOpen(fp, 'r') === 'number');
};

/**
 * Return true if a filepath exists and is a directory.
 *
 * @param {String} `filepath`
 * @return {Boolean}
 * @api public
 */

utils.isDirectory = function(fp) {
  return utils.exists(fp) && fs.statSync(fp).isDirectory();
};

/**
 * Rename the `key` used for storing views/templates
 *
 * @param {String} `key`
 * @param {Object} `view` the `renameKey` method is used by [templates][] for both setting and getting templates. When setting, `view` is exposed as the second parameter.
 * @return {String}
 * @api public
 */

utils.renameKey = function(key, view) {
  return view ? view.filename : path.basename(key, path.extname(key));
};

/**
 * Opposite of `.toFullname`, creates an "alias" from the given
 * `name` by either stripping `options.prefix` from the name, or
 * just removing everything up to the first dash. If `options.alias`
 * is a function, it will be used instead.
 *
 * ```js
 * utils.toAlias('generate-foo');
 * //=> 'foo';
 *
 * utils.toAlias('a-b-c', {prefix: 'a-b'});
 * //=> 'c';
 * ```
 *
 * @param {String} `name`
 * @param {Object} `options`
 * @return {String}
 * @api public
 */

utils.toAlias = function(name, options) {
  var opts = utils.extend({}, options);
  if (typeof opts.alias === 'function') {
    return opts.alias(name);
  }
  var prefix = opts.prefix || opts.modulename;
  if (prefix) {
    var re = new RegExp('^' + prefix + '-');
    return name.replace(re, '');
  }
  return name;
};

/**
 * Opposite of `.toAlias`, creates a generator name from the
 * given `alias` and `namespace`.
 *
 * ```js
 * utils.toFullname('foo', 'generate');
 * //=> 'generate-foo';
 *
 * utils.toFullname('generate-bar', 'generate');
 * //=> 'generate-bar'
 * ```
 * @param {String} `alias`
 * @param {String} `namespace`
 * @return {String}
 * @api public
 */

utils.toFullname = function(alias, options) {
  var opts = utils.extend({}, options);
  if (typeof opts.toFullname === 'function') {
    return opts.toFullname(alias, opts);
  }
  var prefix = opts.prefix || opts.modulename;
  if (typeof prefix === 'undefined') {
    throw new Error('expected prefix to be a string');
  }
  // if it's a filepath, just return it
  if (utils.isAbsolute(alias)) {
    return alias;
  }
  if (alias.indexOf(prefix) === -1) {
    return prefix + '-' + alias;
  }
  return alias;
};

/**
 * Returns true if (only) the `default` task is defined
 *
 * @param {Object} `opts`
 * @return {Boolean}
 */

utils.isDefaultTask = function(obj) {
  if (Array.isArray(obj)) {
    return utils.isDefaultTask({tasks: obj});
  }
  return obj.tasks
    && obj.tasks.length === 1
    && obj.tasks[0] === 'default';
};

/**
 * Create an object-path for looking up a generator.
 *
 * ```js
 * utils.toGeneratorPath('a.b.c');
 * //=> 'generators.a.generators.b.generators.c'
 * ```
 * @param {String} `name`
 * @return {String}
 * @api public
 */

utils.toGeneratorPath = function(name, prefix) {
  if (/[\\\/]/.test(name)) {
    return null;
  }
  if (name.indexOf('generators.') === 0) {
    name = name.slice('generators.'.length);
  }
  if (~name.indexOf('.')) {
    name = name.split(/\.generators\.|\./g).join('.generators.');
  }
  return prefix === false ? name : ('generators.' + name);
};

/**
 * Get a generator from `app`.
 *
 * @param {Object} `app`
 * @param {String} `name` Generator name
 * @return {Object} Returns the generator instance.
 * @api public
 */

utils.getGenerator = function(app, name) {
  return app.get(utils.toGeneratorPath(name));
};

/**
 * Return the filepath for `configfile` or undefined
 * if the file does not exist.
 *
 * @param {String} `configfile`
 * @param {Object} `options`
 * @return {String}
 */

utils.configfile = function(configfile, options) {
  debug('resolving configfile "%s"', configfile);
  var opts = utils.extend({cwd: process.cwd()}, options);
  var configpath = path.resolve(opts.cwd, configfile);
  if (!utils.exists(configpath)) {
    throw new Error('file "' + configpath + '" does not exist');
  }
  return utils.tryRequire(configpath);
};

/**
 * Try to `require.resolve` module `name`, first locally
 * then in the globaly npm directory. Fails silently
 * if not found.
 *
 * ```js
 * utils.tryResolve('foo');
 * // or
 * utils.tryResolve('generate-foo');
 * // or
 * utils.tryResolve('generate-foo', {cwd: require('global-modules')});
 * // or
 * utils.tryResolve('./foo/bar/baz.js');
 * ```
 * @param {String} `name` The name or filepath of the module to resolve
 * @param {Object} `options` Pass `options.cwd` and/or `options.configfile` (filename) to modify the path used by `resolve`.
 * @return {String|undefined}
 * @api public
 */

utils.tryResolve = function(name, options) {
  var opts = utils.extend({configfile: 'generator.js'}, options);
  debug('trying to resolve "%s"', name);

  if (opts.cwd) {
    try {
      var modulepath = utils.resolve.sync(name, {basedir: opts.cwd});
      if (modulepath) {
        resolveCache[name] = modulepath;
        return modulepath;
      }
    } catch (err) {}
  }

  var filepath = find.resolveModule(name, opts);
  if (!utils.exists(filepath)) return;
  if (resolveCache[name]) {
    return resolveCache[name];
  }

  try {
    modulepath = utils.resolve.sync(filepath);
    if (modulepath) {
      resolveCache[name] = modulepath;
      return modulepath;
    }
  } catch (err) {}
};

/**
 * Try to require the given module, failing silently if it doesn't exist.
 * The function first calls `require` on the given `name`, then tries
 * `require(path.resolve(name))` before giving up.
 *
 * ```js
 * utils.tryRequire('foo');
 * ```
 * @param  {String} `name` The module name or file path
 * @return {any|undefined} Returns the value of requiring the specified module, or `undefined` if unsuccessful.
 * @api public
 */

utils.tryRequire = function(name, options) {
  var opts = utils.extend({}, options);
  var fn;

  if (requireCache[name]) {
    return requireCache[name];
  }

  var filepath = utils.tryResolve(name, opts);
  if (!filepath) return;
  try {
    fn = require(filepath);
    if (fn) return (requireCache[name] = fn);
  } catch (err) {
    handleError(err);
  }

  try {
    fn = require(name);
    if (fn) return (requireCache[name] = fn);
  } catch (err) {
    handleError(err);
  }
};

/**
 * Modified from the `tableize` lib, which replaces
 * dashes with underscores, and we don't want that behavior.
 * Tableize `obj` by flattening and normalizing the keys.
 *
 * @param {Object} obj
 * @return {Object}
 * @api public
 */

utils.tableize = function(obj) {
  var table = {};
  flatten(table, obj, '');
  return table;
};

/**
 * Recursively flatten object keys to use dot-notation.
 *
 * @param {Object} `table`
 * @param {Object} `obj`
 * @param {String} `parent`
 */

function flatten(table, obj, parent) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      var val = obj[key];

      key = parent + key;
      if (utils.isObject(val)) {
        flatten(table, val, key + '.');
      } else {
        table[key] = val;
      }
    }
  }
}

/**
 * Placeholder
 */

function handleError(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err;
  }
}

/**
 * Returns true if the given `value` is a function.
 *
 * ```js
 * utils.isFunction('foo');
 * //=> false
 *
 * utils.isFunction(function() {});
 * //=> true
 * ```
 *
 * @param {any} `value`
 * @return {Boolean}
 * @api public
 */

utils.isFunction = function(value) {
  return utils.typeOf(value) === 'function';
};

/**
 * Returns true if the given `value` is a boolean.
 *
 * ```js
 * utils.isBoolean('foo');
 * //=> false
 *
 * utils.isBoolean(false);
 * //=> true
 * ```
 *
 * @param {any} `value`
 * @return {Boolean}
 * @api public
 */

utils.isBoolean = function(value) {
  return utils.typeOf(value) === 'boolean';
};

/**
 * Returns true if a the given `value` is a string.
 *
 * ```js
 * utils.isString('foo');
 * //=> false
 *
 * utils.isString({});
 * //=> true
 * ```
 *
 * @param {any} `value`
 * @return {Boolean}
 * @api public
 */

utils.isString = function(value) {
  return utils.typeOf(value) === 'string';
};

/**
 * Returns true if a the given `value` is an object.
 *
 * ```js
 * utils.isObject('foo');
 * //=> false
 *
 * utils.isObject({});
 * //=> true
 * ```
 *
 * @param {any} `value`
 * @return {Boolean}
 * @api public
 */

utils.isObject = function(value) {
  return utils.typeOf(value) === 'object';
};

/**
 * Cast the given `value` to an array.
 *
 * ```js
 * utils.arrayify('foo');
 * //=> ['foo']
 *
 * utils.arrayify(['foo']);
 * //=> ['foo']
 * ```
 * @param {String|Array} `value`
 * @return {Array}
 * @api public
 */

utils.arrayify = function(val) {
  return val ? (Array.isArray(val) ? val : [val]) : [];
};

/**
 * Expose `utils`
 */

module.exports = utils;

