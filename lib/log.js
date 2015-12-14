'use strict';

module.exports = {
    log: log
};

function log (self, filename) {

    var record = {
        filename: filename,
        suiteId: self.getSuiteId(),
        suiteName: self.getSuiteName(),
        specId: self.getSpecId(),
        specName: self.getSpecName(),
        resolution: self.getResolution()
    };

    self.report.suites = self.report.suites || {};
    self.report.suites[self.getSuiteId()] = self.report.suites[self.getSuiteId()] || [];
    self.report.suites[self.getSuiteId()].push(record);

    self.report.specs = self.report.specs || {};
    self.report.specs[self.getSpecId()] = self.report.specs[self.getSpecId()] || [];
    self.report.specs[self.getSpecId()].push(record);

    self.report.resolutions = self.report.resolutions || {};
    self.report.resolutions[self.getResolution()] = self.report.resolutions[self.getResolution()] || [];
    self.report.resolutions[self.getResolution()].push(record);

}
