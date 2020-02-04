'use strict';

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'test';
process.env.NODE_ENV = 'test';
process.env.PUBLIC_URL = '';
process.env.TZ = 'UTC';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

let argv = process.argv.slice(2);

// Watch unless on CI or explicitly running all tests
if (!process.env.CI && argv.indexOf('--watchAll') === -1) {
  argv.push('--watchAll');
}

const jest = require('jest');
jest.run(argv);
