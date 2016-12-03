toggle3d.checked = true;
toggleview.checked = true;
online.checked = true;
debug.checked = false;

// Keyboard input
u = r = d = l = 0;
onkeyup = t = (e, v) => top['lurd************************l**r************l*d***u**u' [e.keyCode - 37]] = v;
onkeydown = e => t(e, 1);

// Scene
angle_x = angle_y = angle_z = 0; // rad
pos_x = pos_y = 0;
speed = session = 0;
max_speed = 18;
fps = 33; // 1 scene each 33 ms

// Players
function Player(playerId, x, y) {
    this.playerId = playerId;
    this.x = x;
    this.y = y;
};
var players = [];

/*
    ===========================================================================
                            Game functions
    ===========================================================================
*/

// Initialize connection
initWebSocket();

// Initialize self variables
function init_self(msg) {
    id = msg.playerId, session = msg.session;
    pos_x = msg.x, pos_y = msg.y;
    my_kart = document.getElementById("kartwrapper" + id);
}

// Game Loop
function start(msg) {
    init_self(msg);
    setInterval(function() {
        game_inputs();
        game_connection();
        game_view();
    }, fps);
}

// Manage Game connection
function game_connection() {
    if (online.checked)
        sendMsg(JSON.stringify({
            'msgId': 2,
            'playerId': id,
            'x': pos_x,
            'y': pos_y,
            'session': session
        }));
}

// Manage Game view
function game_view() {
    scene.style.transform = "rotateZ(" + angle_z + "rad) translateX(" + pos_x + "px) translateY(" + pos_y + "px)";
    my_kart.style.transform = "translateX(" + (-pos_x - 15) + "px) translateY(" + (-pos_y - 15) + "px) translateZ(14px) rotateZ(" + -angle_z + "rad)";
    updateKarts(players, angle_z);
    tree.style.transform = "rotateZ(" + -angle_z + "rad) rotateX(-90deg)";
    viewport.style.backgroundPosition = (angle_z * 300) + "px top";
}

// Manage user inputs
function game_inputs() {
    if (r) {
        angle_z -= .05;
    } else if (l) {
        angle_z += .05;
    } else if (u) {
        if (speed < 0) speed += 1;
        speed += .2;
        if (speed > max_speed)
            speed = max_speed;
    } else if (d) {
        if (speed > 0) speed -= 1;
        speed -= .2;
        if (speed < -max_speed)
            speed = -max_speed;
    } else {
        if (speed > 0) speed -= .5;
        if (speed < 0) speed += .5
    }

    pos_y += speed * Math.cos(angle_z);
    pos_x += speed * Math.sin(angle_z);
}

/*
    ===========================================================================
                            Manage Karts on View
    ===========================================================================
*/

function updateKarts(players, angle_z) {
    players.forEach(function(player) {
        if (player != undefined && player.playerId != id) {
            kart = document.getElementById("kartwrapper" + player.playerId);
            kart.style.transform = "translateX(" + (-player.x - 15) + "px) translateY(" + (-player.y - 15) + "px) translateZ(14px) rotateZ(" + -angle_z + "rad)";
        }
    });
}

function addKart(id) {
    $("#scene").prepend("<div id=kartwrapper" + id + " class='kartwrapper'><img src=kart" + id + ".png id=kart" + id + " class='kart'></div>");
}

function removeKart(id) {
    $("#kartwrapper" + id).remove();
}