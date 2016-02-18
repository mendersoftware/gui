'use strict';

var define = require('define-property');
var Page = require('./page');

/**
 * Pages constructor
 *
 * ```js
 * var pages = new Pages();
 * ```
 *
 * @param {Array} `pages` Optional array of pages to initialize the `pages` array.
 * @api public
 */

function Pages(pages) {
  this.pages = [];
  if (!pages) return;

  if (!Array.isArray(pages)) {
    throw new TypeError('expected pages to be an Array');
  }

  pages.forEach(function(page) {
    this.addPage(page);
  }.bind(this));
}

/**
 * Add a page to the list.
 *
 * ```js
 * pages.addPage({items: [1, 2, 3]});
 * ```
 *
 * @param {Object} `page` Plain object or instance of a `Page`
 * @return {Object} Returns `this` for chaining
 * @api public
 */

Pages.prototype.addPage = function(page) {
  if (!(page instanceof Page)) {
    page = new Page(page);
  }
  this.pages.push(this.decoratePage(page));
  return this;
};

/**
 * Decorates a page with additional properties.
 *
 * @param  {Object} `page` Instance of page to decorate
 * @return {Object} Returns the decoracted page to be added to the list
 */

Pages.prototype.decoratePage = function(page) {
  var self = this;
  define(page, 'first', {
    enumerable: true,
    get: function() {
      return self.first && self.first.current;
    },
    set: function() {}
  });

  define(page, 'current', {
    enumerable: true,
    get: function() {
      return this.idx + 1;
    },
    set: function() {}
  });

  define(page, 'last', {
    enumerable: true,
    get: function() {
      return self.last && self.last.current;
    },
    set: function() {}
  });

  define(page, 'total', {
    enumerable: true,
    get: function() {
      return self.total;
    },
    set: function() {}
  });

  var prev = this.last;
  var idx = this.total;
  page.idx = idx;
  if (prev) {
    page.prev = prev.current;
    prev.next = page.current;
  }

  return page;
};

/**
 * Helper property to calculate the total pages in the array.
 */

define(Pages.prototype, 'total', {
  get: function() {
    return this.pages.length;
  }
});

/**
 * Helper property to get the first page from the array.
 */

define(Pages.prototype, 'first', {
  get: function() {
    return this.total > 0 ? this.pages[0] : null;
  }
});

/**
 * Helper property to get the last page from the array.
 */

define(Pages.prototype, 'last', {
  get: function() {
    return this.total > 0 ? this.pages[this.total - 1] : null;
  }
});

/**
 * Expose `Pages`
 */

module.exports = Pages;
