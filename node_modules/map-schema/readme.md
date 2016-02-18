# map-schema [![NPM version](https://img.shields.io/npm/v/map-schema.svg)](https://www.npmjs.com/package/map-schema) [![Build Status](https://img.shields.io/travis/jonschlinkert/map-schema.svg)](https://travis-ci.org/jonschlinkert/map-schema)

> Normalize an object by running normalizers and validators that are mapped to a schema.

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm i map-schema --save
```

## Usage

```js
var schema = require('map-schema');
```

**Example**

This is a basic example schema for normalizing and validating fields on `package.json` (a full version of this will be available on [normalize-pkg](https://github.com/jonschlinkert/normalize-pkg/) when complete):

```js
var fs = require('fs');
var isObject = require('isobject');
var Schema = require('map-schema');

// create a schema
var schema = new Schema()
  .field('name', 'string')
  .field('description', 'string')
  .field('repository', ['object', 'string'], {
    normalize: function(val) {
      return isObject(val) ? val.url : val;
    }
  })
  .field('main', 'string', {
    validate: function(filepath) {
      return fs.existsSync(filepath);
    }
  })
  .field('version', 'string', {
    default: '0.1.0'
  })
  .field('license', 'string', {
    default: 'MIT'
  })

var pkg = require('./package');
// normalize an object
console.log(schema.normalize(pkg));
// validation errors array
console.log(schema.errors);
```

**Errors**

Validation errors are exposed on `schema.errors`. Error reporting is pretty basic right now but I plan to implement something better soon.

## API

### [Schema](index.js#L40)

Create a new `Schema` with the given `options`.

**Params**

* `options` **{Object}**

**Example**

```js
var schema = new Schema()
  .field('name', 'string')
  .field('version', 'string')
  .field('license', 'string')
  .field('licenses', {
    validate: function(val, key) {
      this.error(key, 'licenses is deprecated. use "license" instead.');
    }
  })
  .normalize(require('./package'))
```

### [.error](index.js#L76)

Push an error onto the `schema.errors` array. Placeholder for
better error handling and a reporter (planned).

**Params**

* `method` **{String}**: The name of the method where the error is recorded.
* `prop` **{String}**: The name of the field for which the error is being created.
* `message` **{String}**: The error message.
* `value` **{String}**: The value associated with the error.
* `returns` **{any}**

### [.field](index.js#L108)

Add a field to the schema with the given `name`, `type` or types, and options.

**Params**

* `name` **{String}**
* `type` **{String|Array}**
* `options` **{Object}**
* `returns` **{Object}**: Returns the instance for chaining.

**Example**

```js
var semver = require('semver');

schema
  .field('keywords', 'array')
  .field('version', 'string', {
    validate: function(val, key, config, schema) {
      return semver.valid(val) !== null;
    }
  })
```

### [.get](index.js#L158)

Get field `name` from the schema. Get a specific property from the field by passing the property name as a second argument.

**Params**

* `name` **{Strign}**
* `prop` **{String}**
* `returns` **{Object|any}**: Returns the field instance or the value of `prop` if specified.

**Example**

```js
schema.field('bugs', ['object', 'string']);
var field = schema.get('bugs', 'types');
//=> ['object', 'string']
```

### [.omit](index.js#L171)

Omit a property from the returned object. This method can be used
in normalize functions as a way of removing undesired properties.

**Params**

* `key` **{String}**: The property to remove
* `returns` **{Object}**: Returns the instance for chaining.

### [.update](index.js#L186)

Update a property on the returned object. This method will trigger validation
and normalization of the updated property.

**Params**

* `key` **{String}**: The property to update.
* `val` **{any}**: Value of the property to update.
* `returns` **{Object}**: Returns the instance for chaining.

### [.isOptional](index.js#L208)

Returns true if field `name` is an optional field.

**Params**

* `name` **{String}**
* `returns` **{Boolean}**

### [.isRequired](index.js#L220)

Returns true if field `name` was defined as a required field.

**Params**

* `name` **{String}**
* `returns` **{Boolean}**

### [.missingFields](index.js#L258)

Checks the config object for missing fields and. If found,
an error message is pushed onto the `schema.errors` array,
which can be used for reporting.

**Params**

* `config` **{Object}**
* `returns` **{Array}**

### [.sortObject](index.js#L289)

If a `keys` array is passed on the constructor options, or as a second argument to `sortObject`, this sorts the given object so that keys are in the same order as the supplied array of `keys`.

**Params**

* `config` **{Object}**
* `returns` **{Object}**: Returns the config object with keys sorted to match the given array of keys.

**Example**

```js
schema.sortObject({z: '', a: ''}, ['a', 'z']);
//=> {a: '', z: ''}
```

### [.sortArrays](index.js#L318)

When `options.sortArrays` _is not false_, sorts all arrays in the
given `config` object using JavaScript's native `.localeCompare`
method.

**Params**

* `config` **{Object}**
* `returns` **{Object}**: returns the config object with sorted arrays

### [.isValidType](index.js#L335)

Returns true if the given value is valid for field `key`.

**Params**

* `key` **{String}**
* `val` **{any}**
* `config` **{Object}**
* `returns` **{Boolean}**

### [.normalize](index.js#L412)

Normalize the given `config` object.

**Params**

* **{String}**: key
* **{any}**: value
* **{Object}**: config
* `returns` **{Object}**

### [.normalizeField](index.js#L463)

Normalize a field on the schema.

**Params**

* **{String}**: key
* **{any}**: value
* **{Object}**: config
* `returns` **{Object}**

### [.visit](index.js#L515)

Visit `method` over the given object or array.

**Params**

* `method` **{String}**
* `value` **{Object|Array}**
* `returns` **{Object}**: Returns the instance for chaining.

### [Field](lib/field.js#L28)

Create a new `Field` of the given `type` to validate against, and optional `config` object.

**Params**

* `type` **{String|Array}**: One more JavaScript native types to use for validation.
* `config` **{Object}**

**Example**

```js
var field = new Field('string', {
  normalize: function(val) {
    // do stuff to `val`
    return val;
  }
});
```

### [.isValidType](lib/field.js#L73)

Returns true if the given `type` is a valid type.

**Params**

* `type` **{String}**
* `returns` **{Boolean}**

### [.validate](lib/field.js#L95)

Called in `schema.validate`, returns true if the given `value` is valid. This default validate method returns true unless overridden with a custom `validate` method.

* `returns` **{Boolean}**

**Example**

```js
var field = new Field({
  types: ['string']
});

field.validate('name', {});
//=> false
```

## Related projects

[normalize-pkg](https://www.npmjs.com/package/normalize-pkg): Normalize values in package.json to improve compatibility, programmatic readability and usefulness with third party libs. | [homepage](https://github.com/jonschlinkert/normalize-pkg/)

## Generate docs

Generate readme and API documentation with [verb][]:

```sh
$ npm i -d && npm run docs
```

Or, if [verb][] is installed globally:

```sh
$ verb
```

## Running tests

Install dev dependencies:

```sh
$ npm i -d && npm test
```

## Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/jonschlinkert/map-schema/issues/new).

## Author

**Jon Schlinkert**

* [github/jonschlinkert](https://github.com/jonschlinkert)
* [twitter/jonschlinkert](http://twitter.com/jonschlinkert)

## License

Copyright © 2016 [Jon Schlinkert](https://github.com/jonschlinkert)
Released under the [MIT license](https://github.com/jonschlinkert/map-schema/blob/master/LICENSE).

***

_This file was generated by [verb](https://github.com/verbose/verb), v0.9.0, on February 17, 2016._