'use strict';

/**
 * Module dependencies
 */

// Node.js core.
const path = require('path');

// Local dependencies.
const packageJSON = require('../json/package.json.js');
const studioJSON = require('../json/studio.json.js');

/**
 * Copy required files for the generated application
 */

module.exports = {
  moduleDir: path.resolve(__dirname, '..'),
  templatesDirectory: path.resolve(__dirname, '..', 'templates'),
  before: require('./before'),
  after: require('./after'),
  targets: {

    // Call `users`, `upload`, `email` and `admin` generators.
    '.': ['users', 'upload', 'email', 'admin'],

    // Main package.
    'package.json': {
      jsonfile: packageJSON
    },

    // Copy dot files.
    '.editorconfig': {
      copy: 'editorconfig'
    },
    '.gitignore': {
      copy: 'gitignore'
    },
    '.npmignore': {
      copy: 'npmignore'
    },

    // Copy Markdown files with some information.
    'README.md': {
      template: 'README.md'
    },

    // Copy dynamic SaaS files (Studio).
    'config/studio.json': {
      jsonfile: studioJSON
    }
  }
};
