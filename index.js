'use strict';

var $q = require('q');

var $image = require('./lib/image');
var $source = require('./lib/source');
var $config = require('./lib/config');


module.exports = new ProtractorSnapshot();

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

    self.getSuiteName = getSuiteName;
    self.getSpecName = getSpecName;

    self.config = undefined;

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

            _resizeBrowser(resolution[0], resolution[1]);

            // perform callback and provide resolution as argument
            deferreds.push(callback(resolution));

        });

        // reset window size to default
        _resizeBrowser(self.config.defaultResolution[0], self.config.defaultResolution[1]);

        return $q.allSettled(deferreds);

    }

    function image (customConfig) {

        return $image(self, self.config.image.callbacks, customConfig);

    }

    function source (customConfig) {

        return $source(self, self.config.source.callbacks, customConfig);

    }

    function getSuiteName () {

        return jasmine.getEnv().currentSpec.suite.description;

    }

    function getSpecName () {

        return jasmine.getEnv().currentSpec.description;

    }

    function _resizeBrowser (width, height) {

        browser.manage().window().setSize(width, height);

    }

}
