'use strict';

var $image = require('./image');
var $source = require('./source');

module.exports = {
    extract: extract
};

function extract (providedConfig) {

    var config = providedConfig || {};

    var defaultConfig = _getDefaultConfig();

    config.basename = _validateBasename(config.basename || defaultConfig.basename);

    // validate and extend config
    config.image = _validateObject(config.image || defaultConfig.image);
    config.image.target = _validateTargetPath(config.image.target || defaultConfig.image.target);
    config.image.callbacks = _validateCallbacks(config.image.callbacks || defaultConfig.image.callbacks);

    config.source = _validateObject(config.source || defaultConfig.source);
    config.source.target = _validateTargetPath(config.source.target || defaultConfig.source.target);
    config.source.callbacks = _validateCallbacks(config.source.callbacks || defaultConfig.source.callbacks);

    // config.imageCompare = config.imageCompare || defaultConfig.imageCompare;
    // config.imageCompare.threshold = config.imageCompare.threshold || defaultConfig.imageCompare.threshold;

    // todo: validate imageCompare config

    config.defaultResolution = _validateResolution(config.defaultResolution || defaultConfig.defaultResolution);

    config.resolutions = _validateResolutions(config.resolutions || defaultConfig.resolutions);

    return config;

}

function _getDefaultConfig () {

    return {
        basename: '%suiteName% - %specName% (%resolution%)',
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
            [1366, 768, 'window'],
            [768, 1024, 'window'],
            [1920, 1080, 'window'],
            [360, 640, 'viewport'],
            [320, 568, 'viewport'],
            [1280, 800, 'window'],
            [375, 667, 'viewport'],
            [1440, 900, 'window'],
            [1280, 1024, 'window'],
            [1600, 900, 'window'],
            [1680, 1050, 'window']
        ]
    };

}

function _validateBasename (name) {

    if (typeof name !== 'string') {
        throw _errorHandler('basename must be a string, got ' + typeof name, { name: name });
    }

    return name;

}

function _validateObject (obj) {

    if (typeof obj !== 'object') {
        throw _errorHandler('Expecting object, got ' + typeof obj, { obj: obj });
    }

    return obj;

}

function _validateTargetPath (path) {

    if (typeof path !== 'string') {
        throw _errorHandler('target must be a string, got ' + typeof path, { path: path });
    }

    return path;

}

function _validateCallbacks (callbacks) {

    if (!Array.isArray(callbacks)) {
        throw _errorHandler('callbacks must be an array', { callbacks: callbacks });
    }

    // loop over each callback to confirm it contains functions
    callbacks.forEach(function (callback) {
        if (typeof callback !== 'function') {
            throw _errorHandler('callback must be a function, got ' + typeof callback, {
                callback: callback,
                callbacks: callbacks
            });
        }
    });

    return callbacks;

}

function _validateResolutions (resolutions) {

    if (!Array.isArray(resolutions)) {
        throw _errorHandler('resolutions must be an array, got ' + typeof resolutions, { resolutions: resolutions });
    }

    // confirm each entry is a valid resolution
    resolutions.forEach(function (resolution, key) {
        resolutions[key] = _validateResolution(resolution);
    });

    return resolutions;

}

function _validateResolution (resolution) {

    if (!Array.isArray(resolution)) {
        throw _errorHandler('resolution must be an array, got ' + typeof resolution, { resolution: resolution });
    }

    // make sure a type is specified for the resolution
    if (resolution.length === 2) {
        resolution.push('window');
    }
    if (resolution.length !== 3) {
        throw _errorHandler('resolution should be an array of [width, height]', { resolution: resolution });
    }

    // confirm int values
    if (typeof resolution[0] !== 'number') {
        throw _errorHandler('resolution[0] (width) must be a number, got ' + typeof resolution[0], { resolution: resolution });
    }
    if (typeof resolution[1] !== 'number') {
        throw _errorHandler('resolution[1] (height) must be a number, got ' + typeof resolution[1], { resolution: resolution });
    }
    if (resolution[2] !== 'window' && resolution[2] !== 'viewport') {
        throw _errorHandler('resolution[2] (type) must be either "window" or "viewport", got ' + resolution[2], { resolution: resolution });
    }

    return resolution;

}

function _errorHandler (message, errorDetailsObject) {

    var err = new Error(message);

    if (errorDetailsObject) {

        if (typeof errorDetailsObject !== 'object') {
            throw 'error details must be an object';
        }

        Object.keys(errorDetailsObject).forEach(function (errorKey) {
            err[errorKey] = errorDetailsObject[errorKey];
        });

    }

    return err;

}
