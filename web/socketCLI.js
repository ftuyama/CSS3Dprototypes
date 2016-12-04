var ws, id, port, connected, reconnect = false;

// Discover server port to connect
function initConnection() {
    $.get('/port', function(res) {
        port = res.port;
        initWebSocket();
    });
}

// New WebSocket Communication
function initWebSocket() {
    if (!"WebSocket" in window) {
        showSnackBar("WebSocket NOT supported by your Browser!");
        return;
    }

    // Let us open a web socket
    var domain = window.location.hostname;
    ws = new WebSocket("ws://" + domain + ":" + port);

    ws.onopen = function() {
        connected = true;
        showSnackBar("Connection is open...");
    };

    ws.onerror = function(error) {
        showSnackBar("Something went wrong...");
    };

    ws.onmessage = function(evt) {
        if (!online.checked) return;
        var msg = JSON.parse(evt.data);
        var playerId = msg.playerId;
        if (debug.checked) console.log(msg);

        switch (msg.msgId) {
            case 1: // Own connection to the game
                addKart(playerId);
                start(msg);
                break;
            case 2: // Update other player position
                updatePlayer(msg);
                break;
            case 3: // Remove other player
                removePlayer(playerId);
                break;
            case 4: // Reconnection requested by server
                clearPlayers();
                reconnect = true;
                ws.close();
                break;
            default:
                break;
        }
    };

    ws.onclose = function() {
        connected = false;
        showSnackBar("Connection is closed...");
        if (reconnect) tryReconnect();
    };
}

/*
    ===========================================================================
                            Managing Players
    ===========================================================================
*/

// Update or create player with message info
function updatePlayer(msg) {
    var playerId = msg.playerId;
    while (playerId >= players.length - 1)
        players.push(undefined);
    if (players[playerId] == undefined) {
        players[playerId] = new Player(playerId, msg.x, msg.y);
        showSnackBar("Player " + (playerId + 1) + " connected");
        addKart(playerId);
    } else {
        players[playerId].x = msg.x;
        players[playerId].y = msg.y;
    }
}

// Remove player
function removePlayer(playerId) {
    showSnackBar("Player " + (playerId + 1) + " disconnected");
    removeKart(playerId);
    players[playerId] = undefined;
}
// Remove player
function clearPlayers() {
    clearKarts();
    players = [];
}

/*
    ===========================================================================
                            Connection events
    ===========================================================================
*/

function tryReconnect() {
    reconnect = false;
    //try to reconnect in 1 second
    setTimeout(function() { initWebSocket() }, 1000);
}

function sendMsg(message) {
    if (connected)
        ws.send(message);
}