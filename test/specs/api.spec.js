'use strict';

var $snapshot = require('../..');

describe('api example', function () {

    it('Should get config from protractor.conf', function () {



    });

    it('Should allow screenshots to be taken', function () {

        $snapshot.image();

        $snapshot.image('my-name');

        $snapshot.image(function (png) {
            // custom handler
        });

        $snapshot.image('my-name', function (png) {
            // custom handler
        });

        $snapshot.image({

        });

    });

    it('Should allow HTML snapshots to be taken', function () {

        $snapshot.source();

        $snapshot.source('my-name');

    });

    it('Should be able to do responsive snapshot trips', function () {

        $snapshot.cycle().image();

        $snapshot.cycle().source();

    });

});
