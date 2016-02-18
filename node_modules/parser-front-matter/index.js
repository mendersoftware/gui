'use strict';

var utils = require('./utils');

/**
 * Front matter parser
 */

var parser = module.exports;

/**
 * Parse front matter from the given string or the `contents` in the
 * given `file` and callback `next(err, file)`.
 *
 * If an object is passed, either `file.contents` or `file.content`
 * may be used (for gulp and assemble compatibility).
 *
 * ```js
 * // pass a string
 * parser.parse('---\ntitle: foo\n---\nbar', function (err, file) {
 *   //=> {content: 'bar', data: {title: 'foo'}}
 * });
 *
 * // or an object
 * var file = {contents: new Buffer('---\ntitle: foo\nbar')};
 * parser.parse(file, function(err, res) {
 *   //=> {content: 'bar', data: {title: 'foo'}}
 * });
 * ```
 * @param {String|Object} `file` The object or string to parse.
 * @param {Object|Function} `options` or `next` callback function. Options are passed to [gray-matter][].
 * @param {Function} `next` callback function.
 * @api public
 */

parser.parse = function matterParse(file, options, next) {
  var args = [].slice.call(arguments);
  next = args.pop();

  if (typeof next !== 'function') {
    throw new TypeError('expected a callback function');
  }

  try {
    next(null, parser.parseSync.apply(parser, args));
  } catch(err) {
    next(err);
  }
};

/**
 * Parse front matter from the given string or the `contents` in the
 * given `file`. If an object is passed, either `file.contents` or
 * `file.content` may be used (for gulp and assemble compatibility).
 *
 * ```js
 * // pass a string
 * var res = parser.parseSync('---\ntitle: foo\n---\nbar');
 *
 * // or an object
 * var file = {contents: new Buffer('---\ntitle: foo\nbar')};
 * var res = parser.parseSync(file);
 * //=> {content: 'bar', data: {title: 'foo'}}
 * ```
 * @param {String|Object} `file` The object or string to parse.
 * @param {Object} `options` passed to [gray-matter][].
 * @api public
 */

parser.parseSync = function matterParseSync(file, options) {
  options = options || {};
  var str = '';

  if (typeof file === 'string') {
    str = file;
    file = { content: str };

  } else if (typeof file === 'object') {
    str = file.content || (file.contents ? file.contents.toString() : '');

  } else {
    throw new Error('expected file to be a string or object');
  }

  file.options = file.options || {};
  var opts = utils.extend({}, options, file.options);

  try {
    var parsed = utils.matter(str, opts);
    file.orig = parsed.orig;
    file.data = utils.extend({}, file.data, parsed.data);
    file.content = parsed.content.replace(/^\s+/, '');
    file.contents = new Buffer(file.content);
    return file;
  } catch (err) {
    throw err;
  }
};
