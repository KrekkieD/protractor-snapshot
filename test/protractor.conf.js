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
        },
        proxy: {
            proxyType: 'manual',
            httpProxy: 'https://localhost:8010',
            noProxy: '*.klm.com,*.static-afkl.com,localhost,*.localhost.nl'
        }
    },

    chromeDriver: $chromeDriver.path,

    baseUrl: 'https://localhost:8010/',

    seleniumServerJar: $seleniumJar.path,

    framework: 'jasmine',

    jasmineNodeOpts: {
        defaultTimeoutInterval: 25000,
        isVerbose: true,
        showColors: true,
        includeStackTrace: false
    },

    maxSessions: 1,

    rootElement: '[ng-app]',

    protractorSnapshotOpts: {
        screenshotPath: './reports/protractor/screenshots',
        supportedResolutions: [

            [1366,768],
            [768,1024],
            [1920,1080],
            [360,640],
            [320,568],
            [1280,800],
            [375,667],
            [1440,900],
            [1280,1024],
            [1600,900],
            [1680,1050]

        ]
    }

};

module.exports.config.implicitWait = 9000;

module.exports.config.onPrepare = function () {

    // start server
    require($upTheTree() + '/test/servers/server');

    // start mockserver (for target uris)
    require('./mockserver');

    browser.manage().timeouts().implicitlyWait(module.exports.config.implicitWait);

};
