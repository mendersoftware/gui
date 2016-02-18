'use strict';

var utils = require('../utils');

module.exports = function(existing, app) {
  existing = existing || {};
  existing.list = utils.arrayify(existing.list);

  return {
    type: ['array', 'string'],
    normalize: function(val, key, config, schema) {
      if (!val) return;

      if (utils.isObject(val)) {
        if (typeof val.list === 'undefined') {
          var list = val;
          val = { list: list };
        }
        if (typeof val.list === 'string') {
          val.list = val.list.split(',');
        }
        if (Array.isArray(val.list)) {
          val.list = utils.union([], existing.list, val.list);
        }
      }
      return val;
    }
  };
};
