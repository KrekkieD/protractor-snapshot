'use strict';

module.exports = ProtractorSnapshotJasmineReporter;

function ProtractorSnapshotJasmineReporter ($snapshot) {

    var self = this;

    self.suiteStarted = suiteStarted;
    self.suiteDone = suiteDone;
    self.specStarted = specStarted;
    self.specDone = specDone;
    self.jasmineDone = jasmineDone;

    self.suites = [];
    self.spec = undefined;

    function suiteStarted (result) {

        self.suites.push(result);

        var env = jasmine.getEnv();

        env.currentSpec = env.currentSpec || {};
        env.currentSpec.suite = result ;

    }

    function suiteDone () {

        self.suites.pop();

        var env = jasmine.getEnv();
        if (env && env.currentSpec) {
            delete env.currentSpec.suite;
        }

    }

    function specStarted (result) {

        self.spec = result;

        var env = jasmine.getEnv();

        env.currentSpec = result;
        env.currentSpec.suite = self.suites[self.suites.length - 1];

    }

    function specDone () {

        self.spec = undefined;

        var env = jasmine.getEnv();
        if (env && env.currentSpec) {
            delete jasmine.getEnv().currentSpec;
        }

    }

    function jasmineDone () {

        // make sure there's a config, if not then the module was not initialized
        if (typeof $snapshot.config !== 'undefined') {
            if ($snapshot.config.report) {
                $snapshot.utils.writeFile($snapshot.config.report, JSON.stringify($snapshot.report, null, 4));
            }
        }

    }

}
