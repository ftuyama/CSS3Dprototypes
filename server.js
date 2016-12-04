/*
  ===========================================================================
                            Starting application
  ===========================================================================
*/
/* Core Modules */
var express = require('express');
var fs = require("fs");
var app = express();

// set the port of our application
// process.env.PORT lets the port be set by Heroku
var port = process.env.PORT || 8080;

// Configuração das rotas principais
app.use(express.static(__dirname));
app.use(express.static(__dirname + '/assets'));
app.use(express.static(__dirname + '/static'));
app.use(express.static(__dirname + '/web'));
app.use(express.static(__dirname + '/web/components'));
app.get('/', function(req, res) {
    res.send(fs.readFileSync("web/index.html", "utf8"));
});
app.get('/port', function(req, res) {
    res.send({ 'port': port });
});

// Initiate application server
var server = app.listen(port, function() {
    console.log("Example app listening at %s", server.address().port)
})

module.exports = app;
module.exports = server;

// loads socket server
require('./socketSV');