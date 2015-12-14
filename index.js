'use strict';

var $q = require('q');

var $image = require('./lib/image');
var $source = require('./lib/source');
var $config = require('./lib/config');
var $utils = require('./lib/utils');

module.exports = new ProtractorSnapshot();
module.exports.saveImage = $image.save;
module.exports.saveSource = $source.save;
module.exports.defaultConfig = $config.defaultConfig;
module.exports.clearTarget = $utils.clearTarget;


function ProtractorSnapshot () {

    var initialized = false;
    var configured = false;

    var self = this;

    self.setConfig = setConfig;

    self.cycle = cycle;
    self.image = image;
    self.source = source;

    self.utils = $utils;

    self.getSuiteName = getSuiteName;
    self.getSuiteId = getSuiteId;

    self.getSpecName = getSpecName;
    self.getSpecId = getSpecId;

    self.config = undefined;

    self.state = {};

    function init () {

        if (initialized === false && typeof browser !== 'undefined') {

            initialized = true;

            if (configured === false) {
                self.setConfig();
            }

            onInit();

        }

    }

    function setConfig (config) {

        configured = true;

        config = config || browser.getProcessedConfig().value_.protractorSnapshotOpts;
        self.config = $config.extract(config);

    }

    function onInit () {

        if (typeof self.config.onInit !== 'undefined') {

            if (typeof self.config.onInit === 'function') {
                self.config.onInit(self);
            }
            else if (Array.isArray(self.config.onInit)) {

                self.config.onInit.forEach(function (onInitFn) {

                    if (typeof onInitFn !== 'function') {
                        throw 'config.onInit should be a function or array of functions';
                    }

                    onInitFn(self);

                });

            }

        }

    }

    function cycle (resolutions, callback) {

        init();

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

        init();

        return browser.wait($image(self, self.config.image.callbacks, customConfig));

    }

    function source (customConfig) {

        init();

        return browser.wait($source(self, self.config.source.callbacks, customConfig));

    }

    function getSuiteName () {

        return jasmine.getEnv().currentSpec.suite.description;

    }

    function getSuiteId () {

        return jasmine.getEnv().currentSpec.suite.id + 1;

    }

    function getSpecName () {

        return jasmine.getEnv().currentSpec.description;

    }

    function getSpecId () {

        return jasmine.getEnv().currentSpec.id + 1;

    }

    function _resizeBrowser (width, height, type) {

        var promise = browser.manage().window().setSize(width, height);

        if (type === 'viewport') {

            // calculate offset
            promise = promise.then(function () {
                element(by.css('html')).getSize()
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
