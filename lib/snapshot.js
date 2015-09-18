'use strict';

module.exports = snapshot;
module.exports._save = _save;


function snapshot (config) {

    browser.getPageSource()
        .then(function (html) {

            config.snapshot.callbacks.forEach(function (callback) {

                callback(html);

            });

        });

}

function _save (html) {



}
