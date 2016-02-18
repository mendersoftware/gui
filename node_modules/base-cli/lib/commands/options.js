'use strict';

/**
 * Set in-memory options on the `app.options` object. This is the API-equivalent of
 * calling `app.option()`. You may also use the singular `--option` flag for identical
 * behavior.
 *
 * To display currently defined options, pass the `--options` flag with no value.
 *
 * ```sh
 * $ --options=foo
 * # sets {foo: true}
 * $ --options=foo:bar
 * # sets {foo: 'bar'}
 * $ --options=foo.bar:baz
 * # sets {foo:{bar: 'baz'}}
 * ```
 * @name options
 * @alias option
 * @api public
 * @cli public
 */

module.exports = function(app) {
  return require('./option')(app);
};
