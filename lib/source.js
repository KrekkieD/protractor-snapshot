'use strict';

var $path = require('path');

var $mkdirp = require('mkdirp');

module.exports = sourceSnapshot;
module.exports.save = save;


function sourceSnapshot (self, callbacks, customConfig) {

    return self.utils.handleSnapshotCallbacks(browser.getPageSource, self, callbacks, customConfig);

}

function save (self, data, customConfig) {

    return self.utils.createFilename(self, customConfig, '.html')
        .then(function (filename) {

            // prepend target directory
            filename = $path.resolve(self.config.source.target, filename);

            // create target directory to make sure it exists
            $mkdirp.sync(self.config.source.target);

            return self.utils.writeFile(filename, data);

        });

}
