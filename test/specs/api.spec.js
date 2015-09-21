'use strict';

var $snapshot = require('../..');

describe('api example', function () {

    xit('Should get config from protractor.conf', function () {



    });

    it('Should allow screenshots to be taken', function () {

        $snapshot.image();
        //
        //$snapshot.image('my-name');
        //
        //$snapshot.image(function (png) {
        //    // custom handler
        //});
        //
        //$snapshot.image('my-name', function (png) {
        //    // custom handler
        //});
        //
        //$snapshot.image({
        //
        //});

    });

    it('Should allow HTML snapshots to be taken', function () {

        $snapshot.source();

        //$snapshot.source('my-name');

    });

    xit('Should be able to do responsive snapshot trips', function () {

        $snapshot.cycle($snapshot.image());

        $snapshot.cycle($snapshot.source());

        $snapshot.cycle([
            [400,800]
        ], $snapshot.source());

    });

});
