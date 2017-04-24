'use strict';

/**
 * Module dependencies
 */

// Node.js core.
const path = require('path');

// Public node modules.
const _ = require('lodash');
const fs = require('fs-extra');

/**
 * This `before` function is run before generating targets.
 * Validate, configure defaults, get extra dependencies, etc.
 *
 * @param {Object} scope
 * @param {Function} cb
 */

module.exports = function before(scope, cb) {

  // Use a reasonable default application name.
  let defaultName = scope.args[0];
  if (defaultName === '.' || !defaultName) {
    defaultName = path.basename(process.cwd());
  }

  // App info.
  _.defaults(scope, {
    name: defaultName,
    author: process.env.USER || 'A Strapi developer',
    email: process.env.EMAIL || '',
    year: (new Date()).getFullYear(),
    license: 'MIT'
  });

  // Make changes to the rootPath where the Strapi project will be created.
  scope.rootPath = path.resolve(process.cwd(), scope.name || '');

  // Ensure we aren't going to inadvertently delete any files.
  try {
    const files = fs.readdirSync(scope.rootPath);
    if (files.length) {
      return cb.error('Error: `$ strapi new` can only be called on an empty directory.');
    }
  } catch (e) {
    // ...
  }

  // Only apply if the `--dry` flag is present.
  // Do not generate APIs if the developer
  // wants a dry application but still create an
  // empty `api` directory.
  if (scope.dry) {
    delete this.targets['.'];
    fs.mkdirs(path.resolve(scope.rootPath, 'api'), function (err) {
      if (err) {
        return cb.error('Impossible to create the `./api` directory.');
      }
    });
  }

  // Trigger callback with no error to proceed.
  return cb.success();
};
