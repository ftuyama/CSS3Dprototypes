toggle3d.checked = true;
toggleview.checked = true;
online.checked = true;
debug.checked = false;
end = false;

// Keyboard input
u = r = d = l = shift = 0;
onkeyup = t = (e, v) => {
    top['lurd************************l**r************l*d***u**u' [e.keyCode - 37]] = v;
    if (e.keyCode == 16) shift = false;
}
onkeydown = e => {
    t(e, 1);
    if (e.keyCode == 16) shift = true;
}

// Scene
angle_x = angle_y = angle_z = 0; // rad
pos_x = pos_y = 0;
speed = session = 0;
max_speed = 18;
fps = 33; // 1 scene each 33 ms
world = {};

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
initConnection();

// Initialize self variables
function init_self(msg) {
    id = msg.playerId, session = msg.session;
    pos_x = msg.x, pos_y = msg.y;
    my_kart = document.getElementById("kartwrapper" + id);
    world = { 'width': track.children[0].width, 'height': track.children[0].height };
    end = false;
}

// Game Loop
function start(msg) {
    init_self(msg);
    var game = setInterval(function() {
        if (end) clearInterval(game);
        game_inputs();
        game_collision();
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
    my_kart.style.transform = "translateX(" + (-pos_x - 15) + "px) translateY(" +
        (-pos_y - 15) + "px) translateZ(14px) rotateZ(" + -angle_z + "rad)";
    updateKarts(players, angle_z);
    tree.style.transform = "rotateZ(" + -angle_z + "rad) rotateX(-90deg)";
    viewport.style.backgroundPosition = (angle_z * 300) + "px top";
}

// Manage user inputs
function game_inputs() {
    if (shift) {
        speed *= 1.01
    } else if (r) {
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
        if (speed > max_speed)
            speed = max_speed;
        speed += -0.05 * speed;
        speed *= 0.95
    }

    pos_y += speed * Math.cos(angle_z);
    pos_x += speed * Math.sin(angle_z);
}

// Player bounce movement
function bounce() {
    pos_y -= speed * Math.cos(angle_z);
    pos_x -= speed * Math.sin(angle_z);
    speed = -speed;
}

// Player bounce when collides
function game_collision() {
    for (var i = 0; i < players.length; i++)
        if (players[i] != undefined && distance(players[i]) < 20)
            bounce();
    if (outside(world))
        bounce();
}

/*
    ===========================================================================
                            Manage Karts on View
    ===========================================================================
*/

// Updates all karts on view
function updateKarts(players, angle_z) {
    players.forEach(function(player) {
        if (player != undefined && player.playerId != id) {
            kart = document.getElementById("kartwrapper" + player.playerId);
            kart.style.transform = "translateX(" + (-player.x - 15) + "px) translateY(" + (-player.y - 15) + "px) translateZ(14px) rotateZ(" + -angle_z + "rad)";
        }
    });
}

// Add a kart to view
function addKart(id) {
    $("#scene").prepend("<div id=kartwrapper" + id + " class='kartwrapper'><img src=karts/kart" + id % 8 + ".png id=kart" + id + " class='kart'></div>");
}

// Remove a kart from view
function removeKart(id) {
    $("#kartwrapper" + id).remove();
}

// Remove all karts from view
function clearKarts() {
    $("#kartwrapper" + id).remove();
    players.forEach(function(player) {
        if (player != undefined)
            $("#kartwrapper" + player.playerId).remove();
    });
    end = true;
}

/*
    ===========================================================================
                            Auxilliary functions
    ===========================================================================
*/

function outside(world) {
    x = -pos_x, y = -pos_y;
    return x > world.width || x < 0 || y > world.height || y < 0;
}

function distance(player) {
    return Math.dist(player.x, player.y, pos_x, pos_y);
}

Math.dist = function(x1, y1, x2, y2) {
    if (!x2) x2 = 0;
    if (!y2) y2 = 0;
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}