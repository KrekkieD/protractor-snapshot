'use strict';

var $fs = require('fs');
var $path = require('path');

var $q = require('q');
var $sanitizeFilename = require('sanitize-filename');
var $mkdirp = require('mkdirp');


module.exports = {
    writeFile: writeFile,
    handleSnapshotCallbacks: handleSnapshotCallbacks,
    createFilename: createFilename,
    incrementFilename: incrementFilename
};


function writeFile (filename, data) {

    var deferred = $q.defer();

    // create folder to hold file
    createPathToFile(filename);

    $fs.writeFile(filename, data, { flag: 'wx' }, function (err) {

        if (err) {

            if (err.code === 'EEXIST') {

                filename = incrementFilename(filename);

                // call recursively
                writeFile(filename, data)
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
            deferred.resolve(filename);
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

function incrementFilename (filename) {

    // increment filename (if it has a number), and try again
    var isIncremented = false;
    filename = filename.replace(/.+(\((\d+)\)\.[a-zA-Z]+)$/, function (path, filenameEnd, incrementNumber) {

        isIncremented = true;

        var newIncrementNumber = parseInt(incrementNumber, 10) + 1;

        var newFilenameEnd = filenameEnd.replace(/\d+/, newIncrementNumber);

        return path.replace(filenameEnd, newFilenameEnd);

    });

    // if there's no number in the filename, we need to add one. We start at 0
    if (!isIncremented) {
        var filenameParts = filename.split('.');
        var ext = filenameParts.pop();
        var relevantFilenamePart = filenameParts.pop();
        relevantFilenamePart += ' (0)';
        filenameParts.push(relevantFilenamePart);
        filenameParts.push(ext);
        filename = filenameParts.join('.');
    }

    return filename;

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

            // add increment number
            filename = incrementFilename(filename);

            deferred.resolve(filename);

        });

    return deferred.promise;

}

function createPathToFile (filename) {

    $mkdirp.sync($path.dirname(filename));

}
