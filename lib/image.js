'use strict';

var $path = require('path');

var $mkdirp = require('mkdirp');

module.exports = imageSnapshot;
module.exports.save = save;


function imageSnapshot (self, callbacks, customConfig) {

    return self.utils.handleSnapshotCallbacks(browser.takeScreenshot, self, callbacks, customConfig);

}

function save (self, data, customConfig) {

    return self.utils.createFilename(self, customConfig, '.png')
        .then(function (filename) {

            // prepend target directory
            filename = $path.resolve(self.config.image.target, filename);

            // create target directory to make sure it exists
            $mkdirp.sync(self.config.image.target);

            return self.utils.writeFile(filename, new Buffer(data, 'base64'));

        });

}
