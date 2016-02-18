/*!
 * base-options <https://github.com/jonschlinkert/base-options>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

module.exports = function(options) {
  var Options = require('option-cache');
  var extend = require('extend-shallow');

  // shallow clone options
  var opts = extend({}, options);

  return function fn(app) {
    if (this.isRegistered('base-options')) return;

    // original constructor reference
    var ctor = this.constructor;
    Options.call(this, extend(this.options, opts));

    this.visit('define', Options.prototype);

    // restore original constructor
    this.constructor = ctor;

    // prevent the plugin from
    //  being passed to `run`
    if (opts.run !== false) {
      return fn;
    }
  };
};
