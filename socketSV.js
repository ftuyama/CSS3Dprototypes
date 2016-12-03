/*
    Exame de CES-35
    Aplicação de Sockets
 */
// New WebSocket Communication
var WebSocketServer = require('websocket').server;
var http = require('http');
var players = [];
var debug = false;

function Player(playerId, connection, lastAlive) {
    this.playerId = playerId;
    this.connection = connection;
    var position = getPositions(playerId);
    this.x = position[0];
    this.y = position[1];
    this.ip = connection.remoteAddress;
    this.lastAlive = lastAlive;
};

// Create Socket Server
var server = http.createServer(function(request, response) {
    console.log(formattedTimestamp() + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});

// Listen to new connections
server.listen(8000, function() {
    console.log(formattedTimestamp() + ' Server is listening on port 8000');
    liveness();
});

wsServer = new WebSocketServer({
    httpServer: server,
});

wsServer.on('request', function(request) {
    var connection = request.accept(null, request.origin);

    var playerId = connectPlayer(connection, timestamp());
    connection.sendUTF(JSON.stringify({
        'msgId': 1,
        'playerId': playerId,
        'x': players[playerId].x,
        'y': players[playerId].y
    }));


    // Connection Message
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            message = JSON.parse(message.utf8Data);

            // Player associado à conexão
            var player = connection.player;
            if (player == undefined) {
                console.log("Erro: player não encontrado");
                return;
            }

            // Player não pertence mais à conexão
            if (connection.remoteAddress != player.ip) {
                console.log("Erro: player reconectando");
                connection.sendUTF(JSON.stringify({
                    'msgId': 4
                }));
                return;
            }

            updatePlayer(message);

            // broadcast
            broadcast(player, {
                'msgId': 2,
                'playerId': playerId,
                'x': message.x,
                'y': message.y
            });
        }
    });

    // Connection Close
    connection.on('close', function(reasonCode, description) {
        var player = connection.player;
        if (player == undefined) {
            console.log("Erro: tentando fechar conexão inexistente");
            return;
        }
        disconnectPlayer(player);
    });
});

function updatePlayer(message) {
    if (debug) console.log('Received Message: ' + message);
    // update
    playerId = message.playerId;
    players[playerId].x = message.x;
    players[playerId].y = message.y;
    players[playerId].lastAlive = timestamp();
}

function disconnectPlayer(player) {
    console.log(formattedTimestamp() + ' Player ' + connection.remoteAddress + ' disconnected.');
    players[player.playerId] = undefined;

    // broadcast
    broadcast(player, {
        'msgId': 3,
        'playerId': player.playerId
    });
}

function liveness() {
    setInterval(function() {
        players.forEach(function(player) {
            if (player != undefined && isInactive(player)) {
                disconnectPlayer(player);
            }
        });
    }, 2000);
}

function isInactive(player) {
    return (timestamp() - player.lastAlive) > 2000;
}

function broadcast(ori_player, msg) {
    players.forEach(function(player) {
        if (player != undefined && player.playerId != ori_player.playerId) {
            player.connection.sendUTF(JSON.stringify(msg));
        }
    });
}

function connectPlayer(connection, timestamp) {
    console.log(formattedTimestamp() + ' Player ' + connection.remoteAddress + ' connected.');
    for (var i = 0; i < players.length; i++) {
        if (players[i] == undefined) {
            players[i] = new Player(i, connection, timestamp);
            connection.player = players[i];
            return i;
        }
    }
    var index = players.length;
    players.push(new Player(index, connection, timestamp));
    connection.player = players[index];
    return index;
}

function getPositions(id) {
    switch (id) {
        case 0:
            return [-1740, -1500];
        case 1:
            return [-1650, -1500];
        default:
            return [-1600, -1500];
    }
}

function formattedTimestamp() {
    return '[' + (timestamp().toISOString()) + ']';
}

function timestamp() {
    return new Date();
}