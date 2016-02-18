'use strict';

/**
 * Backup cache when session is inactive
 */

function Cache() {
  this.cache = {};
}

Cache.prototype.set = function(key, value) {
  this.cache[key] = value;
  return this;
};

Cache.prototype.get = function(key) {
  if (key == null) {
    return this.cache;
  }
  return this.cache[key];
};

module.exports = new Cache();