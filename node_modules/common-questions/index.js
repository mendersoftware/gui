/*!
 * common-questions <https://github.com/jonschlinkert/common-questions>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var project = require('project-name');

module.exports = function(options) {
  options = options || {};
  var cwd = options.cwd || process.cwd();
  var name = options.name || project(cwd);

  return {
    setDefault: {
      'author.name': 'Author\'s name?',
      'author.url': 'Author\'s URL?',
      'author.username': 'Author\'s GitHub username?',
      'author.twitter': 'Author\'s Twitter username?',
      'author.email': 'Author\'s email address?',
    },
    set: {
      'project.name': {
        message: 'Project name?',
        default: name,
        force: options.init === true
      },
      'project.description': {
        message: 'Project description?',
        force: options.init === true
      }
    }
  };
};
