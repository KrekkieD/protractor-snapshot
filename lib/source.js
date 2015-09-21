'use strict';

var $mkdirp = require('mkdirp');
var $sanitizeFilename = require('sanitize-filename');
var $q = require('q');

var $path = require('path');
var $fs = require('fs');

module.exports = sourceSnapshot;
module.exports.save = save;


function sourceSnapshot (self, callbacks, customConfig) {

    return browser.getPageSource()
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
            filename += '.html';

            // create target directory to make sure it exists
            $mkdirp.sync(self.config.source.target);

            // prepend target directory
            filename = $path.resolve(self.config.source.target, filename);

            $fs.writeFile(filename, data, function (err) {

                err ? deferred.reject(err) : deferred.resolve(filename);

            });

        });


    return deferred.promise;

}
