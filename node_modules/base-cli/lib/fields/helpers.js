'use strict';

var utils = require('../utils');

module.exports = function(existing, app) {
  if (!utils.isObject(existing)) {
    existing = utils.arrayify(existing);
  }

  return {
    type: ['array', 'string', 'object'],
    normalize: function(val, key, config, schema) {
      if (!val) return;

      if (typeof val === 'function') {
        return val;
      }

      if (typeof val === 'string') {
        val = val.split(',');
      }

      if (!utils.isObject(val)) {
        val = utils.arrayify(val);
      } else {
        for (var prop in val) {
          var value = val[prop];
          if (typeof value === 'boolean') {
            val = [prop];
          }
        }
      }

      if (Array.isArray(val)) {
        val = utils.union([], existing, val);
        if (val.length) {
          return val;
        }
      }
      return null;
    }
  };
};
