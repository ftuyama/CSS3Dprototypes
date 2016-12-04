/*
    Exame de CES-35
    Aplicação de Sockets
 */
// New WebSocket Communication
var WebSocketServer = require('websocket').server;
var http = require('http');
var players = [];
var debug = false;
var session = 0;

function Player(playerId, connection, lastAlive) {
    this.playerId = playerId;
    this.connection = connection;
    var position = getPositions(playerId);
    this.x = position[0];
    this.y = position[1];
    this.session = session;
    this.lastAlive = lastAlive;
    session++;
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

    // Connection message
    var connection = request.accept(null, request.origin);
    var player = connectPlayer(connection, timestamp());
    connection.sendUTF(JSON.stringify({
        'msgId': 1,
        'playerId': player.playerId,
        'x': player.x,
        'y': player.y,
        'session': player.session
    }));


    // Game - Player Position Message
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
            if (hasSameSession(connection, player)) {
                connection.sendUTF(JSON.stringify({
                    'msgId': 4
                }));
                return;
            }

            // Update and broadcast position
            updatePlayer(message);
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
        if (player == undefined || hasSameSession(connection, player)) {
            console.log("Erro: tentando fechar conexão inexistente");
            return;
        }
        disconnectPlayer(player);
        connection.player = undefined;
    });
});

/*
    ===========================================================================
                            Sockets main events
    ===========================================================================
*/

function updatePlayer(message) {
    if (debug) console.log('Received Message: ' + message);
    // update player
    playerId = message.playerId;
    players[playerId].x = message.x;
    players[playerId].y = message.y;
    players[playerId].lastAlive = timestamp();
}

function connectPlayer(connection, timestamp) {
    // allocate new player on poll
    for (var i = 0; i < players.length; i++) {
        if (players[i] == undefined) {
            console.log(formattedTimestamp() + ' Player ' + i + ' connected.');
            players[i] = new Player(i, connection, timestamp);
            connection.player = players[i];
            return players[i];
        }
    }
    // create new player on poll
    var index = players.length;
    players.push(new Player(index, connection, timestamp));
    connection.player = players[index];
    return players[index];
}

function disconnectPlayer(player) {
    console.log(formattedTimestamp() + ' Player ' + player.playerId + ' disconnected.');
    // remove player from poll
    players[player.playerId] = undefined;

    // broadcast
    broadcast(player, {
        'msgId': 3,
        'playerId': player.playerId
    });
}


/*
    ===========================================================================
                         Sockets actions events
    ===========================================================================
*/

// Check if connection has same session
function hasSameSession(connection, player) {
    // Check if connection session has the most updated session
    return players[player.playerId] == undefined ||
        connection.player.session < players[player.playerId].session;
}

// Check each 2 seconds if players are alive
function liveness() {
    setInterval(function() {
        players.forEach(function(player) {
            if (player != undefined && isInactive(player)) {
                disconnectPlayer(player);
            }
        });
    }, 2000);
}

// Broadcast message
function broadcast(ori_player, msg) {
    players.forEach(function(player) {
        if (player != undefined && player.playerId != ori_player.playerId) {
            player.connection.sendUTF(JSON.stringify(msg));
        }
    });
}

function isInactive(player) {
    return (timestamp() - player.lastAlive) > 2000;
}

/*
    ===========================================================================
                            Auxilliary functions
    ===========================================================================
*/

function getPositions(id) {
    var x = id%2 == 0 ? -1738 : -1653;
    var y = -1567 + id * 53;
    return [x,y];
}

function formattedTimestamp() {
    return '[' + (timestamp().toISOString()) + ']';
}

function timestamp() {
    return new Date();
}