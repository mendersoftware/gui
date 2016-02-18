'use strict';

var util = require('util');
var utils = require('../utils');

/**
 * Set data on the `app.cache.data` object. This is the API-equivalent of
 * calling `app.data()`.
 *
 * ```sh
 * $ --data
 * # display data object
 * $ --data=foo
 * # sets {foo: true}
 * $ --data=foo:bar
 * # sets {foo: 'bar'}
 * $ --data=foo.bar:baz
 * # sets {foo:{bar: 'baz'}}
 * ```
 * @name data
 * @api public
 * @cli public
 */

module.exports = function(app) {
  return function(val, next) {
    if (utils.show(val)) {
      console.log(utils.cyan(util.inspect(app.cache.data, null, 10)));
      process.exit(0);
    }

    if (typeof app.data === 'function') {
      app.data(val);
    } else {
      app.cache.data = utils.extend({}, app.cache.data, val);
    }
    next();
  };
};
