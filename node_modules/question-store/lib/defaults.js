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
     * questions.setDefault('name', 'Jack');
     * questions.getDefault('name');
     * //=> {name: 'Jack'}
     *
     * // specify a locale
     * questions.setDefault('name', 'fr');
     *
     * questions.getDefault('name');
     * //=> {name: 'Jack'}
     * questions.getDefault('name', 'fr');
     * //=> {name: 'Jean'}
     * ```
     * @param {String} `name`
     * @param {String} `locale`
     * @return {Object} Returns the answer object.
     * @api public
     */

    this.mixin('setDefault', function(name, val, locale) {
      var question = this.addQuestion.apply(this, arguments);
      if (question) {
        question.answer.setDefault(val, locale || this.locale);
        return this;
      }
    });

    /**
     * Get the answer for question `name` at the current cwd.
     *
     * Optionally specify a locale to get, otherwise the default locale's
     * answer is returend.
     *
     * ```js
     * var name = questions.setDefault('name', 'Brian');
     * var name = questions.setDefault('name', 'Jean', 'fr');
     *
     * var name = questions.getDefault('name');
     * //=> {name: 'Brian'}
     *
     * // specify a locale
     * var name = questions.getDefault('name', 'fr');
     * //=> {name: 'Jean'}
     * ```
     * @param {String} `name`
     * @param {String} `locale`
     * @return {Object} Returns the question object.
     * @api public
     */

    this.mixin('getDefault', function(name, locale) {
      var question = this.get(name);
      if (question) {
        return question.answer.get(locale || this.locale);
      }
    });

    /**
     * Get the answer for question `name` at the current cwd.
     *
     * Optionally specify a locale to get, otherwise the default locale's
     * answer is returend.
     *
     * ```js
     * var name = questions.setDefault('name', 'Brian', 'fr');
     * var name = questions.hasDefault('name', 'fr');
     * //=> true
     * var name = questions.hasDefault('name', 'en');
     * //=> false
     * ```
     * @param {String} `name`
     * @param {String} `locale`
     * @return {Object} Returns the question object.
     * @api public
     */

    this.mixin('hasDefault', function(name, locale) {
      var question = this.get(name);
      if (question) {
        return question.answer.has(locale || this.locale);
      }
    });
  };
};
