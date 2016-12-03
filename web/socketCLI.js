/*
    Exame de CES-35
    Aplicação de Sockets
 */
var ws, connected, id;

// New WebSocket Communication
function initWebSocket() {
    if (!"WebSocket" in window) {
        // The browser doesn't support WebSocket
        showSnackBar("WebSocket NOT supported by your Browser!");
        return;
    }

    // Let us open a web socket
    var domain = window.location.hostname;
    ws = new WebSocket("ws://" + domain + ":8000");
    connected = true;

    ws.onopen = function() {
        // Web Socket is connected, send data using send()
        // ws.send("Message to send");
        showSnackBar("Connection is open...");
    };

    ws.onerror = function(error) {
        // an error occurred when sending/receiving data
        showSnackBar("Deu errado...");
    };

    ws.onmessage = function(evt) {
        if (!online.checked) return;
        var msg = JSON.parse(evt.data);
        var playerId = msg.playerId;
        if (debug.checked)
            console.log(msg);
        switch (msg.msgId) {
            case 1:
                id = playerId, pos_x = msg.x, pos_y = msg.y;
                addKart(id);
                start();
                break;
            case 2:
                updatePlayer(msg);
                break;
            case 3:
                showSnackBar("Player " + (playerId + 1) + " disconnected");
                removeKart(playerId);
                players[playerId] = undefined;
                break;
            case 4:
                ws.close();
                initWebSocket();
                break;
            default:
                break;
        }
    };

    ws.onclose = function() {
        // websocket is closed.
        connected = false;
        showSnackBar("Connection is closed...");
    };
}

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

function sendMsg(package) {
    if (connected)
        ws.send(package);
}