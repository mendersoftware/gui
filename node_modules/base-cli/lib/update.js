'use strict';

var debug = require('debug')('base:cli:config');
var fields = require('./fields');
var utils = require('./utils');

/**
 * Normalize the config object to be written to either `app.store.data`
 * or the user's local config. Local config is usually a property on
 * package.json, but may also be a separate file.
 */

module.exports = function(app, config, existing) {
  var opts = utils.extend({omitEmpty: true, sortArrays: false}, app.options);
  opts.keys = ['run', 'toc', 'layout', 'options', 'data', 'tasks', 'plugins', 'related', 'reflinks'];

  var schema = new utils.Schema(opts);
  var omit = opts.omit || [];

  for (var key in fields) {
    if (!~omit.indexOf(key) && fields.hasOwnProperty(key)) {
      debug('adding schema field "%s"', key);
      schema.field(key, fields[key](existing[key], app));
    }
  }
  return schema.normalize(config);
};

