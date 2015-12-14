'use strict';

var $q = require('q');

var $image = require('./lib/image');
var $source = require('./lib/source');
var $config = require('./lib/config');
var $utils = require('./lib/utils');
var $reporter = require('./lib/jasmineReporter');
var $log = require('./lib/log');

module.exports = new ProtractorSnapshot();
module.exports.saveImage = $image.save;
module.exports.saveSource = $source.save;
module.exports.defaultConfig = $config.defaultConfig;
module.exports.clearTarget = $utils.clearTarget;

function ProtractorSnapshot () {

    var initialized = false;
    var configured = false;

    var self = this;

    self.report = {};

    self.jasmineVersion = 1;

    self.setConfig = setConfig;

    self.cycle = cycle;
    self.image = image;
    self.source = source;

    self.utils = $utils;

    self.getSuiteName = getSuiteName;
    self.getSuiteId = getSuiteId;

    self.getSpecName = getSpecName;
    self.getSpecId = getSpecId;

    self.getResolution = getResolution;

    self.addReporter = addReporter;
    self.log = log;
    self.resizeBrowser = resizeBrowser;

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

            deferreds.push(resizeBrowser(resolution[0], resolution[1], resolution[2])
                .then(function () {
                    self.state.resolution = [resolution[0], resolution[1]];

                    // perform callback and provide current resolution as argument
                    return callback(resolution);
                }));

        });


        return browser.wait($q.allSettled(deferreds)
            .then(function (promises) {

                // reset window size to default
                return resizeBrowser(self.config.defaultResolution[0], self.config.defaultResolution[1], self.config.defaultResolution[2])
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

    function getResolution () {

        return self.state.resolution[0] + 'x' + self.state.resolution[1];

    }

    function getSuiteName () {

        var suite = _getSpec().suite || {};

        return suite.description || 'unknown-suite-name';

    }

    function getSuiteId () {

        var suite = _getSpec().suite || {};

        var suiteId = 'unknown-suite-id';
        if (typeof suite.id !== 'undefined') {

            suiteId = suite.id;

            // jasmine v1 has an int as suiteId, v2 has a string
            if (self.jasmineVersion === 1) {
                // only jasmine v1 has a 0-based suiteId
                suiteId++;
            }
            else {
                suiteId = suiteId.replace(/[^\d]+/g, '');
                suiteId = parseInt(suiteId, 10);
            }
        }

        return suiteId;

    }

    function getSpecName () {

        return _getSpec().description || 'unknown-spec-name';

    }

    function getSpecId () {

        var specId = 'unknown-spec-id';

        if (typeof _getSpec().id !== 'undefined') {

            specId = _getSpec().id;

            if (self.jasmineVersion > 1) {
                specId = specId.replace(/[^\d]+/g, '');
                specId = parseInt(specId, 10);
            }

            // for some reason both jasmine v1 and v2 have a 0-based specId. Consistent much?
            specId++;

        }

        return specId;

    }


    function addReporter () {

        // property is not present in jasmine v1 so use it as indication of v2+
        if (typeof jasmine.version !== 'undefined') {
            self.jasmineVersion = jasmine.version.split('.').shift();
            jasmine.getEnv().addReporter(new $reporter(self));
        }

    }

    function log (filename) {

        $log.log(self, filename);

    }

    function _getSpec () {

        return jasmine.getEnv().currentSpec || {};

    }

    function resizeBrowser (width, height, type) {

        var promise;

        if (typeof height === 'string' && height.toLowerCase() === 'full') {

            type = 'viewport';

            // first resize the browser to the current height with the new width, to prevent responsiveness errors
            promise = browser.driver.manage().window().getSize()
                .then(function (value) {

                    return browser.driver.manage().window().setSize(width, value.height);

                });

            promise = promise.then(function () {

                return browser.driver.executeScript(function () {

                    var body = document.body;
                    var html = document.documentElement;

                    return Math.max(
                        body.scrollHeight,
                        body.offsetHeight,
                        html.clientHeight,
                        html.scrollHeight,
                        html.offsetHeight
                    );

                }).then(function (viewPortHeight) {

                    height = viewPortHeight;
                    return browser.driver.manage().window().setSize(width, viewPortHeight);

                });

            });


        }
        else {
            promise = browser.manage().window().setSize(width, height);
        }

        if (type === 'viewport') {

            // calculate offset
            promise = promise.then(function () {

                return browser.driver.executeScript(function () {

                    return {
                        height: Math.max(
                            document.documentElement.clientHeight,
                            window.innerHeight || 0
                        ),
                        width: Math.max(
                            document.documentElement.clientWidth,
                            window.innerWidth || 0
                        )
                    };

                }).then(function (value) {

                    // fix the values, but make sure we're not ending up with smaller values
                    width = Math.max(value.width, width - value.width + width, width);

                    height = Math.max(value.height, height - value.height + height, height);

                    return resizeBrowser(width, height, 'window');

                });

            });

        }

        return promise;

    }

}
