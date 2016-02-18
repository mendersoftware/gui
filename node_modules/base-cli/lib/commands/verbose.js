'use strict';

/**
 * Temporary
 */

module.exports = function(app) {
  return function(val, next) {
    if (val === true) {
      var keys = app.cli.keys;
      var len = keys.length;
      while (len--) {
        app.on(keys[len], console.error.bind(console));
      }
    }
    next();
  };
};
