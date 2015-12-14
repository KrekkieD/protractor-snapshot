'use strict';

var $path = require('path');

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

            self.log(filename);

            return self.utils.writeFile(filename, data);

        });

}
