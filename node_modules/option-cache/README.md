# option-cache [![NPM version](https://badge.fury.io/js/option-cache.svg)](http://badge.fury.io/js/option-cache)  [![Build Status](https://travis-ci.org/jonschlinkert/option-cache.svg)](https://travis-ci.org/jonschlinkert/option-cache)

> Simple API for managing options in JavaScript applications.

## Install

Install with [npm](https://www.npmjs.com/)

```sh
$ npm i option-cache --save
```

## Docs

- [API](#api)
- [Example app](#example-app)
- [Related](#related)
- [Contributing](#contributing)
- [Running tests](#running-tests)
- [Coverage](#coverage)
- [Changelog](#changelog)
- [Author](#author)
- [License](#license)

## API

### [Options](index.js#L24)

Create a new instance of `Options`.

**Params**

* `options` **{Object}**: Initialize with default options.

**Example**

```js
var app = new Options();
```

### [.option](index.js#L53)

Set or get an option.

**Params**

* `key` **{String}**: The option name.
* `value` **{any}**: The value to set.
* `returns` **{any}**: Returns a `value` when only `key` is defined.

**Example**

```js
app.option('a', true);
app.option('a');
//=> true
```

### [.hasOption](index.js#L103)

Return true if `options.hasOwnProperty(key)`

**Params**

* `prop` **{String}**
* `returns` **{Boolean}**: True if `prop` exists.

**Example**

```js
app.hasOption('a');
//=> false
app.option('a', 'b');
app.hasOption('a');
//=> true
```

### [.enable](index.js#L122)

Enable `key`.

**Params**

* `key` **{String}**
* `returns` **{Object}** `Options`: to enable chaining

**Example**

```js
app.enable('a');
```

### [.disable](index.js#L139)

Disable `key`.

**Params**

* `key` **{String}**: The option to disable.
* `returns` **{Object}** `Options`: to enable chaining

**Example**

```js
app.disable('a');
```

### [.enabled](index.js#L161)

Check if `prop` is enabled (truthy).

**Params**

* `prop` **{String}**
* `returns` **{Boolean}**

**Example**

```js
app.enabled('a');
//=> false

app.enable('a');
app.enabled('a');
//=> true
```

### [.disabled](index.js#L183)

Check if `prop` is disabled (falsey).

**Params**

* `prop` **{String}**
* `returns` **{Boolean}**: Returns true if `prop` is disabled.

**Example**

```js
app.disabled('a');
//=> true

app.enable('a');
app.disabled('a');
//=> false
```

### [.isTrue](index.js#L210)

Returns true if the value of `prop` is strictly `true`.

**Params**

* `prop` **{String}**
* `returns` **{Boolean}**: Uses strict equality for comparison.

**Example**

```js
app.option('a', 'b');
app.isTrue('a');
//=> false

app.option('c', true);
app.isTrue('c');
//=> true

app.option({a: {b: {c: true}}});
app.isTrue('a.b.c');
//=> true
```

### [.isFalse](index.js#L237)

Returns true if the value of `key` is strictly `false`.

**Params**

* `prop` **{String}**
* `returns` **{Boolean}**: Uses strict equality for comparison.

**Example**

```js
app.option('a', null);
app.isFalse('a');
//=> false

app.option('c', false);
app.isFalse('c');
//=> true

app.option({a: {b: {c: false}}});
app.isFalse('a.b.c');
//=> true
```

### [.isBoolean](index.js#L261)

Return true if the value of key is either `true` or `false`.

**Params**

* `key` **{String}**
* `returns` **{Boolean}**: True if `true` or `false`.

**Example**

```js
app.option('a', 'b');
app.isBoolean('a');
//=> false

app.option('c', true);
app.isBoolean('c');
//=> true
```

<br>

***

<br>

## Example app

Use options-cache in your javascript application:

```js
var util = require('util');
var Options = require('options-cache');

function App(options) {
  Options.call(this, options);
  this.init();
}

util.inherits(App, Options);

App.prototype.init = function() {
  this.option('cwd', process.cwd());
  this.option('foo', 'bar');
};

App.prototype.a = function(value) {
  this.enable(value);
};

App.prototype.b = function(value) {
  if (this.enabled(value)) {
    // do something
  } else {
    // do something else
  }
};
```

<br>

***

<br>

## Related

* [cache-base](https://www.npmjs.com/package/cache-base): Generic object cache for node.js/javascript projects. | [homepage](https://github.com/jonschlinkert/cache-base)
* [config-cache](https://www.npmjs.com/package/config-cache): General purpose JavaScript object storage methods. | [homepage](https://github.com/jonschlinkert/config-cache)
* [engine-cache](https://www.npmjs.com/package/engine-cache): express.js inspired template-engine manager. | [homepage](https://github.com/jonschlinkert/engine-cache)
* [helper-cache](https://www.npmjs.com/package/helper-cache): Easily register and get helper functions to be passed to any template engine or node.js… [more](https://www.npmjs.com/package/helper-cache) | [homepage](https://github.com/jonschlinkert/helper-cache)
* [loader-cache](https://www.npmjs.com/package/loader-cache): Register loader functions that dynamically read, parse or otherwise transform file contents when the name… [more](https://www.npmjs.com/package/loader-cache) | [homepage](https://github.com/jonschlinkert/loader-cache)
* [map-cache](https://www.npmjs.com/package/map-cache): Basic cache object for storing key-value pairs. | [homepage](https://github.com/jonschlinkert/map-cache)
* [parser-cache](https://www.npmjs.com/package/parser-cache): Cache and load parsers, similiar to consolidate.js engines. | [homepage](https://github.com/jonschlinkert/parser-cache)

## Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/jonschlinkert/option-cache/issues/new).

## Running tests

Install dev dependencies:

```sh
$ npm i -d && npm test
```

## Coverage

As of October 29, 2015:

```sh
Statements : 100% (45/45)
Branches   : 100% (18/18)
Functions  : 100% (11/11)
Lines      : 100% (45/45)
```

## Changelog

**v3.0.0**

* **breaking change**: the `toFlag` method was removed
* Adds gulp and istanbul for test coverage
* 100% test coverage

**v2.0.0**

* Implements `mapVisit` to ensuree that `option` will be called and an event will be emitted for each key-value pair passed on the arguments.
* Adds `mixin` as a static method, for mixing the properties of `option-cache` onto the provided object.

## Author

**Jon Schlinkert**

+ [github/jonschlinkert](https://github.com/jonschlinkert)
+ [twitter/jonschlinkert](http://twitter.com/jonschlinkert)

## License

Copyright © 2015 Jon Schlinkert
Released under the MIT license.

***

_This file was generated by [verb-cli](https://github.com/assemble/verb-cli) on October 29, 2015._

<!-- deps:mocha -->