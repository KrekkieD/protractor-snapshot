'use strict';

var $fs = require('fs');
var $path = require('path');

var $q = require('q');

var $snapshot = require('../..');

describe('Custom config', function () {

    it('Should allow screenshots to be taken', function (done) {

        var deferreds = [];

        browser.get('/index.html');

        deferreds.push($snapshot.image());

        deferreds.push($snapshot.image('my-name'));

        deferreds.push($snapshot.image(function (self, png) {
            return 'customImageCallback';
        }));

        $q.allSettled(deferreds)
            .then(function (promises) {

                promises.forEach(function (promise) {

                    promise.value.forEach(function (callbackPromise) {

                        expect(callbackPromise.value).toBe('customImageCallback');

                    });

                });

                done();

            });

    });

    it('Should allow HTML snapshots to be taken', function (done) {

        var deferreds = [];

        browser.get('/index.html');

        deferreds.push($snapshot.source());

        deferreds.push($snapshot.source('my-name'));

        deferreds.push($snapshot.source(function () {
            return 'customSourceCallback';
        }));

        $q.allSettled(deferreds)
            .then(function (promises) {

                promises.forEach(function (promise) {

                    promise.value.forEach(function (callbackPromise) {

                        expect(callbackPromise.value).toBe('customSourceCallback');

                    });

                });

                done();

            });

    });

    it('Should be able to do responsive snapshot trips', function (done) {

        var resolutions = [];

        $snapshot.cycle(function (resolution) {

            resolutions.push(resolution);
            return resolution;

        }).then(function () {

            var protractorConfig = browser.getProcessedConfig().value_.protractorSnapshotOpts;

            expect(resolutions).toEqual(protractorConfig.resolutions);

            done();

        });

    });

    it('Should use the provided default resolution', function (done) {

        $snapshot.cycle(function () {});

        var protractorConfig = browser.getProcessedConfig().value_.protractorSnapshotOpts;

        browser.manage().window().getSize()
            .then(function (value) {

                expect(value.width).toBe(protractorConfig.defaultResolution[0]);
                expect(value.height).toBe(protractorConfig.defaultResolution[1]);

                done();

            });

    });

    it('Should use the provided target paths', function (done) {

        var protractorConfig = browser.getProcessedConfig().value_.protractorSnapshotOpts;

        delete protractorConfig.image.callbacks;
        delete protractorConfig.source.callbacks;

        browser.get('/index.html');

        $snapshot.setConfig(protractorConfig);

        var deferreds = [];

        deferreds.push($snapshot.image()
            .then(function (promises) {

                promises.forEach(function (promise) {

                    expect(promise.value).toContain($path.sep + 'custom' + $path.sep);
                    expect($fs.existsSync(promise.value)).toBeTruthy();

                });

                return promises;

            }));

        deferreds.push($snapshot.source()
            .then(function (promises) {

                promises.forEach(function (promise) {

                    expect(promise.value).toContain($path.sep + 'custom' + $path.sep);
                    expect($fs.existsSync(promise.value)).toBeTruthy();

                });

                return promises;

            }));

        $q.all(deferreds)
            .then(function () {
                done();
            });

    });

    it('Should remove meta fragments', function (done) {

        var protractorConfig = browser.getProcessedConfig().value_.protractorSnapshotOpts;

        delete protractorConfig.source.callbacks;

        protractorConfig.source.removeMetaFragments = true;

        browser.get('/index.html');

        $snapshot.setConfig(protractorConfig);

        var deferreds = [];

        deferreds.push($snapshot.source()
            .then(function (promises) {

                promises.forEach(function (promise) {

                    expect(promise.value).toContain($path.sep + 'custom' + $path.sep);
                    expect($fs.readFileSync(promise.value).toString()).not.toContain('name="fragment"');

                });

                return promises;

            }));

        $q.all(deferreds)
            .then(function () {
                done();
            });

    });

});
