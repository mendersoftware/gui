'use strict';

/**
 * Alias for `--tasks`. Run the given generators and tasks. This
 * flag is unnecessary when used with [base-runner][].
 *
 * ```sh
 * # run task "foo"
 * $ app --task foo
 * #=> {task: ['foo']}
 * # run generator "foo", task "bar"
 * $ app --task foo:bar
 * #=> {task: ['foo:bar']}
 * ```
 * @name tasks
 * @api public
 * @cli public
 */

module.exports = function(app) {
  return require('./tasks')(app);
};
