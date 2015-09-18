'use strict';

var $screenshot = require('./lib/screenshot');
var $snapshot = require('./lib/snapshot');

module.exports = new protractorSnapshot();
module.exports.screenshot = $screenshot;
module.exports.snapshot = $snapshot;
module.exports.cycle = cycle;

function ProtractorSnapshot () {

    var self = this;

    self.cycle = cycle;
    self.image = image;
    self.source = source;

    // confirm we're in a protractor process
    if (typeof browser === 'undefined') {
        throw 'Could not find a "browser" variable, please confirm this is a protractor process';
    }

    return {
        cycle: self.cycle,
        image: self.image,
        source: self.source
    };

    // extract protractor config on require of the module
    console.log(jasmine.getEnv().currentSpec.suite.description);
    console.log(jasmine.getEnv().currentSpec.description);
    console.log(browser.getProcessedConfig().value_.projectConfiguration);

    function cycle () {

        // cycle over provided or configured resolutions


    }

    function image () {



    }

    function source () {



    }

}


function cycle (resolutions) {

    // iterate over provided resolutions or config resolutions
    resolutions = resolutions || config.resolutions;

    if (!Array.isArray(resolutions)) {
        throw 'cycle() expects an array of resolutions as argument, or defined in config';
    }


    return {
        image: function () {
            resolutions.forEach(function (resolution) {

            });
        },
        source: function () {
            resolutions.forEach(function (resolution) {

                // resize window
                // booger.resize(resolution);

                // perform function call
                $snapshot.apply(null, Array.prototype.slice.call(arguments));

            });
        }
    };

}


function _validateSnapshotConfig (config) {

    var validatedConfig = {};



}

function _getDefaultConfig () {

    return {
        snapshot: {
            callbacks: [
                $screenshot._save
            ]
        },
        screenshot: {
            callbacks: [
                $screenshot._save
            ]
        },
        screenshotCompare: {
            threshold: 95
        }
    };

}

function _createInstance (config) {

    var i = new Instance(config);


}

function Instance (config) {

    var self = this;
    self.config = config;

    self.snapshot = $snapshot;
    self.screenshot = $screenshot;

}
