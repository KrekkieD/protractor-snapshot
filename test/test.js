'use strict';

var $path = require('path');
var $spawn = require('child_process').spawn;

var $upTheTree = require('up-the-tree');
var $q = require('q');

module.exports = runProtractor;

if (!module.parent) {
    runProtractor({
        configFile: $path.resolve($upTheTree(), 'test/protractor.conf.js'),
        files: [
            $path.resolve($upTheTree(), 'test/specs') + '/**/*.spec.js'
        ]
    }).done();
}

function runProtractor (options) {

    options = options || {};

    var deferred = $q.defer();

    var files = options.files || [];
    var args = options.args || [];

    if (!options.configFile) {
        throw 'Please specify the protractor config file';
    }

    // Attach Files, if any
    if (files.length) {
        args.push('--specs');
        args.push(files.join(','));
    }

    // Pass in the config file
    args.unshift(options.configFile);

    var winExt = /^win/.test(process.platform) ? '.cmd' : '';

    var protractorPath = $upTheTree.resolve('node_modules/.bin/protractor' + winExt, {
        start: require.resolve('protractor')
    });

    var child = $spawn(protractorPath, args, {
        stdio: 'inherit',
        env: process.env
    }).on('exit', function (code) {

        if (child) {
            child.kill();
        }

        if (code) {
            deferred.reject('protractor exited with code ' + code);
        }
        else {
            deferred.resolve();
        }

    });

    return deferred.promise;
}
