/*!
 * try-open <https://github.com/jonschlinkert/try-open>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var fs = require('fs');

module.exports = function(filepath, flags, mode) {
  try {
    if (typeof flags === 'undefined') {
      flags = 'r';
    }
    return fs.openSync(filepath, flags, mode);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return false;
    } else {
      throw err;
    }
  }
};

