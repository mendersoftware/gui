'use strict';

/**
 * Bind `console.error` to the given event listener, so that when
 * event `name` is emitted, the event arguments will be output
 * in the console.
 *
 * ```sh
 * # emit errors
 * $ --emit error
 * # emit all views as they're created
 * $ --emit view
 * # emit only "pages" as they're created
 * $ --emit page
 * ```
 * @name emit
 * @api public
 * @cli public
 */

module.exports = function(app) {
  return function(name, next) {
    if (name && typeof name === 'string') {
      app.on(name, console.error.bind(console));
    }
    next();
  };
};
