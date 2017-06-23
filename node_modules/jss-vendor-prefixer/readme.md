# JSS plugin that handles vendor prefixes on the browser

This vendor prefixer knows which properties and values are supported in the
current runtime and changes only whats required.
The best thing is - you don't need to download all of them.
Also it is very fast, all checks are cached.

Make sure you read [how to use
plugins](https://github.com/cssinjs/jss/blob/master/docs/setup.md#setup-with-plugins)
in general.

[Demo](http://cssinjs.github.io/examples/index.html#plugin-jss-vendor-prefixer) -
[JSS](https://github.com/cssinjs/jss)

[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/cssinjs/lobby)


## Usage example

```javascript
import jss from 'jss'
import vendorPrefixer from 'jss-vendor-prefixer'

jss.use(vendorPrefixer())

let sheet = jss.createStyleSheet({
  container: {
    transform: 'translateX(100px)'
  }
})
```

```javascript
console.log(sheet.toString())
```
```css
.jss-0-0 {
  transform: -webkit-translateX(100px);
}
```

```javascript
console.log(sheet.classes)
```
```javascript
{ container: "jss-0-0" }
```

## Issues

File a bug against [cssinjs/jss prefixed with \[jss-vendor-prefixer\]](https://github.com/cssinjs/jss/issues/new?title=[jss-vendor-prefixer]%20).

## Run tests

```bash
npm i
npm run test
```

## License

MIT
