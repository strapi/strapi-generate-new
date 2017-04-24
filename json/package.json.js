'use strict';

/**
 * Module dependencies
 */

// Node.js core.
const fs = require('fs');
const path = require('path');

// Public node modules.
const _ = require('lodash');

/**
 * Expose main package JSON of the application
 * with basic info, dependencies, etc.
 */

module.exports = function dataForPackageJSON(scope) {
  const frameworkPkg = scope.strapiPackageJSON || {};
  let dependencies;
  let devDependencies;

  // To determine the Strapi dependency to inject
  // in the newly created `package.json`.
  const strapiVersionDependency = '~' + frameworkPkg.version;

  // Only add some dependencies if the application needs it.
  if (!scope.dry) {
    const userPkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', '..', 'strapi-generate-users', 'package.json'))) || {};
    const uploadPkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', '..', 'strapi-generate-upload', 'package.json'))) || {};
    const emailPkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', '..', 'strapi-generate-email', 'package.json'))) || {};

    dependencies = {
      'anchor': getDependencyVersion(userPkg, 'anchor'),
      'async': getDependencyVersion(frameworkPkg, 'async'),
      'bcryptjs': getDependencyVersion(userPkg, 'bcryptjs'),
      'co-busboy': getDependencyVersion(uploadPkg, 'co-busboy'),
      'jsonwebtoken': getDependencyVersion(userPkg, 'jsonwebtoken'),
      'lodash': getDependencyVersion(frameworkPkg, 'lodash'),
      'nodemailer': getDependencyVersion(emailPkg, 'nodemailer'),
      'purest': getDependencyVersion(userPkg, 'purest'),
      'sails-disk': getDependencyVersion(frameworkPkg, 'sails-disk'),
      'socket.io': getDependencyVersion(frameworkPkg, 'socket.io'),
      'waterline': getDependencyVersion(frameworkPkg, 'waterline')
    };

    devDependencies = {
      'strapi-generate': getDependencyVersion(frameworkPkg, 'strapi-generate'),
      'strapi-generate-api': getDependencyVersion(frameworkPkg, 'strapi-generate-api'),
      'strapi-generate-email': getDependencyVersion(frameworkPkg, 'strapi-generate-email'),
      'strapi-generate-new': getDependencyVersion(frameworkPkg, 'strapi-generate-new'),
      'strapi-generate-upload': getDependencyVersion(frameworkPkg, 'strapi-generate-upload'),
      'strapi-generate-users': getDependencyVersion(frameworkPkg, 'strapi-generate-users')
    };
  }

  // Finally, return the JSON.
  return _.merge(scope.appPackageJSON || {}, {
    'name': scope.name,
    'private': true,
    'version': '0.1.0',
    'description': 'A Strapi application.',
    'dependencies': _.merge(dependencies || {}, {
      'strapi': strapiVersionDependency
    }),
    'devDependencies': devDependencies || {},
    'main': './server.js',
    'scripts': {
      'start': 'node server.js'
    },
    'author': {
      'name': scope.author || 'A Strapi developer',
      'email': scope.email || '',
      'url': scope.website || ''
    },
    'maintainers': [{
      'name': scope.author || 'A Strapi developer',
      'email': scope.email || '',
      'url': scope.website || ''
    }],
    'engines': {
      'node': '>= 0.12.0',
      'npm': '>= 2.0.0'
    },
    'license': scope.license || 'MIT'
  });
};

/**
 * Get dependencies version
 */

function getDependencyVersion(packageJSON, module) {
  return (
    packageJSON.dependencies && packageJSON.dependencies[module] ||
    packageJSON.devDependencies && packageJSON.devDependencies[module]
  );
}
