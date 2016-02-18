'use strict';

var path = require('path');
var util = require('util');
var normalize = require('../update');
var utils = require('../utils');
var init = require('../init');

/**
 * Prefix the `--config` flag onto other command line options to persist
 * the value to package.json for the current project. For example,
 * if you're using `verb`, the value would be saved to the `verb` object.
 *
 * ```sh
 * # save the cwd to use for a project
 * $ --config=cwd:foo
 * # save the tasks to run for a project
 * $ --config=tasks:readme
 * # display the config
 * $ --config
 * ```
 *
 * @name config
 * @param {Object} app
 * @api public
 * @cli public
 */

module.exports = function(app) {
  return function(val, next) {
    var name = this._name.toLowerCase();
    var cwd = this.cwd || process.cwd();

    if (utils.show(val)) {
      var obj = app.pkg.get(name);
      utils.logConfig(obj, 'white');
      process.exit(0);
    }

    if (typeof val === 'string' && val === 'init') {
      init(app, function(err, answers) {
        if (err) return next(err);
        app.cli.process(answers, next);
      });
      return;
    }

    if (!utils.isObject(val)) {
      next(new Error('--config expects an object, cannot set "%s"', val));
      return;
    }

    var pkg = utils.pkg.sync(cwd);
    if (pkg === null) {
      next(new Error('cannot find package.json'));
      return;
    }

    // get package.json and update it
    var oldConfig = utils.get(pkg, name) || {};
    var merged = utils.extend({}, oldConfig, val);
    var newVal = normalize(this, merged, oldConfig);

    // show the new value in the console
    var updated = pick(newVal, val);
    var msg = utils.cyan(util.inspect(updated, null, 10));
    if (Object.keys(updated).length > 1) {
      msg = '\n' + msg;
    }
    utils.timestamp('updated package.json config with: %s', msg);

    pkg[name] = newVal;
    this.set('cache.pkg', pkg);

    var pkgPath = path.resolve(cwd, 'package.json');
    utils.writeJson.sync(pkgPath, pkg);
    next();
  };
};

function pick(pkg, obj) {
  var res = {};
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      res[key] = pkg[key];
    }
  }
  return res;
}
