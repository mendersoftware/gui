# superagent-auth-bearer

This plugin for [`visionmedia/superagent`][superagent] adds a new method to
make OAuth2 Bearer Token authentication.

## Installation

``` bash
npm install superagent-auth-bearer
```

## Example

``` js
var request = require('superagent');

require('superagent-auth-bearer')(request);

request
  .get('/')
  .authBearer('XvWjkh54rs53HmNlKg165DfE')
  .end(function(err,res) {
    ...
  });
```

## License

Copyright (c) 2014, ROJO 2 <hola@rojo2.com>

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

[superagent]: https://github.com/visionmedia/superagent
