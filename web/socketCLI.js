/*
    Exame de CES-35
    Aplicação de Sockets
 */
var ws, id, connected, reconnect = false;

// New WebSocket Communication
function initWebSocket() {
    if (!"WebSocket" in window) {
        showSnackBar("WebSocket NOT supported by your Browser!");
        return;
    }

    // Let us open a web socket
    var domain = window.location.hostname;
    ws = new WebSocket("ws://" + domain + ":8000");

    ws.onopen = function() {
        connected = true;
        showSnackBar("Connection is open...");
    };

    ws.onerror = function(error) {
        showSnackBar("Deu errado...");
    };

    ws.onmessage = function(evt) {
        if (!online.checked) return;
        var msg = JSON.parse(evt.data);
        var playerId = msg.playerId;
        if (debug.checked) console.log(msg);

        switch (msg.msgId) {
            case 1:
                // Own connection to the game
                addKart(playerId);
                start(msg);
                break;
            case 2:
                updatePlayer(msg);
                break;
            case 3:
                removePlayer(playerId);
                break;
            case 4:
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