'use strict';

var $path = require('path');

var $cheerio = require('cheerio');

module.exports = sourceSnapshot;
module.exports.save = save;


function sourceSnapshot (self, callbacks, customConfig) {

    return self.utils.handleSnapshotCallbacks(function () {

        return browser.getPageSource()
            .then(function (html) {

                // format data if requested
                if (self.config.source.removeMetaFragments) {

                    var $ = $cheerio.load(html);
                    $('meta[name="fragment"][content="!"]').remove();

                    html = $.html();

                }

                return html;

            });

    }, self, callbacks, customConfig);

}

function save (self, data, customConfig) {

    return self.utils.createFilename(self, customConfig, '.html')
        .then(function (filename) {

            // prepend target directory
            filename = $path.resolve(self.config.source.target, filename);

            self.log(filename);

            return self.utils.writeFile(filename, data);

        });

}
