/*
  ===========================================================================
                            Starting application
  ===========================================================================
*/
/* Core Modules */
var express = require('express');
var fs = require("fs");
var app = express();

// Configuração das rotas principais
app.use(express.static(__dirname));
app.use(express.static(__dirname + '/assets'));
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/web'));
app.use(express.static(__dirname + '/web/components'));
app.get('/', function(req, res) {
    res.send(fs.readFileSync("web/index.html", "utf8"));
});
require('./socketSV');

// set the port of our application
// process.env.PORT lets the port be set by Heroku
var port = process.env.PORT || 8080;

var server = app.listen(port, function() {
    console.log("Example app listening at %s", server.address().port)
})

module.exports = app;