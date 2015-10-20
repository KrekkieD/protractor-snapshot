'use strict';

var $fs = require('fs');
var $path = require('path');

var $snapshot = require('../..');

var $q = require('q');

describe('The Snapshot module', function () {

    beforeEach(function () {
        $snapshot.setConfig({});

        browser.get('/index.html');

    });

    afterEach(function () {
        $snapshot.setConfig();
    });

    it('Should allow screenshots to be taken', function (done) {


        var deferreds = [];

        deferreds.push($snapshot.image()
            .then(function (promises) {

                promises.forEach(function (promise) {

                    expect(promise.state).toBe('fulfilled');
                    expect(promise.value).toContain('02 - The Snapshot module');
                    expect(promise.value).toContain('- 06 - Should allow screenshots to be taken');
                    expect(promise.value).toContain('.png');
                    expect(promise.value).toContain($path.sep + 'image' + $path.sep);

                    expect($fs.existsSync(promise.value)).toBeTruthy();

                });

                return promises;

            }));

        deferreds.push($snapshot.image('my-name (%increment%)')
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

            return promises;

        }));

        $q.all(deferreds)
            .then(function () {
                done();
            });

    });

    it('Should allow HTML snapshots to be taken', function (done) {

        var deferreds = [];

        deferreds.push($snapshot.source()
            .then(function (promises) {

                promises.forEach(function (promise) {

                    expect(promise.state).toBe('fulfilled');
                    expect(promise.value).toContain('02 - The Snapshot module');
                    expect(promise.value).toContain('- 07 - Should allow HTML snapshots to be taken');
                    expect(promise.value).toContain('.html');
                    expect(promise.value).toContain($path.sep + 'source' + $path.sep);

                    expect($fs.existsSync(promise.value)).toBeTruthy();

                });

                return promises;

            }));

        deferreds.push($snapshot.source('my-name (%increment%)')
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
            expect(data).toContain('<html');

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

    it('Should automatically increment filenames if it exists', function (done) {

        var deferreds = [];

        var uniqueNames = [];

        // need to make sure this also works once we start hitting double digits
        for (var i = 0, iMax = 15; i < iMax; i++) {

            deferreds.push($snapshot.image()
                .then(function (promises) {

                    promises.forEach(function (promise) {
                        expect(uniqueNames.indexOf(promise.value)).toBe(-1);
                        expect($fs.existsSync(promise.value)).toBeTruthy();
                        uniqueNames.push(promise.value);
                    });

                    return promises;

                }));

            deferreds.push($snapshot.source()
                .then(function (promises) {

                    promises.forEach(function (promise) {
                        expect(uniqueNames.indexOf(promise.value)).toBe(-1);
                        expect($fs.existsSync(promise.value)).toBeTruthy();
                        uniqueNames.push(promise.value);
                    });

                    return promises;

                }));


            deferreds.push($snapshot.image('my-custom-name %increment%')
                .then(function (promises) {

                    promises.forEach(function (promise) {
                        expect(uniqueNames.indexOf(promise.value)).toBe(-1);
                        expect($fs.existsSync(promise.value)).toBeTruthy();
                        uniqueNames.push(promise.value);
                    });

                    return promises;

                }));

            deferreds.push($snapshot.source('my-custom-name %increment%')
                .then(function (promises) {

                    promises.forEach(function (promise) {
                        expect(uniqueNames.indexOf(promise.value)).toBe(-1);
                        expect($fs.existsSync(promise.value)).toBeTruthy();
                        uniqueNames.push(promise.value);
                    });

                    return promises;

                }));

        }

        $q.allSettled(deferreds)
            .then(function () {
                done();
            });

    });

    it('Should replace variables in the filename', function (done) {

        $snapshot.image('%browser% - %suiteId% - %suiteName% - %specId% - %specName% - %resolution% (%increment%)')
            .then(function (promises) {

                promises.forEach(function (promise) {

                    expect(promise.value.indexOf('%')).toBe(-1);
                    expect(promise.value.indexOf('firefox')).toBeGreaterThan(-1);
                    expect(promise.value.indexOf('The Snapshot module')).toBeGreaterThan(-1);
                    expect(promise.value.indexOf('Should replace variables')).toBeGreaterThan(-1);
                });

                done();

            });

    });

    it('Should allow folder separators in the filename', function (done) {

        var deferreds = [];

        deferreds.push($snapshot.image('%browser%/%resolution%/%suiteName% - %specName% - %resolution% (%increment%)')
            .then(function (promises) {

                promises.forEach(function (promise) {

                    expect(promise.value.indexOf('%')).toBe(-1);
                    expect(promise.value.indexOf($path.sep + 'firefox' + $path.sep)).toBeGreaterThan(-1);
                    expect(promise.value.indexOf($path.sep + '1024x768' + $path.sep)).toBeGreaterThan(-1);
                    expect(promise.value.indexOf('The Snapshot module')).toBeGreaterThan(-1);
                    expect(promise.value.indexOf('Should allow folder separators')).toBeGreaterThan(-1);
                });

                return promises;

            }));

        deferreds.push($snapshot.image('%resolution%\\%browser%\\%suiteName% - %specName% - %resolution% (%increment%)')
            .then(function (promises) {

                promises.forEach(function (promise) {

                    expect(promise.value.indexOf('%')).toBe(-1);
                    expect(promise.value.indexOf($path.sep + 'firefox' + $path.sep)).toBeGreaterThan(-1);
                    expect(promise.value.indexOf($path.sep + '1024x768' + $path.sep)).toBeGreaterThan(-1);
                    expect(promise.value.indexOf('The Snapshot module')).toBeGreaterThan(-1);
                    expect(promise.value.indexOf('Should allow folder separators')).toBeGreaterThan(-1);
                });

                return promises;

            }));

        deferreds.push($snapshot.source('%browser%/%resolution%/%suiteName% - %specName% - %resolution% (%increment%)')
            .then(function (promises) {

                promises.forEach(function (promise) {

                    expect(promise.value.indexOf('%')).toBe(-1);
                    expect(promise.value.indexOf($path.sep + 'firefox' + $path.sep)).toBeGreaterThan(-1);
                    expect(promise.value.indexOf($path.sep + '1024x768' + $path.sep)).toBeGreaterThan(-1);
                    expect(promise.value.indexOf('The Snapshot module')).toBeGreaterThan(-1);
                    expect(promise.value.indexOf('Should allow folder separators')).toBeGreaterThan(-1);
                });

                return promises;

            }));

        deferreds.push($snapshot.source('%resolution%\\%browser%\\%suiteName% - %specName% - %resolution% (%increment%)')
            .then(function (promises) {

                promises.forEach(function (promise) {

                    expect(promise.value.indexOf('%')).toBe(-1);
                    expect(promise.value.indexOf($path.sep + 'firefox' + $path.sep)).toBeGreaterThan(-1);
                    expect(promise.value.indexOf($path.sep + '1024x768' + $path.sep)).toBeGreaterThan(-1);
                    expect(promise.value.indexOf('The Snapshot module')).toBeGreaterThan(-1);
                    expect(promise.value.indexOf('Should allow folder separators')).toBeGreaterThan(-1);
                });

                return promises;

            }));

        $q.allSettled(deferreds)
            .then(function () {
                done();
            });

    });

    it('Should throw errors when config values are not ok', function () {

        var tests = [
            {
                obj: { basename: 3 }
            },

            // image must be an object
            {
                obj: { image: 3 }
            },
            {
                obj: { image: 'string' }
            },
            {
                obj: { image: function () {} }
            },

            // image.target must be a string
            {
                obj: { image: { target: 3 } }
            },
            {
                obj: { image: { target: {} } }
            },
            {
                obj: { image: { target: function () {} } }
            },

            // image.callbacks must be an array of functions
            {
                obj: { image: { callbacks: 3 } }
            },
            {
                obj: { image: { callbacks: {} } }
            },
            {
                obj: { image: { callbacks: [1] } }
            },

            // source must be an object
            {
                obj: { source: 3 }
            },
            {
                obj: { source: 'string' }
            },
            {
                obj: { source: function () {} }
            },

            // source.target must be a string
            {
                obj: { source: { target: 3 } }
            },
            {
                obj: { source: { target: {} } }
            },
            {
                obj: { source: { target: function () {} } }
            },

            // source.callbacks must be an array of functions
            {
                obj: { source: { callbacks: 3 } }
            },
            {
                obj: { source: { callbacks: {} } }
            },
            {
                obj: { source: { callbacks: [1] } }
            },

            // defaultResolution must be an array of 2 ints
            {
                obj: { defaultResolution: 'string' }
            },
            {
                obj: { defaultResolution: 3 }
            },
            {
                obj: { defaultResolution: [] }
            },
            {
                obj: { defaultResolution: ['string', 3] }
            },
            {
                obj: { defaultResolution: [3, 'string'] }
            },
            {
                obj: { defaultResolution: ['string', 'string'] }
            },
            {
                obj: { defaultResolution: [3, 3, 3] }
            },

            // resolutions should be an array of resolutions
            // resolutions themselves are verified through resolution validator as used by default resolution
            {
                obj: { resolutions: [3] }
            },
            {
                obj: { resolutions: ['string'] }
            },
            {
                obj: { resolutions: [[]] }
            },
            {
                obj: { resolutions: [['string', 'string']] }
            }

        ];

        tests.forEach(function (test) {

            expect(function () {

                $snapshot.setConfig(test.obj);

                // log the offending object so we can see which object failed to throw an error.
                // it's for debugging and will only be logged if the function call did not throw
                console.log(test.obj);

            }).toThrow(test.err);

        });

    });

});
