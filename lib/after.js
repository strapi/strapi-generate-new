'use strict';

/**
 * Module dependencies
 */

// Node.js core.
const path = require('path');

// Public node modules.
const _ = require('lodash');
const fs = require('fs-extra');
const async = require('async');
const winston = require('winston');

// Logger.
const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      level: 'debug',
      colorize: 'level'
    })
  ]
});

/**
 * Runs after this generator has finished
 *
 * @param {Object} scope
 * @param {Function} cb
 */

module.exports = function afterGenerate(scope, cb) {

  // Keep track of non-fatal errors.
  const nonFatalErrors = [];

  // Go the root path.
  process.chdir(scope.rootPath);

  // Copy the default files.
  fs.copySync(path.resolve(__dirname, '..', 'files'), path.resolve(scope.rootPath));

  // Only apply if the `--dry` flag is present.
  // Rewrite the config to add the `dry` key and
  // remove unucessary `databases.json` files.
  if (scope.dry) {
    const configPath = path.resolve(scope.rootPath, 'config', 'general.json');
    const currentConfig = JSON.parse(fs.readFileSync(configPath));
    const newConfig = _.merge(currentConfig, {
      dry: true
    });
    fs.writeFileSync(configPath, JSON.stringify(newConfig, null, '  '));
    fs.removeSync(path.resolve(scope.rootPath, 'config', 'environments', 'development', 'databases.json'));
    fs.removeSync(path.resolve(scope.rootPath, 'config', 'environments', 'production', 'databases.json'));
  }

  // Create symlinks to all necessary node modules
  // in the `node_modules` directory.
  async.auto({
    generatorDependencies: function (cb) {
      fs.mkdir(path.resolve(scope.rootPath, 'node_modules'), cb);
      if (!scope.dry) {
        let pkg;
        let srcDependencyPath;
        const generators = ['email', 'upload', 'users', 'admin'];
        _.forEach(generators, function (generator) {
          pkg = JSON.parse(fs.readFileSync(path.resolve(scope.strapiRoot, 'node_modules', 'strapi-generate-' + generator, 'package.json')));
          _.forEach(pkg.dependencies, function (version, dependency) {
            try {
              require(path.resolve(scope.strapiRoot, 'node_modules', 'strapi-generate-' + generator, 'node_modules', dependency));
              srcDependencyPath = path.resolve(scope.strapiRoot, 'node_modules', 'strapi-generate-' + generator, 'node_modules', dependency);
            } catch (err) {
              require(path.resolve(scope.strapiRoot, 'node_modules', dependency));
              srcDependencyPath = path.resolve(scope.strapiRoot, 'node_modules', dependency);
            }
            const destDependencyPath = path.resolve(scope.rootPath, 'node_modules', dependency);
            fs.symlink(srcDependencyPath, destDependencyPath, 'junction', function (symLinkErr) {
              if (symLinkErr) {
                nonFatalErrors.push(symLinkErr);
              }
              cb();
            });
          });
        });
      } else {
        cb();
      }
    },

    appDependencies: function (cb) {
      const appPkg = JSON.parse(fs.readFileSync(path.resolve(scope.rootPath, 'package.json')));
      delete appPkg.dependencies.strapi;
      if (!scope.dry) {
        _.forEach(appPkg.dependencies, function (version, dependency) {
          const srcDependencyPath = path.resolve(scope.strapiRoot, 'node_modules', dependency);
          const destDependencyPath = path.resolve(scope.rootPath, 'node_modules', dependency);
          fs.symlink(srcDependencyPath, destDependencyPath, 'junction', function (symLinkErr) {
            if (symLinkErr) {
              nonFatalErrors.push(symLinkErr);
            }
            cb();
          });
        });
      } else {
        cb();
      }
    },

    strapi: function (cb) {
      const srcDependencyPath = scope.strapiRoot;
      const destDependencyPath = path.resolve(scope.rootPath, 'node_modules', 'strapi');
      fs.symlink(srcDependencyPath, destDependencyPath, 'junction', function (symLinkErr) {
        if (symLinkErr) {
          nonFatalErrors.push(symLinkErr);
        }
        cb();
      });
    }
  },

  // A "magic" function which outputs an error if necessary.
  function doneGeneratingApp(err) {
    if (err) {
      return cb(err);
    }

    logger.info('Your new application `' + scope.name + '` is ready at `' + scope.rootPath + '`.');
    return cb();
  });
};
