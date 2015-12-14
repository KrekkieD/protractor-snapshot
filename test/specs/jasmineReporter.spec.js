'use strict';

var $snapshot = require('../..');

describe('the Jasmine reporter', function () {

    describe('for version 2', function () {

        it('should be able to handle nested describes', function (done) {

            $snapshot.setConfig({});

            browser.get('/index.html');

            $snapshot.image()
                .then(function (promises) {

                    promises.forEach(function (promise) {

                        expect(promise.value.indexOf('%')).toBe(-1);
                        expect(promise.value.indexOf('unknown')).toBe(-1);
                        expect(promise.value.indexOf('firefox')).toBeGreaterThan(-1);
                        expect(promise.value.indexOf('for version 2')).toBeGreaterThan(-1);
                        expect(promise.value.indexOf('should be able to handle nested describes')).toBeGreaterThan(-1);

                    });

                    done();

                });

        });

    });

    it('should be able to handle specs after nested describes', function (done) {

        $snapshot.setConfig({});

        browser.get('/index.html');

        $snapshot.image()
            .then(function (promises) {

                promises.forEach(function (promise) {

                    expect(promise.value.indexOf('%')).toBe(-1);
                    expect(promise.value.indexOf('unknown')).toBe(-1);
                    expect(promise.value.indexOf('firefox')).toBeGreaterThan(-1);
                    expect(promise.value.indexOf('the Jasmine reporter')).toBeGreaterThan(-1);
                    expect(promise.value.indexOf('should be able to handle specs after nested describes')).toBeGreaterThan(-1);

                });

                done();

            });

    });


});
