'use strict';

var $fs = require('fs');
var $path = require('path');

var $q = require('q');
var $sanitizeFilename = require('sanitize-filename');
var $mkdirp = require('mkdirp');
var $rimraf = require('rimraf');


module.exports = {
    writeFile: writeFile,
    handleSnapshotCallbacks: handleSnapshotCallbacks,
    createFilename: createFilename,
    incrementFilename: incrementFilename,
    clearTarget: clearTarget
};


function writeFile (filename, data, incrementValue) {

    var deferred = $q.defer();

    incrementValue = incrementValue || 0;

    var incrementedFilename = incrementFilename(filename, incrementValue);

    // create folder to hold file
    createPathToFile(filename);

    $fs.writeFile(incrementedFilename, data, { flag: 'wx' }, function (err) {

        if (err) {

            // only retry if the file exists but incrementedFilename shows signs of an increment value
            if (err.code === 'EEXIST' && filename !== incrementedFilename) {

                incrementValue++;

                // call recursively
                writeFile(filename, data, incrementValue)
                    .then(function (filename) {
                        deferred.resolve(filename);
                    }, function (err) {
                        deferred.reject(err);
                    });

            }
            else {
                deferred.reject(err);
            }
        }
        else {
            deferred.resolve(incrementedFilename);
        }

    });

    return deferred.promise;

}

function handleSnapshotCallbacks (snapshotFn, self, callbacks, customConfig) {

    return snapshotFn()
        .then(function (data) {

            var deferreds = [];

            callbacks.forEach(function (callback) {

                deferreds.push(callback(self, data, customConfig));

            });

            if (typeof customConfig === 'function') {

                deferreds.push(customConfig(self, data));

            }

            return $q.allSettled(deferreds)
                .then(function (promises) {
                    return promises;
                });

        });

}

function incrementFilename (filename, incrementValue) {

    return filename.split('%increment%').join(incrementValue);

}

function createFilename (self, customConfig, extension) {

    var deferred = $q.defer();

    var basename;
    if (typeof customConfig === 'string') {
        basename = customConfig;
    }
    else {
        basename = self.config.basename;
    }

    // parse folders in basename
    basename = basename.split(/\/|\\/).join($path.sep);

    // remove extension if provided
    basename = basename.replace(/\.[^/.]+$/, '');

    var browserName;

    var deferreds = [];

    deferreds.push(browser.getCapabilities()
        .then(function (value) {

            browserName = value.caps_.browserName;
            return browserName;

        }));


    // get current window size and continue
    if (!self.state.resolution) {

        deferreds.push(browser.manage().window().getSize()
            .then(function (value) {

                self.state.resolution = [value.width, value.height];
                return self.state.resolution;


            }));

    }


    $q.allSettled(deferreds)
        .then(function () {

            var filename = basename;

            // perform replacements
            var replacements = {
                resolution: self.state.resolution[0] + 'x' + self.state.resolution[1],
                suiteName: self.getSuiteName(),
                suiteId: ('0' + self.getSuiteId()).substr(-2),
                specName: self.getSpecName(),

                // get spec index as nn, prefixed with a 0 when required for file ordering
                specId: ('0' + self.getSpecId()).substr(-2),
                browser: browserName
            };

            Object.keys(replacements).forEach(function (replacement) {
                filename = filename.split('%' + replacement + '%').join(replacements[replacement]);
            });

            // remove weird characters from each of the parts
            var pathParts = filename.split($path.sep);
            pathParts.forEach(function (value, key) {
                pathParts[key] = $sanitizeFilename(value);
            });
            filename = pathParts.join($path.sep);

            if (!filename) {
                throw 'Invalid filename provided';
            }

            // add extension
            filename += extension;

            deferred.resolve(filename);

        });

    return deferred.promise;

}

function createPathToFile (filename) {

    $mkdirp.sync($path.dirname(filename));

}

function clearTarget (path) {

    $rimraf.sync(path);

}
