/*
    Exame de CES-35
    Aplicação de Sockets
 */
var ws, connected;

// New WebSocket Communication
function initWebSocket() {
    if (!"WebSocket" in window) {
        // The browser doesn't support WebSocket
        showSnackBar("WebSocket NOT supported by your Browser!");
        return;
    }

    // Let us open a web socket
    ws = new WebSocket("ws://localhost:8000");
    connected = true;
    showSnackBar("Connection is open...");

    ws.onopen = function() {
        // Web Socket is connected, send data using send()
        ws.send("Message to send");
    };

    ws.onerror = function(error) {
        // an error occurred when sending/receiving data
        showSnackBar("Deu errado...");
    };

    ws.onmessage = function(evt) {
        var received_msg = evt.data;
    };

    ws.onclose = function() {
        // websocket is closed.
        connected = false;
        showSnackBar("Connection is closed...");
    };
}

function sendMsg(package) {
    if (connected)
        ws.send(package);
}