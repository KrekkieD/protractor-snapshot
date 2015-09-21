'use strict';

var $path = require('path');
var $fs = require('fs');

var $mkdirp = require('mkdirp');
var $sanitizeFilename = require('sanitize-filename');

module.exports = imageSnapshot;
module.exports.save = save;


function imageSnapshot (self, callbacks, customConfig) {

    return browser.takeScreenshot()
        .then(function (data) {

            callbacks.forEach(function (callback) {

                callback(self, data, customConfig);

            });

        });

}

function save (self, data, customConfig) {

    var filename;
    if (typeof customConfig === 'string') {
        filename = customConfig;

        if (!filename) {
            throw 'Invalid filename provided';
        }
    }
    else {
        // use jasmine suite and spec name
        filename = $sanitizeFilename([self.getSuiteName(), self.getSpecName()].join(' - '));

        if (!filename) {
            throw 'Could not generate a filename based on the jasmine suite and spec name';
        }
    }

    // remove extension if provided
    filename = filename.replace(/\.[^/.]+$/, '');

    // add proper extension
    filename += '.png';

    // create target directory to make sure it exists
    $mkdirp.sync(self.config.image.target);

    // prepend target directory
    filename = $path.resolve(self.config.image.target, filename);

    $fs.writeFile(filename, data, function (err) {
        if (err) {
            throw err;
        }
    });

    //var stream = $fs.createWriteStream(filename);
    //stream.write(new Buffer(data, 'base64'));
    //stream.end();

}
