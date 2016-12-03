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
    var pos = getPositions(playerId);
    this.x = pos[0];
    this.y = pos[1];
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
});

wsServer = new WebSocketServer({
    httpServer: server,
});

wsServer.on('request', function(request) {
    console.log("received something");

    var connection = request.accept(null, request.origin);
    console.log(formattedTimestamp() + ' Player ' + connection.remoteAddress + ' connected.');

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
            if (debug)
                console.log('Received Message: ' + message.utf8Data);
            message = JSON.parse(message.utf8Data);

            // update
            playerId = message.playerId;
            players[playerId].x = message.x;
            players[playerId].y = message.y;
            players[playerId].lastAlive = timestamp();

            var player = connection.player;
            if (player == undefined) {
                console.log("Erro: player não encontrado");
                return;
            }

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
        console.log(formattedTimestamp() + ' Player ' + connection.remoteAddress + ' disconnected.');

        var player = connection.player;
        if (player == undefined) {
            console.log("Erro: tentando fechar conexão inexistente");
            return;
        }

        players[player.playerId] = undefined;

        // broadcast
        broadcast(player, {
            'msgId': 3,
            'playerId': player.playerId
        });
    });
});

function broadcast(ori_player, msg) {
    players.forEach(function(player) {
        if (player != undefined && player.playerId != ori_player.playerId) {
            player.connection.sendUTF(JSON.stringify(msg));
        }
    });
}

function connectPlayer(connection, timestamp) {
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