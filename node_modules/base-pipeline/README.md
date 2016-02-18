# base-pipeline [![NPM version](https://badge.fury.io/js/base-pipeline.svg)](http://badge.fury.io/js/base-pipeline)

> base-methods plugin that adds pipeline and plugin methods for dynamically composing streaming plugin pipelines.

## Install

Install with [npm](https://www.npmjs.com/)

```sh
$ npm i base-pipeline --save
```

## Usage

```js
var base = require('base-methods');
var pipeline = require('base-pipeline');
var bfs = require('base-fs');

// create your application and add the plugin
var app = base()
  .use(pipeline())
  .use(bfs)

// plugins may return a function
app.plugin('a', function() {
  return through.obj(function(file, enc, next) {
    next(null, file);
  });
});

// or a stream
app.plugin('b', through.obj(function(file, enc, next) {
  next(null, file);
});

// use registered plugins
app.src(['foo/*.hbs'])
  .pipe(app.pipeline(['a', 'b']))
  .pipe(app.dest('site/'))
```

## Supported signatures

Array of registered plugin names:

```js
// register plugins
app.plugin('a', function() {});
app.plugin('b', function() {});

// pipeline
app.src(['foo/*.hbs'])
  .pipe(app.pipeline(['a', 'b']))
  .pipe(app.dest('site/'))
```

List of registed plugin names:

```js
// register plugins
app.plugin('a', function() {});
app.plugin('b', function() {});

// pipeline
app.src(['foo/*.hbs'])
  .pipe(app.pipeline('a', 'b'))
  .pipe(app.dest('site/'))
```

Stacked:

```js
// register plugins
app.plugin('a', function() {});
app.plugin('b', function() {});
app.plugin('c', function() {});

// pipeline
app.src(['foo/*.hbs'])
  .pipe(app.pipeline('a'))
  .pipe(app.pipeline('b'))
  .pipe(app.pipeline('c'))
  .pipe(app.dest('site/'))
```

Functions that return a stream:

```js
app.src(['foo/*.hbs'])
  .pipe(app.pipeline(function() {
    return through.obj(function(file, enc, next) {
      next(null, file);  
    })
  }))
  .pipe(app.pipeline(function() {
    return through.obj(function(file, enc, next) {
      next(null, file);  
    })
  }))
  .pipe(app.dest('site/'))
```

Streams:

```js
app.src(['foo/*.hbs'])
  .pipe(app.pipeline(through.obj(function(file, enc, next) {
    next(null, file);  
  }))
  .pipe(app.pipeline(through.obj(function(file, enc, next) {
    next(null, file);  
  }))
  .pipe(app.dest('site/'))
```

**Heads up!**

In general, it's a best practice for plugins to return a function that returns a stream. This ensures that every time the function is called a new stream is returned.

## API

Register a plugin by `name`

**Params**

* `name` **{String}**
* `fn` **{Function}**

Create a plugin pipeline from an array of plugins.

**Params**

* `plugins` **{Array}**: Each plugin is a function that returns a stream, or the name of a registered plugin.
* `options` **{Object}**
* `returns` **{Stream}**

## Related projects

* [base-cli](https://www.npmjs.com/package/base-cli): Plugin for base-methods that maps built-in methods to CLI args (also supports methods from a… [more](https://www.npmjs.com/package/base-cli) | [homepage](https://github.com/jonschlinkert/base-cli)
* [base-config](https://www.npmjs.com/package/base-config): base-methods plugin that adds a `config` method for mapping declarative configuration values to other 'base'… [more](https://www.npmjs.com/package/base-config) | [homepage](https://github.com/jonschlinkert/base-config)
* [base-data](https://www.npmjs.com/package/base-data): adds a `data` method to base-methods. | [homepage](https://github.com/jonschlinkert/base-data)
* [base-methods](https://www.npmjs.com/package/base-methods): Starter for creating a node.js application with a handful of common methods, like `set`, `get`,… [more](https://www.npmjs.com/package/base-methods) | [homepage](https://github.com/jonschlinkert/base-methods)
* [base-options](https://www.npmjs.com/package/base-options): Adds a few options methods to base-methods, like `option`, `enable` and `disable`. See the readme… [more](https://www.npmjs.com/package/base-options) | [homepage](https://github.com/jonschlinkert/base-options)
* [base-plugins](https://www.npmjs.com/package/base-plugins): Upgrade's plugin support in base-methods to allow plugins to be called any time after init. | [homepage](https://github.com/jonschlinkert/base-plugins)
* [base-store](https://www.npmjs.com/package/base-store): Plugin for getting and persisting config values with your base-methods application. Adds a 'store' object… [more](https://www.npmjs.com/package/base-store) | [homepage](https://github.com/jonschlinkert/base-store)

## Running tests

Install dev dependencies:

```sh
$ npm i -d && npm test
```

## Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/jonschlinkert/base-pipeline/issues/new).

## Author

**Jon Schlinkert**

+ [github/jonschlinkert](https://github.com/jonschlinkert)
+ [twitter/jonschlinkert](http://twitter.com/jonschlinkert)

## License

Copyright © 2015 Jon Schlinkert
Released under the MIT license.

***

_This file was generated by [verb-cli](https://github.com/assemble/verb-cli) on November 06, 2015._