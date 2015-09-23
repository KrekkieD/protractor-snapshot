'use strict';

var $q = require('q');

var $image = require('./lib/image');
var $source = require('./lib/source');
var $config = require('./lib/config');
var $utils = require('./lib/utils');

module.exports = new ProtractorSnapshot();
module.exports.saveImage = $image.save;
module.exports.saveSource = $source.save;

function ProtractorSnapshot () {

    // confirm we're in a protractor process
    if (typeof browser === 'undefined') {
        throw 'Could not find a "browser" variable, please confirm this is a protractor process';
    }

    var self = this;

    self.setConfig = setConfig;

    self.cycle = cycle;
    self.image = image;
    self.source = source;

    self.utils = $utils;

    self.getSuiteName = getSuiteName;
    self.getSpecName = getSpecName;

    self.config = undefined;

    self.state = {};

    self.setConfig();

    function setConfig (config) {

        config = config || browser.getProcessedConfig().value_.protractorSnapshotOpts;
        self.config = $config.extract(config);

    }

    function cycle (resolutions, callback) {

        var deferreds = [];

        // cycle over provided or configured resolutions
        if (typeof resolutions === 'function') {
            callback = resolutions;
            resolutions = self.config.resolutions;
        }

        resolutions.forEach(function (resolution) {

            deferreds.push(_resizeBrowser(resolution[0], resolution[1], resolution[2])
                .then(function () {
                    self.state.resolution = [resolution[0], resolution[1]];

                    // perform callback and provide current resolution as argument
                    return callback(resolution);
                }));

        });


        return browser.wait($q.allSettled(deferreds)
            .then(function (promises) {

                // reset window size to default
                return _resizeBrowser(self.config.defaultResolution[0], self.config.defaultResolution[1], self.config.defaultResolution[2])
                    .then(function () {

                        self.state.resolution = [self.config.defaultResolution[0], self.config.defaultResolution[1]];

                        return promises;
                    });

            }));

    }

    function image (customConfig) {

        return browser.wait($image(self, self.config.image.callbacks, customConfig));

    }

    function source (customConfig) {

        return browser.wait($source(self, self.config.source.callbacks, customConfig));

    }

    function getSuiteName () {

        return jasmine.getEnv().currentSpec.suite.description;

    }

    function getSpecName () {

        return jasmine.getEnv().currentSpec.description;

    }

    function _resizeBrowser (width, height, type) {

        var promise = browser.manage().window().setSize(width, height);

        if (type === 'viewport') {

            // calculate offset
            promise = promise.then(function () {
                element(by.css('body')).getSize()
                    .then(function (value) {

                        // fix the values, but make sure we're not ending up with smaller values
                        width = Math.max(width - value.width + width, width);

                        height = Math.max(height - value.height + height, height);

                        return _resizeBrowser(width, height, 'window');

                    });
            });

        }

        return promise;

    }

}
