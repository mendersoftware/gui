# base-cli [![NPM version](https://img.shields.io/npm/v/base-cli.svg)](https://www.npmjs.com/package/base-cli) [![Build Status](https://img.shields.io/travis/jonschlinkert/base-cli.svg)](https://travis-ci.org/jonschlinkert/base-cli)

> Plugin for base-methods that maps built-in methods to CLI args (also supports methods from a few plugins, like 'base-store', 'base-options' and 'base-data'.

You might also be interested in [base-config](https://github.com/jonschlinkert/base-config).

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm i base-cli --save
```

Adds a `cli` method to `base` for mapping parsed command line arguments existing [base](https://github.com/node-base/base) methods or custom functions.

The goal is to simplify the process of settings up command line logic for your [base](https://github.com/node-base/base) application.

## Usage

```js
var cli = require('base-cli');
var Base = require('base');
var app = new Base();

// register the plugin
app.use(cli());
```

## API

This adds a `cli` object to [base](https://github.com/node-base/base) with the following (chainable) methods (`base.cli.*`):

* `.map()` -  [.map](#map): add mappings from command line flags/options to custom functions or `base` methods
* `.alias()` -  [.alias](#alias): similar to `map` but creates simple aliases. For example, `alias('show', 'get')` would invoke the `.get()` method when `--show` is passed on the command line
* `.process()` -  [.process](#process): once all mappings are defined, pass `argv` to `.process()` to iterate over the mappings, passing `argv` as context.

## Example

```js
var argv = require('minimist')(process.argv.slice(2));
var expand = require('expand-args');
var cli = require('base-cli');
var Base = require('base');

var app = new Base();
app.use(cli());

app.cli
  .map('get', function(key, val) {
    app.get(key, val);
  })
  .map('set', function(key, val) {
    app.set(key, val);
  })

app.cli.process(expand(argv), function(err) {
  if (err) throw err;
});

// command line args:
//   
//   '--set=a:b --get=a'
//   
// prints:
//   
//   'a'
//   
```

## CLI

### [--ask](lib/commands/ask.js#L28)

Force questions that match the given pattern to be asked. The resulting answer data is merged onto `app.cache.data`.

After questions are answered:

* Use `app.data('answers')` to get answer data.
* To open the directory where data is persisted, enter `--open answers` in the command line

**Example**

```sh
# ask all questions
$ --ask
# ask all `author.*` questions
$ --ask "author.*"
# ask all `*.name` questions (like `project.name` and `author.name`)
$ --ask "*.name*"
```

### [--config](lib/commands/config.js#L29)

Prefix the `--config` flag onto other command line options to persist the value to package.json for the current project. For example, if you're using `verb`, the value would be saved to the `verb` object.

**Params**

* **{Object}**: app

**Example**

```sh
# save the cwd to use for a project
$ --config=cwd:foo
# save the tasks to run for a project
$ --config=tasks:readme
# display the config
$ --config
```

### [--cli](lib/commands/cwd.js#L20)

Set the current working directory.

**Example**

```sh
# set working directory to "foo"
$ --cwd=foo
# display cwd
$ --cwd
```

### [--data](lib/commands/data.js#L25)

Set data on the `app.cache.data` object. This is the API-equivalent of calling `app.data()`.

**Example**

```sh
$ --data
# display data object
$ --data=foo
# sets {foo: true}
$ --data=foo:bar
# sets {foo: 'bar'}
$ --data=foo.bar:baz
# sets {foo:{bar: 'baz'}}
```

### [--emit](lib/commands/emit.js#L21)

Bind `console.error` to the given event listener, so that when event `name` is emitted, the event arguments will be output in the console.

**Example**

```sh
# emit errors
$ --emit error
# emit all views as they're created
$ --emit view
# emit only "pages" as they're created
$ --emit page
```

### [--init](lib/commands/init.js#L17)

Ask initialization questions and persist answer data to the global config store.

**Example**

```sh
$ --init
```

### [--open](lib/commands/open.js#L21)

Open a directory, or open a file in the default application associated with the file type.

**Example**

```sh
# Open the directory where answer data is persisted
$ --open answers
# Open the directory where store data is persisted
$ --open store
```

### [--option](lib/commands/option.js#L25)

Set options on the `app.options` object. This is the API-equivalent of calling `app.option()`. You may also use the plural `--options` flag for identical behavior.

**Example**

```sh
$ --option=foo
# sets {foo: true}
$ --option=foo:bar
# sets {foo: 'bar'}
$ --option=foo.bar:baz
# sets {foo:{bar: 'baz'}}
```

### [--options](lib/commands/options.js#L24)

Set in-memory options on the `app.options` object. This is the API-equivalent of calling `app.option()`. You may also use the singular `--option` flag for identical behavior.

To display currently defined options, pass the `--options` flag with no value.

**Example**

```sh
$ --options=foo
# sets {foo: true}
$ --options=foo:bar
# sets {foo: 'bar'}
$ --options=foo.bar:baz
# sets {foo:{bar: 'baz'}}
```

### [--save](lib/commands/save.js#L23)

Persist a value to the global config store by prefixing a command line option with `--save`.

**Params**

* **{Object}**: app

**Example**

```sh
# save the cwd to use as a global default
$ --save=cwd:foo
# save the tasks to run by default
$ --save=tasks:readme
```

### [--tasks](lib/commands/task.js#L20)

Alias for `--tasks`. Run the given generators and tasks. This flag is unnecessary when used with [base-runner](https://github.com/jonschlinkert/base-runner).

**Example**

```sh
# run task "foo"
$ app --task foo
#=> {task: ['foo']}
# run generator "foo", task "bar"
$ app --task foo:bar
#=> {task: ['foo:bar']}
```

### [--tasks](lib/commands/tasks.js#L20)

Run the given generators and tasks. This flag is unnecessary when used with [base-runner](https://github.com/jonschlinkert/base-runner).

**Example**

```sh
# run task "foo"
$ app --tasks foo
#=> {task: ['foo']}
# run generator "foo", task "bar"
$ app --tasks foo:bar
#=> {task: ['foo:bar']}
```

### [--show](lib/utils.js#L70)

Returns true if `val` is true or is an object with `show: true`

**Params**

* `val` **{String}**
* `returns` **{Boolean}**

## Config

Persist a value to the global config store by prefixing a command line option
with `--save` flag is prefixed to other command line options when you want
to persist the value to the global config store. For example, let's say
you're running [verb](https://github.com/verbose/verb):

* `verb --cwd=foo` sets `foo` as the cwd in memory, and would need to be set again the next time you run the `verb` command.
* `verb --save=cwd:foo` persists `foo` to verb's [global config store][store] so that it's used as the default cwd each time you run the application.
* `verb --config=cwd:foo` persists `foo` to the `verb` [config object][config] in package.json

to the global config store located in the user's home directory (for example, if you're running verb, the store would be located in `~/verb/verb.json` on mac), and would be .

## TODO

* [ ] implement `--init`
* [ ] implement `--config`
* [ ] implement `--verbose`
* [ ] implement short flags. do this last

## Related projects

Other useful [base](https://github.com/node-base/base) plugins:

* [base](https://www.npmjs.com/package/base): base is the foundation for creating modular, unit testable and highly pluggable node.js applications, starting… [more](https://www.npmjs.com/package/base) | [homepage](https://github.com/node-base/base)
* [base-config](https://www.npmjs.com/package/base-config): base-methods plugin that adds a `config` method for mapping declarative configuration values to other 'base'… [more](https://www.npmjs.com/package/base-config) | [homepage](https://github.com/jonschlinkert/base-config)
* [base-data](https://www.npmjs.com/package/base-data): adds a `data` method to base-methods. | [homepage](https://github.com/jonschlinkert/base-data)
* [base-generators](https://www.npmjs.com/package/base-generators): Adds project-generator support to your `base` application. | [homepage](https://github.com/jonschlinkert/base-generators)
* [base-plugins](https://www.npmjs.com/package/base-plugins): Upgrade's plugin support in base-methods to allow plugins to be called any time after init. | [homepage](https://github.com/jonschlinkert/base-plugins)
* [base-task](https://www.npmjs.com/package/base-task): base plugin that provides a very thin wrapper around [https://github.com/doowb/composer](https://github.com/doowb/composer) for adding task methods to… [more](https://www.npmjs.com/package/base-task) | [homepage](https://github.com/node-base/base-task)

## Generate docs

Generate readme and API documentation with [verb](https://github.com/verbose/verb):

```sh
$ npm i -d && npm run docs
```

Or, if [verb](https://github.com/verbose/verb) is installed globally:

```sh
$ verb
```

## Running tests

Install dev dependencies:

```sh
$ npm i -d && npm test
```

## Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/jonschlinkert/base-cli/issues/new).

## Author

**Jon Schlinkert**

* [github/jonschlinkert](https://github.com/jonschlinkert)
* [twitter/jonschlinkert](http://twitter.com/jonschlinkert)

## License

Copyright © 2016 [Jon Schlinkert](https://github.com/jonschlinkert)
Released under the [MIT license](https://github.com/jonschlinkert/base-cli/blob/master/LICENSE).

***

_This file was generated by [verb](https://github.com/verbose/verb), v0.9.0, on February 17, 2016._