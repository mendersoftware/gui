'use strict';

module.exports = function(options) {
  return function(app) {

    /**
     * Set the answer for question `name` at the current cwd.
     *
     * Optionally specify a locale to set, otherwise the answer is set
     * for the default locale.
     *
     * ```js
     * questions.setAnswer('name', 'Jack');
     * questions.getAnswer('name');
     * //=> {name: 'Jack'}
     *
     * // specify a locale
     * questions.setAnswer('name', 'fr');
     *
     * questions.getAnswer('name');
     * //=> {name: 'Jack'}
     * questions.getAnswer('name', 'fr');
     * //=> {name: 'Jean'}
     * ```
     * @param {String} `name`
     * @param {String} `locale`
     * @return {Object} Returns the answer object.
     * @api public
     */

    this.mixin('setAnswer', function(name, val, locale) {
      var question = this.get(name);
      if (question) {
        return question.answer.set(val, locale || this.locale);
      }
    });

    /**
     * Get the answer for question `name` at the current cwd.
     *
     * Optionally specify a locale to get, otherwise the default locale's
     * answer is returend.
     *
     * ```js
     * var name = questions.getAnswer('name');
     * //=> {name: 'Jon'}
     *
     * // specify a locale
     * var name = questions.getAnswer('name', 'fr');
     * //=> {name: 'Jean'}
     * ```
     * @param {String} `name`
     * @param {String} `locale`
     * @return {Object} Returns the question object.
     * @api public
     */

    this.mixin('getAnswer', function(name, locale) {
      var question = this.get(name);
      if (question) {
        return question.answer.get(locale || this.locale)
          || question.answer.getDefault(locale || this.locale);
      }
    });

    /**
     * Get the answer for question `name` at the current cwd.
     *
     * Optionally specify a locale to get, otherwise the default locale's
     * answer is returend.
     *
     * ```js
     * var name = questions.getAnswer('name');
     * //=> {name: 'Jon'}
     *
     * // specify a locale
     * var name = questions.getAnswer('name', 'fr');
     * //=> {name: 'Jean'}
     * ```
     * @param {String} `name`
     * @param {String} `locale`
     * @return {Object} Returns the question object.
     * @api public
     */

    this.mixin('hasAnswer', function(name, locale) {
      var question = this.get(name);
      if (question) {
        return question.answer.has(locale || this.locale)
          || question.answer.hasDefault(locale || this.locale);
      }
    });
  };
};
