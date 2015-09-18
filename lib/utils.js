'use strict';

var $mkdirp = require('mkdirp');

function createOutputDir (path) {

    $mkdirp.sync(path);

}

function cleanDir (path) {

}

function writeFile (path, data) {

}


function getBrowserName () {

    browser.getCapabilities().then(function (cap) {
        browser.browserName = cap.caps_.browserName;
    });

}
