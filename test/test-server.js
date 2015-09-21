'use strict';

var $express = require('express');

var app = $express();

app.use('/', $express.static(__dirname + '/webapp'));

app.listen(8010, function (err) {

    if (err) {
        throw err;
    }

    console.log('Listening on port 8010');

});