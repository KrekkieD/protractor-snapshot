'use strict';

var $path = require('path');
var $fs = require('fs');
var $q = require('q');

var $mkdirp = require('mkdirp');
var $sanitizeFilename = require('sanitize-filename');

module.exports = imageSnapshot;
module.exports.save = save;


function imageSnapshot (self, callbacks, customConfig) {

    return browser.takeScreenshot()
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

function save (self, data, customConfig) {

    var deferred = $q.defer();

    var filename;
    if (typeof customConfig === 'string') {
        filename = customConfig;
    }
    else {

        // use jasmine suite and spec name
        filename = [
            self.getSuiteName(),
            self.getSpecName()
        ].join(' - ');

    }

    // get current window size and continue
    browser.manage().window().getSize()
        .then(function (value) {

            // remove extension if provided
            filename = filename.replace(/\.[^/.]+$/, '');

            // remove weird characters
            filename = $sanitizeFilename(filename);

            if (!filename) {
                throw 'Invalid filename provided';
            }

            filename += ' (' + value.width + 'x' + value.height + ')';


            // add proper extension
            filename += '.png';

            // create target directory to make sure it exists
            $mkdirp.sync(self.config.image.target);

            // prepend target directory
            filename = $path.resolve(self.config.image.target, filename);

            $fs.writeFile(filename, new Buffer(data, 'base64'), function (err) {

                if (err) {
                    deferred.reject(err);
                }
                else {
                    deferred.resolve(filename);
                }

            });

        });

    return deferred.promise;

}
