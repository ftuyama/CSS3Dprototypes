toggle3d.checked = true;
toggleview.checked = true;

// Keyboard input (see http://xem.github.io/articles/#jsgamesinputs)
u = r = d = l = 0;
onkeyup = t = (e, v) => top['lurd************************l**r************l*d***u**u' [e.keyCode - 37]] = v;
onkeydown = e => t(e, 1);

// Scene
angle_x = angle_y = angle_z = 0; // rad
pos_x = -1700;
pos_y = -1500;
speed = 0;
max_speed = 18;

// Another player
pos_x2 = -1650;
pos_y2 = -1500;

// Loop
setInterval(function() {
    if (r) {
        angle_z -= .05;
    } else if (l) {
        angle_z += .05;
    } else if (u) {
        if (speed < 0) speed += 1;
        speed += .2;
        if (speed > max_speed) {
            speed = max_speed;
        }
    } else if (d) {
        if (speed > 0) speed -= 1;
        speed -= .2;
        if (speed < -max_speed) {
            speed = -max_speed;
        }
    } else {
        if (speed > 0) speed -= .5;
        if (speed < 0) speed += .5
    }

    pos_y += speed * Math.cos(angle_z);
    pos_x += speed * Math.sin(angle_z)

    scene.style.transform = "rotateZ(" + angle_z + "rad) translateX(" + pos_x + "px) translateY(" + pos_y + "px)";
    kartwrapper.style.transform = "translateX(" + (-pos_x - 15) + "px) translateY(" + (-pos_y - 15) + "px) translateZ(14px) rotateZ(" + -angle_z + "rad)";
    kartwrapper2.style.transform = "translateX(" + (-pos_x2 - 15) + "px) translateY(" + (-pos_y2 - 15) + "px) translateZ(14px) rotateZ(" + -angle_z + "rad)";
    tree.style.transform = "rotateZ(" + -angle_z + "rad) rotateX(-90deg)";
    viewport.style.backgroundPosition = (angle_z * 300) + "px top";
}, 33);