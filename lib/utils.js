'use strict';

var $fs = require('fs');

var $q = require('q');
var $sanitizeFilename = require('sanitize-filename');


module.exports = {
    writeFile: writeFile,
    handleSnapshotCallbacks: handleSnapshotCallbacks,
    createFilename: createFilename,
    incrementFilename: incrementFilename
};


function writeFile (filename, data) {

    var deferred = $q.defer();

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

function handleSnapshotCallbacks (snapshotFunction, self, callbacks, customConfig) {

    return snapshotFunction()
        .then(function (data) {

            var deferreds = [];

            callbacks.forEach(function (callback) {

                deferreds.push(callback(self, data, customConfig));

            });

            if (typeof customConfig === 'function') {

                deferreds.push(customConfig(self, data));

            }

            return $q.allSettled(deferreds);

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

    // remove extension if provided
    basename = basename.replace(/\.[^/.]+$/, '');

    var windowSize;
    var browserName;

    var deferreds = [];

    deferreds.push(browser.getCapabilities()
        .then(function (value) {

            browserName = value.caps_.browserName;
            return browserName;

        }));


    // get current window size and continue
    deferreds.push(browser.manage().window().getSize()
        .then(function (value) {

            windowSize = value;
            return windowSize;

        }));

    $q.allSettled(deferreds)
        .then(function () {

            var filename = basename;

            // perform replacements
            var replacements = {
                resolution: windowSize.width + 'x' + windowSize.height,
                suiteName: self.getSuiteName(),
                specName: self.getSpecName(),
                browser: browserName
            };

            Object.keys(replacements).forEach(function (replacement) {
                filename = filename.split('%' + replacement + '%').join(replacements[replacement]);
            });

            // remove weird characters
            filename = $sanitizeFilename(filename);

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
