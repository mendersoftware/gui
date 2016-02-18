'use strict';

var debug = require('debug')('base:cli:ask');
var utils = require('../utils');

/**
 * Force questions that match the given pattern to be asked. The resulting
 * answer data is merged onto `app.cache.data`.
 *
 * After questions are answered:
 *
 * - Use `app.data('answers')` to get answer data.
 * - To open the directory where data is persisted, enter `--open answers` in the command line
 *
 * ```sh
 * # ask all questions
 * $ --ask
 * # ask all `author.*` questions
 * $ --ask "author.*"
 * # ask all `*.name` questions (like `project.name` and `author.name`)
 * $ --ask "*.name*"
 * ```
 * @name ask
 * @cli public
 * @api public
 */

module.exports = function(app) {
  return function(pattern, next) {
    if (typeof app.questions === 'undefined') {
      next(new Error('expected base-questions plugin to be defined'));
      return;
    }

    debug('asking "%s"', pattern);

    // register the `question-match` plugin
    app.questions.use(utils.match());

    app.questions.match(pattern === true ? '*' : pattern)
      .on('ask', function(key, question) {
        question.force();
      })
      .ask(function(err, answers) {
        if (err) return next(err);
        debug('answers:\n%j');
        app.data(answers);
        next();
      });

  };
};
