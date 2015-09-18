'use strict';

module.exports = wrapper;
module.exports._save = _save;

function wrapper (self) {

    return screenshot;

    function screenshot (name) {

        return browser.takeScreenshot()
            .then(function (data) {

                self.config.screenshot.callbacks.forEach(function (callback) {

                    callback(self, data);

                });

            });

    }

}

function _save (self, data, filename) {

    var $helpers = require('./helpers');

    $mkdirp.sync($helpers.conf.config.projectConfiguration.screenshotPath);

    filename = $path.resolve($helpers.conf.config.projectConfiguration.screenshotPath, filename) + '.png';

    var stream = $fs.createWriteStream(filename);
    stream.write(new Buffer(data, 'base64'));
    stream.end();

}
