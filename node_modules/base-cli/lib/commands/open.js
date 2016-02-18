'use strict';

var path = require('path');
var utils = require('../utils');

/**
 * Open a directory, or open a file in the default application associated
 * with the file type.
 *
 * ```sh
 * # Open the directory where answer data is persisted
 * $ --open answers
 * # Open the directory where store data is persisted
 * $ --open store
 * ```
 * @name open
 * @api public
 * @cli public
 */

module.exports = function(app) {
  return function(dir, next) {
    var place = 'file';

    if (dir === 'store') {
      dir = app.get('store.path');
      place = 'store';

    } else if (dir === 'answers') {
      dir = app.get('answers.path');
      place = 'answers';
    }

    dir = path.resolve(path.dirname(dir));

    if (!utils.exists(dir)) {
      console.log(place + ' path "%s" does not exist', dir);
      process.exit(1);
    }

    var relative = utils.gutil.homeRelative(dir);
    utils.timestamp('opening ' + place + ' directory', utils.magenta('~/' + relative));
    utils.opn(path.resolve(dir));
    next();
  };
};
