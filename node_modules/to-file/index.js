/*!
 * to-file <https://github.com/jonschlinkert/to-file>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var path = require('path');
var utils = require('./utils');

module.exports = function toFile(filepath, pattern, options) {
  if (!utils.isValidGlob(pattern)) {
    options = pattern;
    pattern = null;
  }

  var opts = utils.extend({}, options);

  var file = utils.isObject(opts.file) ? opts.file : { contents: null };
  file.cwd = path.resolve(opts.cwd || '');
  file.base = opts.base || '';
  file.path = path.resolve(file.cwd, filepath);

  if (!file.base && pattern) {
    var glob = pattern;
    if (Array.isArray(glob)) {
      glob = pattern[0];
    }
    var base = utils.parent(glob);
    if (base !== '.') {
      file.base = base;
    }
  }

  var File = typeof opts.File !== 'function'
    ? utils.File
    : opts.File;

  file = new File(file);
  if (opts.stat) {
    file.stat = opts.stat;
    delete opts.stat;
  }

  if (file.base === '.') {
    file.base = '';
  }

  file.options = opts;
  file.options.orig = filepath;

  if (!file.stat) stats(file);
  contents(file, opts);
  return file;
};

function stats(file) {
  utils.define(file, '_stat', null);
  utils.define(file, 'stat', {
    get: function() {
      return this._stat || (this._stat = utils.tryStat(file.path));
    }
  });
}

function contents(file, opts) {
  utils.define(file, '_contents', null);
  utils.define(file, 'contents', {
    get: function() {
      utils.contents.sync(this, opts);
      return this._contents;
    },
    set: function(val) {
      this._contents = val;
    }
  });
}
