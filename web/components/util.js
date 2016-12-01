$(document).ready(function() {
    $("#navbar").load('/navbar.html');
    $("#viewport").click(function() {
        $('body').css('background-image', "url(background.2.png)");
    });
});

function showSnackBar(message) {
    var x = document.getElementById("snackbar");
    x.innerHTML = message;
    x.className = "show";
    setTimeout(function() { x.className = x.className.replace("show", ""); }, 3000);
}