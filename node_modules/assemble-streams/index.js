/*!
 * assemble-streams <https://github.com/jonschlinkert/assemble-streams>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var handle = require('assemble-handle');
var through = require('through2');
var src = require('src-stream');

module.exports = function fn(app) {

  /**
   * Push a view collection into a vinyl stream.
   *
   * ```js
   * app.toStream('posts', function(file) {
   *   return file.path !== 'index.hbs';
   * })
   * ```
   * @name .toStream
   * @param {String} `collection` Name of the collection to push into the stream.
   * @param {Function} Optionally pass a filter function to use for filtering views.
   * @return {Stream}
   * @api public
   */

  app.mixin('toStream', function (name, filterFn) {
    var stream = through.obj();
    stream.setMaxListeners(0);

    if (typeof name === 'undefined' && !this.isCollection) {
      process.nextTick(stream.end.bind(stream));
      return src(stream);
    }

    var views;
    if (this.isApp && name) {
      views = this.getViews(name);
    } else {
      views = this.views;
    }

    setImmediate(function () {
      for (var key in views) {
        if (!filter(key, views[key], filterFn)) {
          continue;
        }
        stream.write(views[key]);
      }
      stream.end();
    });

    return src(stream).pipe(handle(this, 'onStream'));
  });

  if (app.isApp) {
    return fn;
  }
};

function filter(key, view, fn) {
  if (typeof fn === 'function') {
    return fn(key, view);
  }
  return true;
}
