toggle3d.checked = true;
toggleview.checked = true;
online.checked = true;

// Keyboard input (see http://xem.github.io/articles/#jsgamesinputs)
u = r = d = l = 0;
onkeyup = t = (e, v) => top['lurd************************l**r************l*d***u**u' [e.keyCode - 37]] = v;
onkeydown = e => t(e, 1);

// Scene
angle_x = angle_y = angle_z = 0; // rad
pos_x = -1740;
pos_y = -1500;
speed = 0;
max_speed = 18;

// Players
function Player(id, x, y) {
    this.id = id;
    this.x = x;
    this.y = y;
};
var players = [];

i = 0;
initWebSocket();

// Loop
function start() {
    my_kart = document.getElementById("kartwrapper" + id);
    setInterval(function() {
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

        if (i++ % 10 == 0 && online.checked && id != undefined)
            sendMsg(JSON.stringify({
                'msgId': 2,
                'playerId': id,
                'x': pos_x,
                'y': pos_y
            }));

        scene.style.transform = "rotateZ(" + angle_z + "rad) translateX(" + pos_x + "px) translateY(" + pos_y + "px)";
        my_kart.style.transform = "translateX(" + (-pos_x - 15) + "px) translateY(" + (-pos_y - 15) + "px) translateZ(14px) rotateZ(" + -angle_z + "rad)";
        // updateKarts(players, angle_z);
        tree.style.transform = "rotateZ(" + -angle_z + "rad) rotateX(-90deg)";
        viewport.style.backgroundPosition = (angle_z * 300) + "px top";
    }, 33);
}

function updateKarts(players, angle_z) {
    players.forEach(function(player) {
        if (player != undefined && player.playerId != id) {
            $("#kartwrapper" + player.playerId).style.transform = "translateX(" + (-player.x - 15) + "px) translateY(" + (-player.y - 15) + "px) translateZ(14px) rotateZ(" + -angle_z + "rad)";
        }
    });
}

function addKart(id) {
    $("#scene").append("<div id=kartwrapper" + id + "><img src=kart" + id + ".png id=kart" + id + "></div>");
}

function removeKart(id) {
    $("#kartwrapper" + id).remove();
}