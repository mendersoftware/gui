'use strict';

var utils = require('./utils');

module.exports = function(options) {
  return function(app) {
    this.data = this.data || {};

    /**
     * Set data to be used for answering questions, or as default answers
     * when `force` is true.
     *
     * ```js
     * questions.setData('foo', 'bar');
     * // or
     * questions.setData({foo: 'bar'});
     * ```
     * @param {String|Object} `key` Property name to set, or object to merge onto `questions.data`
     * @param {any} `val` The value to assign to `key`
     * @api public
     */

    this.mixin('setData', function(key, val) {
      if (utils.isObject(key)) {
        return this.visit('setData', key);
      }
      utils.set(this.data, key, val);
      this.emit('data', key, val);
      return this;
    });

    /**
     * Return true if property `key` has a value on `questions.data`.
     *
     * ```js
     * questions.hasData('abc');
     * ```
     * @param {String} `key` The property to lookup.
     * @return {Boolean}
     * @api public
     */

    this.mixin('hasData', function(key) {
      return utils.has(this.data, key);
    });

    /**
     * Get the value of property `key` from `questions.data`.
     *
     * ```js
     * questions.setData('foo', 'bar');
     * questions.getData('foo');
     * //=> 'bar'
     * ```
     * @param {String} `key` The property to get.
     * @return {any} Returns the value of property `key`
     * @api public
     */

    this.mixin('getData', function(key) {
      return utils.get(this.data, key);
    });
  };
};
