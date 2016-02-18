/*!
 * is-affirmative <https://github.com/jonschlinkert/is-affirmative>
 *
 * Copyright (c) 2016, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var affirmative = require('affirmative');

module.exports = function(val) {
  return affirmative.indexOf(val) !== -1;
};
