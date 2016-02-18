'use strict';

var fs = require('fs');
var path = require('path');
var utils = require('./utils');

function loader(patterns, config) {
  if (utils.isObject(patterns)) {
    config = patterns;
    patterns = null;
  }

  config = config || {};

  return function plugin(app) {
    function defaults(options) {
      var opts = utils.merge({cwd: process.cwd()}, this.options, config);
      return utils.merge({}, opts, options || {});
    }

    var viewFn = this.isApp ? this.view.bind(this) : null;
    if (!viewFn && this.isViews) {
      viewFn = this.addView.bind(this);
    }

    app.define('load', function(patterns, options) {
      var opts = defaults.call(this, options);
      var cache = {};
      var load = utils.loader(cache, opts, viewFn);
      load.apply(this, arguments);
      return cache;
    });

    if (!this.isViews) return plugin;

    this.define('loadView', function(filepath, options) {
      if (utils.hasGlob(filepath)) {
        throw new Error('loadView does not support globs, only filepaths.');
      }

      var opts = defaults.call(this, options);
      var fp = path.resolve(opts.cwd, filepath);
      return this.addView(fp, {
        contents: fs.readFileSync(fp)
      });
    });

    this.define('loadViews', function(patterns, options) {
      var opts = defaults.call(this, options);
      var load = utils.loader({}, opts, this.addView.bind(this));
      load.apply(this, arguments);
      return this;
    });

    var addViews = this.addViews;
    this.define('addViews', function(key, value) {
      if (utils.isGlob(key, value) || utils.isFilepath(key, value)) {
        return this.loadViews.apply(this, arguments);
      }
      return addViews.apply(this, arguments);
    });

    var addView = this.addView;
    this.define('addView', function(key, value) {
      if (utils.isFilepath(key, value)) {
        return this.loadView.apply(this, arguments);
      }
      return addView.apply(this, arguments);
    });

    /**
     * If a glob pattern is passed on the outer function,
     * pass it to `loadViews` for the collection
     */

    if (utils.isValidGlob(patterns)) {
      this.loadViews(patterns, defaults.call(this));
    }
    return this;
  };
}

/**
 * Expose `loader`
 */

module.exports = loader;
