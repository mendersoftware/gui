/*!
 * async-helpers <https://github.com/doowb/async-helpers>
 *
 * Copyright (c) 2015, Brian Woodward.
 * Licensed under the MIT License.
 */

'use strict';

var utils = require('./utils');
var cache = {};

/**
 * Create a new instance of AsyncHelpers
 *
 * ```js
 * var asyncHelpers = new AsyncHelpers();
 * ```
 *
 * @param {Object} `options` options to pass to instance
 * @param {Function} `createPrefix` Create the id prefix given a prefix and current global counter.
 * @param {Function} `createId` Create the entire id given an already generated prefix and the current instance counter.
 * @param {Function} `createRegExp` Create the regex string that will be passed to `new RegExp` for testing if an async id placeholder exists. Takes the current prefix value.
 * @return {Object} new AsyncHelpers instance
 * @api public
 */

function AsyncHelpers (options) {
  if (!(this instanceof AsyncHelpers)) {
    return new AsyncHelpers(options);
  }
  options = options || {};
  this.options = options;
  this.prefix = options.prefix || '{$ASYNCID$';
  this.helpers = {};
  this.stash = {};
  this.counter = 0;
  this.globalCounter = AsyncHelpers.globalCounter++;
}

/**
 * Keep track of instances created for generating globally
 * unique ids
 *
 * @type {Number}
 */

AsyncHelpers.globalCounter = 0;

/**
 * Add a helper to the cache.
 *
 * ```js
 * asyncHelpers.set('upper', function (str, cb) {
 *   cb(null, str.toUpperCase());
 * });
 * ```
 *
 * @param {String} `name` Name of the helper
 * @param {Function} `fn` Helper function
 * @return {Object} Returns `this` for chaining
 * @api public
 */

AsyncHelpers.prototype.set = function(name, fn) {
  if (typeof name !== 'string') {
    throw new TypeError('AsyncHelpers#set expects `name` to be a string.');
  }
  this.helpers[name] = fn;
  return this;
};

/**
 * Get all helpers or a helper with the given name.
 *
 * ```js
 * var helpers = asyncHelpers.get();
 * var wrappedHelpers = helperAync.get({wrap: true});
 * ```
 *
 * @param  {String} `name` Optionally pass in a name of a helper to get.
 * @param  {Object} `options` Additional options to use.
 *   @option {Boolean} `wrap` Wrap the helper(s) with async processing capibilities
 * @return {Function|Object} Single helper function when `name` is provided, otherwise object of all helpers
 * @api public
 */

AsyncHelpers.prototype.get = function(name, opts) {
  if (name == null) {
    throw new TypeError('AsyncHelpers#get expects a string or object.');
  }

  if (typeof name === 'object') {
    opts = name;
    name = null;
  }

  opts = opts || {};
  if (opts.wrap) {
    return this.wrap(name);
  }

  return typeof name === 'string'
    ? this.helpers[name]
    : this.helpers;
};

/**
 * Wrap a helper or object of helpers with an async handler function.
 *
 * @param  {String|Object} `name` Helper or object of helpers
 * @return {Object} Wrapped helper(s)
 */

function wrap(name) {
  if (name == null) {
    throw new TypeError('async-helpers wrap expects a string or object.');
  }
  var helper = this.helpers[name];
  if (typeof helper === 'object') {
    for (var key in helper) {
      helper[key] = wrapper(key, helper[key], this);
    }
    return helper;
  } else {
    return wrapper(name, helper, this);
  }
}

/**
 * Returns a wrapper function for a single helper.
 *
 * @param  {String} `name` The name of the helper
 * @param  {Function} `fn` The actual helper function
 * @param  {Object} `thisArg` Context
 * @return {String} Returns an async ID to use for resolving the value. ex: `{$ASYNCID$!$8$}`
 */

function wrapper(name, fn, thisArg) {
  var prefix = createPrefix(thisArg.prefix, thisArg.globalCounter, thisArg.options);

  return function() {
    var argRefs = [];
    var len = arguments.length;
    var args = new Array(len);

    for (var i = len - 1; i >= 0; i--) {
      var arg = args[i] = arguments[i];

      // store references to other async helpers (string === '__async_0_1')
      if (typeof arg === 'string') {
        var matches = arg.match(new RegExp(createRegExp(prefix, thisArg.options), 'g'));
        if (matches) {
          argRefs.push({arg: arg, idx: i});
        }
      }
    }

    // generate a unique ID for the wrapped helper
    var id = createId(prefix, thisArg.counter++, thisArg.options);
    var obj = {
      id: id,
      name: name,
      fn: fn,
      args: args,
      argRefs: argRefs
    };

    thisArg.stash[obj.id] = obj;
    return obj.id;
  };
}

/**
 * Wrap a helper with async handling capibilities.
 *
 * ```js
 * var wrappedHelper = asyncHelpers.wrap('upper');
 * var wrappedHelpers = asyncHelpers.wrap();
 * ```
 *
 * @param  {String} `name` Optionally pass the name of the helper to wrap
 * @return {Function|Object} Single wrapped helper function when `name` is provided, otherwise object of all wrapped helpers.
 * @api public
 */

AsyncHelpers.prototype.wrap = function(name) {
  if (name) return wrap.call(this, name);

  var res = {};
  for (var key in this.helpers) {
    res[key] = this.wrap(key);
  }
  return res;
};

/**
 * Reset all the stashed helpers.
 *
 * ```js
 * asyncHelpers.reset();
 * ```
 *
 * @return {Object} Returns `this` to enable chaining
 * @api public
 */

AsyncHelpers.prototype.reset = function() {
  this.stash = {};
  this.counter = 0;
  return this;
};

/**
 * Resolve a stashed helper by the generated id.
 *
 * ```js
 * var upper = asyncHelpers.get('upper', {wrap: true});
 * var id = upper('doowb');
 * asyncHelpers.resolveId(id, function (err, result) {
 *   console.log(result);
 *   //=> DOOWB
 * });
 * ```
 *
 * @param  {String} `key` ID generated when from executing a wrapped helper.
 * @param  {Function} `cb` Callback function with the results of executing the async helper.
 * @api public
 */

AsyncHelpers.prototype.resolveId = function(key, cb) {
  if (typeof cb !== 'function') {
    throw new Error('AsyncHelpers#resolveId() expects a callback function.');
  }

  if (typeof key !== 'string') {
    cb(new Error('AsyncHelpers#resolveId() expects `key` to be a string.'));
  }

  var prefix = createPrefix(this.prefix, this.globalCounter, this.options);
  var re = cache[prefix] || (cache[prefix] = new RegExp(createRegExp(prefix, this.options)));
  var stashed = this.stash[key];
  if (!stashed) {
    return cb(new Error('Unable to resolve ' + key + '. Not Found'));
  }

  if (typeof stashed.fn !== 'function') {
    return cb(null, stashed.fn);
  }

  var self = this;
  utils.async.series([
    function (next) {
      if (stashed.argRefs.length > 0) {
        utils.async.each(stashed.argRefs, function (ref, next2) {
          self.resolveId(ref.arg, function (err, value) {
            if (err) return next2(err);
            stashed.args[ref.idx] = value;
            next2();
          });
        }, next);
      } else {
        next();
      }
    },
    function (next) {
      next = once(next);
      var res = null;
      var args = stashed.args;

      if (stashed.fn.async) {
        args = args.concat(function (err, result) {
          if (err) return next(formatError(err, stashed, args));
          if (re.test(result)) {
            return self.resolveIds(result, next);
          }
          return next(err, result);
        });
      }
      try {
        res = stashed.fn.apply(stashed.thisArg, args);
        if (re.test(res)) {
          return self.resolveIds(res, next);
        }
      } catch (err) {
        return next(formatError(err, stashed, args));
      }
      if (!stashed.fn.async) {
        return next(null, res);
      }
    }
  ], function (err, results) {
    if (typeof results[1] !== 'undefined') {
      // update the fn so if it's called again it'll just return the true results
      stashed.fn = results[1];
      return cb(err, stashed.fn);
    } else {
      return cb(err, '');
    }
  });

};

AsyncHelpers.prototype.resolveIds = function(str, cb) {
  if (typeof cb !== 'function') {
    throw new TypeError('AsyncHelpers#resolveIds() expects a callback function.');
  }
  if (typeof str !== 'string') {
    return cb(new TypeError('AsyncHelpers#resolveIds() expects a string.'));
  }

  var self = this;
  // `stash` contains the objects created when rendering the template
  var stashed = this.stash;
  utils.async.eachSeries(Object.keys(stashed), function (key, next) {
    // check to see if the async ID is in the rendered string
    if (str.indexOf(key) === -1) {
      return next(null);
    }

    self.resolveId(key, function (err, value) {
      if (err) return next(err);
      // replace the async ID with the resolved value
      str = str.split(key).join(value);
      next(null);
    });
  }, function (err) {
    if (err) return cb(err);
    cb(null, str);
  });
};

function once (fn) {
  return function () {
    if (fn.called) return fn.value;
    fn.called = true;
    fn.value = fn.apply(fn, arguments);
    return fn.value;
  };
}

function formatError(err, helper, args) {
  args = args.filter(function (arg) {
    if (!arg || typeof arg === 'function') {
      return false;
    }
    return true;
  }).map(function (arg) {
    return utils.stringify(arg);
  });

  err.reason = '"' +  helper.name
    + '" helper cannot resolve: `'
    + args.join(', ') + '`';
  err.helper = helper;
  err.args = args;
  return err;
}

function createPrefix(prefix, counter, options) {
  options = options || {};
  if (typeof options.createPrefix === 'function') {
    return option.createPrefix(prefix, counter);
  }
  return prefix + counter + '$';
}

function createId(prefix, counter, options) {
  options = options || {};
  if (typeof options.createId === 'function') {
    return option.createId(prefix, counter);
  }
  return prefix + counter + '$}';
}

function createRegExp(prefix, options) {
  options = options || {};
  if (typeof options.createRegExp === 'function') {
    return option.createRegExp(prefix);
  }
  return prefix.split('$').join('\\\$') + '(\\d)+\\$}'
}

/**
 * Expose `AsyncHelpers`
 */

module.exports = AsyncHelpers;
