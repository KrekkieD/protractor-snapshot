'use strict';

var $fs = require('fs');

var $snapshot = require('../..');

var $q = require('q');

xdescribe('The Snapshot module', function () {

    beforeEach(function () {
        $snapshot.setConfig({});
    });

    afterEach(function () {
        $snapshot.setConfig();
    });

    it('Should allow screenshots to be taken', function (done) {

        browser.get('/index.html');

        var deferreds = [];

        deferreds.push($snapshot.image()
            .then(function (promises) {

                promises.forEach(function (promise) {

                    expect(promise.state).toBe('fulfilled');
                    expect(promise.value).toContain('The Snapshot module - Should allow screenshots to be taken');
                    expect(promise.value).toContain('.png');

                    expect($fs.existsSync(promise.value)).toBeTruthy();

                });

                return promises;

            }));

        deferreds.push($snapshot.image('my-name')
            .then(function (promises) {

                promises.forEach(function (promise) {

                    expect(promise.state).toBe('fulfilled');
                    expect(promise.value).toContain('my-name');
                    expect(promise.value).toContain('.png');

                    expect($fs.existsSync(promise.value)).toBeTruthy();

                });

                return promises;

            }));

        deferreds.push($snapshot.image(function (self, png) {

            expect(self).toBe($snapshot);

            return png;

        }).then(function (promises) {

            expect(promises.length).toBe(2);

            promises.forEach(function (promise) {

                expect(promise.state).toBe('fulfilled');

            });

        }));

        $q.all(deferreds)
            .then(function () {
                done();
            });

    });

    it('Should allow HTML snapshots to be taken', function (done) {

        browser.get('/index.html');

        var deferreds = [];

        deferreds.push($snapshot.source()
            .then(function (promises) {

                promises.forEach(function (promise) {

                    expect(promise.state).toBe('fulfilled');
                    expect(promise.value).toContain('The Snapshot module - Should allow HTML snapshots to be taken');
                    expect(promise.value).toContain('.html');

                    expect($fs.existsSync(promise.value)).toBeTruthy();

                });

                return promises;

            }));

        deferreds.push($snapshot.source('my-name')
            .then(function (promises) {

                promises.forEach(function (promise) {

                    expect(promise.state).toBe('fulfilled');
                    expect(promise.value).toContain('my-name');
                    expect(promise.value).toContain('.html');

                    expect($fs.existsSync(promise.value)).toBeTruthy();

                });

                return promises;

            }));

        deferreds.push($snapshot.source(function (self, data) {

            expect(self).toBe($snapshot);

            return data;

        }).then(function (promises) {

            expect(promises.length).toBe(2);

            promises.forEach(function (promise) {

                expect(promise.state).toBe('fulfilled');

            });

        }));

        $q.all(deferreds)
            .then(function () {
                done();
            });

    });

    it('Should be able to cycle through resolutions defined in config', function (done) {

        var deferreds = [];

        var resolutions = [];
        deferreds.push($snapshot.cycle(function (resolution) {
            resolutions.push(resolution);
            return resolution;
        }).then(function (promises) {
            expect(resolutions).toEqual($snapshot.config.resolutions);
            return promises;
        }));

        $q.all(deferreds)
            .then(function () {
                done();
            });

    });

    it('Should be able to cycle through custom resolutions', function (done) {

        var deferreds = [];

        // should allow a custom set of resolutions
        var customResolutions = [];
        deferreds.push($snapshot.cycle([
            [400, 800]
        ], function (resolution) {
            customResolutions.push(resolution);
            return resolution;
        }).then(function (promises) {
            expect(customResolutions).toEqual([[400, 800]]);
            return promises;
        }));

        $q.all(deferreds)
            .then(function () {
                done();
            });

    });

    it('Should be able to create snapshots during the cycle', function (done) {

        var deferreds = [];

        deferreds.push($snapshot.cycle(function () {

            return $q.allSettled([
                $snapshot.image(),
                $snapshot.source()
            ]);

        }).then(function (cyclePromises) {

            cyclePromises.forEach(function (promise) {

                expect(promise.state).toBe('fulfilled');

                // loop over nested promises
                promise.value.forEach(function (subPromise) {

                    expect(subPromise.state).toBe('fulfilled');

                });

            });

            return cyclePromises;
        }));

        $q.all(deferreds)
            .then(function () {
                done();
            });

    });

    it('Should restore the window size after cycling', function (done) {

        $snapshot.cycle(function () {})
            .then(function () {

                browser.manage().window().getSize()
                    .then(function (value) {

                        expect(value.width).toBe($snapshot.config.defaultResolution[0]);
                        expect(value.height).toBe($snapshot.config.defaultResolution[1]);

                        done();

                    });

            });

    });

});
