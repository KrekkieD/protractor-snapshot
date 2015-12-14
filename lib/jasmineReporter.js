'use strict';

module.exports = ProtractorSnapshotJasmineReporter;

function ProtractorSnapshotJasmineReporter () {

    var self = this;

    self.suiteStarted = suiteStarted;
    self.suiteDone = suiteDone;
    self.specStarted = specStarted;
    self.specDone = specDone;

    self.suite = undefined;
    self.spec = undefined;

    function suiteStarted (result) {

        self.suite = result;

        var env = jasmine.getEnv();

        env.currentSpec = env.currentSpec || {};
        env.currentSpec.suite = result ;

    }

    function suiteDone () {

        self.suite = undefined;

        var env = jasmine.getEnv();
        if (env && env.currentSpec) {
            delete env.currentSpec.suite;
        }

    }

    function specStarted (result) {

        self.spec = result;

        var env = jasmine.getEnv();

        env.currentSpec = result;
        env.currentSpec.suite = self.suite;

    }

    function specDone () {

        self.spec = undefined;

        var env = jasmine.getEnv();
        if (env && env.currentSpec) {
            delete jasmine.getEnv().currentSpec;
        }

    }

}
