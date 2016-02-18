/*!
 * base-questions <https://github.com/jonschlinkert/base-questions>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var utils = require('./utils');

module.exports = function(options) {
  return function(app) {
    if (this.isRegistered('base-questions')) return;

    var opts = utils.merge({}, this.options, options);
    var setQuestions = false;

    /**
     * Load questions to ask. Answers are passed to templates as context.
     */

    function lazyQuestions(app) {
      if (setQuestions) return;
      setQuestions = true;
      opts.questions = utils.commonQuestions(opts.questions);
      for (var key in opts.questions) {
        app.questions.visit(key, opts.questions[key]);
      }
      delete opts.questions;

      app.questions.on('ask', function(key, question, answers) {
        if (isForced(key, opts)) {
          question.force();
          return;
        }

        var answer = app.data(key) || app.store.get(key);
        if (typeof answer !== 'undefined') {
          question.answer.set(answer);
        }
      });
    }

    // decorate the `questions` instance onto `app`
    this.define('questions', {
      set: function(val) {
        this.define('questions', val);
      },
      get: function fn() {
        if (this._questions) return this._questions;
        var Questions = utils.questions;
        var questions = new Questions(opts);
        this.define('_questions', questions);
        lazyQuestions(this);
        return questions;
      }
    });

    /**
     * Create a "choices" question from an array.
     *
     * ```js
     * app.choices('foo', ['a', 'b', 'c']);
     * // or
     * app.choices('foo', {
     *   message: 'Favorite letter?',
     *   choices: ['a', 'b', 'c']
     * });
     * // then
     * app.ask('foo', function(err, answer) {
     *   console.log(answer);
     * });
     * ```
     * @name .choices
     * @param {String|Array} `queue` Name or array of question names.
     * @param {Object|Function} `options` Question options or callback function
     * @param {Function} `callback` callback function
     * @api public
     */

    this.define('choices', function() {
      lazyQuestions(this);
      var args = [].slice.call(arguments);
      var cb = args.pop();
      var question = utils.toChoices.apply(null, args);

      // don't save answers for choice questions
      // unless explicitly defined by the user
      if (!question.hasOwnProperty('save')) {
        question.save = false;
      }

      this.questions.set(question.name, question);
      return this.ask(question.name, cb);
    });

    /**
     * Add a question to be asked at a later point.
     *
     * ```js
     * app.question('beverage', 'What is your favorite beverage?');
     * // or
     * app.question('beverage', {
     *   type: 'input',
     *   message: 'What is your favorite beverage?'
     * });
     * // or
     * app.question({
     *   name: 'beverage'
     *   type: 'input',
     *   message: 'What is your favorite beverage?'
     * });
     * ```
     * @name .question
     * @param {Object|String} `value` Question object, message (string), or options object.
     * @param {String} `locale` Optionally pass the locale to use, otherwise the default locale is used.
     * @return {Object} Returns the `this.questions` object, for chaining
     * @api public
     */

    this.define('question', function() {
      lazyQuestions(this);
      return this.questions.set.apply(this.questions, arguments);
    });

    /**
     * Ask one or more questions, with the given `options` and callback.
     *
     * ```js
     * // ask all questions
     * app.ask(function(err, answers) {
     *   console.log(answers);
     * });
     *
     * // ask the specified questions
     * app.ask(['name', 'description'], function(err, answers) {
     *   console.log(answers);
     * });
     * ```
     * @name .ask
     * @param {String|Array} `queue` Name or array of question names.
     * @param {Object|Function} `options` Question options or callback function
     * @param {Function} `callback` callback function
     * @api public
     */

    this.define('ask', function(queue, opts, cb) {
      lazyQuestions(this);
      if (typeof queue === 'string' && !this.questions.has(queue)) {
        this.questions.set(queue, {force: true}, queue);
      }
      this.questions.ask(queue, opts, cb);
    });
  };
};

/**
 * Utility for matching question names
 */

function isMatch(key, pattern) {
  if (key === pattern) return true;
  if (Array.isArray(pattern)) {
    return utils.mm.any(key, pattern);
  }
  return utils.mm.isMatch(key, pattern);
}

function isForced(key, options) {
  var opts = utils.merge({}, options);
  if (utils.isValidGlob(opts.force)) {
    return isMatch(key, opts.force);
  }
  if (utils.isValidGlob(opts.init)) {
    return isMatch(key, opts.init);
  }
  if (opts.init === true) {
    return true;
  }
  if (opts.force === true) {
    return true;
  }
}
