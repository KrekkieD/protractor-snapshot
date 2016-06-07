'use strict';

var $upTheTree = require('up-the-tree');
var $seleniumJar = require('selenium-server-standalone-jar');
var $chromeDriver = require('chromedriver');

module.exports.config = {

    allScriptsTimeout: 15000,
    getPageTimeout: 15000,

    capabilities: {
        browserName: 'firefox',
        version: 'ANY',
        platform: 'ANY',

        chromeOptions: {
            args: ['--test-type']
        }
    },

    chromeDriver: $chromeDriver.path,

    baseUrl: 'http://localhost:8010/',

    seleniumServerJar: $seleniumJar.path,

    framework: 'jasmine2',

    jasmineNodeOpts: {
        defaultTimeoutInterval: 15000,
        isVerbose: true,
        showColors: true,
        includeStackTrace: false
    },

    maxSessions: 1,

    rootElement: '[ng-app]',

    protractorSnapshotOpts: {
        image: {
            target: './reports/protractor-snapshot/custom/image',
            callbacks: [
                function () {
                    return 'customImageCallback';
                }
            ]
        },
        source: {
            target: './reports/protractor-snapshot/custom/source',
            callbacks: [
                function () {
                    return 'customSourceCallback';
                }
            ]
        },
        imageCompare: {
            threshold: 95
        },
        defaultResolution: [700, 700],
        resolutions: [
            [1366, 768, 'window']
        ],
        onInit: function ($protractorSnapshot) {

            $protractorSnapshot.clearTarget('./reports');

        }
    }

};

module.exports.config.implicitWait = 9000;


module.exports.config.onPrepare = function () {

    // start server
    require($upTheTree() + '/test/test-server');

    var $protractorSnapshot = require('..');
    $protractorSnapshot.addReporter();

};

module.exports.config.beforeLaunch = function () {

    var $protractorSnapshot = require('..');
    $protractorSnapshot.clearTarget('./reports');

};
