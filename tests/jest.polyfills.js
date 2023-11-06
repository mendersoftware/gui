/* eslint-disable no-undef */
const { TextDecoder, TextEncoder } = require('node:util');

Reflect.set(globalThis, 'TextDecoder', TextDecoder);
Reflect.set(globalThis, 'TextEncoder', TextEncoder);

const { Blob } = require('node:buffer');
const { fetch, FormData, Headers, Request, Response } = require('undici');

Reflect.set(globalThis, 'Blob', Blob);
Reflect.set(globalThis, 'fetch', fetch);
Reflect.set(globalThis, 'FormData', FormData);
Reflect.set(globalThis, 'Headers', Headers);
Reflect.set(globalThis, 'Request', Request);
Reflect.set(globalThis, 'Response', Response);
