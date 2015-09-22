'use strict';

var $image = require('./image');
var $source = require('./source');

module.exports = {
    extract: extract
};

function extract (providedConfig) {

    var protractorSnapshotOpts = providedConfig || {};

    var defaultConfig = _getDefaultConfig();

    // validate and extend config
    protractorSnapshotOpts.image = protractorSnapshotOpts.image || defaultConfig.image;
    protractorSnapshotOpts.image.target = protractorSnapshotOpts.image.target || defaultConfig.image.target;
    protractorSnapshotOpts.image.callbacks = protractorSnapshotOpts.image.callbacks || defaultConfig.image.callbacks;

    // todo: validate image callbacks is an array of functions

    protractorSnapshotOpts.source = protractorSnapshotOpts.source || defaultConfig.source;
    protractorSnapshotOpts.source.target = protractorSnapshotOpts.source.target || defaultConfig.source.target;
    protractorSnapshotOpts.source.callbacks = protractorSnapshotOpts.source.callbacks || defaultConfig.source.callbacks;

    // todo: validate source callbacks is an array of functions

    protractorSnapshotOpts.imageCompare = protractorSnapshotOpts.imageCompare || defaultConfig.imageCompare;
    protractorSnapshotOpts.imageCompare.threshold = protractorSnapshotOpts.imageCompare.threshold || defaultConfig.imageCompare.threshold;

    // todo: validate imageCompare config

    protractorSnapshotOpts.defaultResolution = protractorSnapshotOpts.defaultResolution || defaultConfig.defaultResolution;

    // todo: validate default resolution

    protractorSnapshotOpts.resolutions = protractorSnapshotOpts.resolutions || defaultConfig.resolutions;

    // todo: validate resolutions

    return protractorSnapshotOpts;

}

function _getDefaultConfig () {

    return {
        image: {
            target: './reports/protractor-snapshot/image',
            callbacks: [
                $image.save
            ]
        },
        source: {
            target: './reports/protractor-snapshot/source',
            callbacks: [
                $source.save
            ]
        },
        imageCompare: {
            threshold: 95
        },
        defaultResolution: [1024, 768],
        resolutions: [
            [1366, 768],
            [768, 1024],
            [1920, 1080],
            [360, 640],
            [320, 568],
            [1280, 800],
            [375, 667],
            [1440, 900],
            [1280, 1024],
            [1600, 900],
            [1680, 1050]
        ]
    };

}
