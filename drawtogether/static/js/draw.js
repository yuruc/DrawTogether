var mousePressed = false;
var lastX, lastY;
var ctx;
var color = "black";
var enter = false;
var skipFlag = false;
target_list = ["box", "house", "star", "rocket", "glasses", "tree", "boat", "flower", "bee", "rabbit",
    "car", "airplane", "lamp", "bonbon", "cat", "bird", "eye", "cloud", "guitar", "castle",
    "mushroom", "bottle", "bed", "chair", "key", "gun", "phone", "shoe", "book", "train", "pen",
    "ice cream", "dog", "sun", "moon", "fish", "cheese", "money", "hat", "computer", "squirrel"];

//reference: http://www.htmleaf.com/ziliaoku/qianduanjiaocheng/201502101363.html

var ws_scheme = window.location.protocol == "https:" ? "wss" : "ws";
//var ws_path = "ws://" + window.location.host + "/draw/";
game_room = window.location.pathname.split("/");
var ws_path = ws_scheme + '://' + window.location.host + "/game/" + game_room[2];
console.log(ws_path + " Hello! This is ws_path.");
console.log("window.location.pathname is: " + window.location.pathname);
var socket = new WebSocket(ws_path);
var webSocketBridge = new channels.WebSocketBridge();
var breakmessage;
var otheruserexit;
var leftTime;
var leftTimeForExit;
var nextGameFlag = "Not next";
var guesserReload;
webSocketBridge.connect(ws_path);
webSocketBridge.listen(function (data) {
    // Decode the JSON
    console.log("socket.onmessage:" + data);
    if (data == '60') {
        clearArea();
        console.log("60 seconds left!");
        enter = true;
        countdown();
    }
    if (data == '0') {
        console.log("No time left!");
        // timeEnd();
    }
    if (data == "Time's up") {
        console.log("Time's up!!");
        timeEnd();
    }
    if (data == "Guess right!") {
        breakmessage = "Guess right!";
        guessright();
    }
    if (data == "Next Game") {
        nextGameFlag == "Next";
        webSocketBridge.send("Refresh guesser");
    }
    if (data[0] == "stop!") {
        console.log(data[0]);
        console.log("STOP!");
        document.getElementById("timer").innerHTML = data[1];
        leftTime = data[1];
        console.log(leftTimeForExit);
    }
    if (data == "404" && nextGameFlag != "Next") {
        console.log("The other user has disconnected.");
        console.log(nextGameFlag);
        otheruserexit = "Exit";
    }
    if (data == "Disconnected") {
        console.log("disconnected!!");
    }
    if (data == "The guesser wants to quit.") {
        alert("The guesser wants to quit,\nplease find others to play with you.");
        console.log("The guesser wants to quit,\nplease find others to play with you.");
        window.location.href = "http://54.165.110.151:8000/dashboard";
    }
    if (data == "Guesser is reloading") {
        clearArea();
        countdown();
    }
    // if (data = "New clear") {
    //     clearArea();
    // }
    if (data < 60 && data > 0) {
        document.getElementById("timer").innerHTML = data;
    }
});


webSocketBridge.socket.onopen = function () {
    console.log("Connected to webSocketBridge ");
    //webSocketBridge.send({"lastX": lastX});
};

webSocketBridge.socket.onclose = function () {
    console.log("Disconnected from webSocketBridge");
    var req = new XMLHttpRequest();
    req.open("GET", "/loss", true);
    req.send();
};

var exitFlag = true;
var guessRightFlag = true;
function countdown() {
    // Set the date we're counting down to
    var countDownDate = new Date().getTime() + 60500;

    // Update the count down every 1 second
    var x = setInterval(function () {

        // Get todays date and time
        var now = new Date().getTime();

        // Find the distance between now an the count down date
        var distance = countDownDate - now;
        console.log(distance);
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
        leftTimeForExit = seconds;

        if (skipFlag) {
            //  skipFlag = false;
            clearInterval(x);
        }

        if (!guessRightFlag) {
            clearInterval(x);
        }
        if (breakmessage == "Guess right!") {
            if (guessRightFlag) {
                distance = -1;
                document.getElementById("timer").innerHTML = leftTime;
                console.log(guessRightFlag);
                guessRightFlag = false;
                clearInterval(x);
                breakmessage = "Anything else";
            }
        }
        if (otheruserexit == "Exit" && exitFlag == true && nextGameFlag != "Next") {
            alert("To drawer: Guesser has disconnected.\nYou will be redirected to dashboard.");
            exitFlag = false;
            window.location.href = "http://54.165.110.151:8000/dashboard";
            console.log(nextGameFlag);
        }

        // If the count down is finished, write some text
        if (distance < 0 && document.getElementById("timer").innerHTML != "EXPIRED" && breakmessage != "Guess right!") {
            clearInterval(x);
            document.getElementById("timer").innerHTML = "EXPIRED";
            // timeEnd();
            console.log("oh my god!!!");
        }
    }, 1000);
}

function countdown2() {
    var countDownDate = new Date().getTime() + 61000;

    // Update the count down every 1 second
    var x = setInterval(function () {

        // Get todays date and time
        var now = new Date().getTime();

        // Find the distance between now an the count down date
        var distance = countDownDate - now;
        console.log(distance);
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        if (!skipFlag) {
            //  skipFlag = false;
            clearInterval(x);
        }
        // If the count down is finished, write some text
        if (distance < 0) {
            clearInterval(x);
            document.getElementById("timer").innerHTML = "EXPIRED";
            timeEnd();
        }
    }, 1000);
}

var drawerquit = false;
function timeEnd() {
    var result = confirm("Time's out!\n Do you still want to play?");
    if (result == false) {
        webSocketBridge.send("The drawer wants to quit.");
        drawerquit = true;
        window.location.href = "http://54.165.110.151:8000/dashboard";
    } else {
        if (!drawerquit) {
            clearArea();
            skip2();
            // clearArea();
            webSocketBridge.send("Next Game");
        }
    }
}


function guessright() {
    var result = confirm("The guesser guessed it!\nDo you still want to play?");
    if (result == false) {
        webSocketBridge.send("The drawer wants to quit.");
        window.location.href = "http://54.165.110.151:8000/dashboard";
    } else {
        clearArea();
        skip2();
        // clearArea();
        webSocketBridge.send("Next Game");
    }
}


function decisionbox() {
    var result = confirm("play again?");
    if (result == true) {
        var room;
        var str = ws_path;
        var label = str.split('/game/');
        room = label[1];
        var req = new XMLHttpRequest();
        req.open("POST", "/continueplay", true);
        req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        req.send("room=" + room + "&csrfmiddlewaretoken=" + getCSRFToken());
    }
}

function getCSRFToken() {
    var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) {
        if (cookies[i].startsWith("csrftoken=")) {
            return cookies[i].substring("csrftoken=".length, cookies[i].length);
        }
    }
    return "unknown";
}

if (socket.readyState == WebSocket.OPEN) socket.onopen();


function InitThis() {
    var canvas = document.getElementById('myCanvas');
    ctx = document.getElementById('myCanvas').getContext("2d");
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    $('#myCanvas').mousedown(function (e) {
        mousePressed = true;
        Draw(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, false);

    });

    $('#myCanvas').mousemove(function (e) {
        var x = e.pageX - $(this).offset().left;
        var y = e.pageY - $(this).offset().top;
        if (mousePressed) {
            Draw(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, true);

        }

    });

    $('#myCanvas').mouseup(function (e) {
        mousePressed = false;
    });
    $('#myCanvas').mouseleave(function (e) {
        mousePressed = false;
    });
}


function Draw(x, y, isDown) {
    webSocketBridge.send([x, y, isDown, color]);
    if (isDown) {
        // webSocketBridge.send([x, y, isDown, color]);
        //socket.send([x, y, isDown]);
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 9;
        ctx.lineJoin = "round";
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.closePath();
        ctx.stroke();
    }
    lastX = x;
    lastY = y;
}


function selectColor(c) {
    color = c;
    //alert(color);

}

function skip2() {
    var other_index = Math.floor(Math.random() * target_list.length);
    var other_word = target_list[other_index];
    console.log(other_word);
    webSocketBridge.send("skip" + other_word);
    var element = document.getElementById("word");
    element.innerHTML = null;
    element.innerHTML = "<p class=\"middle_align_text\"" + " " + "style=\"font-size:170%\"" + "> Please draw: " + other_word + "</p>";
    if (enter) {
        if (skipFlag == false) {
            skipFlag = true;
            countdown();
            countdown2();
        } else if (skipFlag == true) {
            skipFlag = false;
            countdown2();
            countdown();
        }
    }
}

function skip() {
    if (!enter) {
        var other_index = Math.floor(Math.random() * target_list.length);
        var other_word = target_list[other_index];
        // console.log(other_word);
        // webSocketBridge.send("skip" + other_word);
        var element = document.getElementById("word");
        element.innerHTML = null;
        element.innerHTML = "<p class=\"middle_align_text\"" + " " + "style=\"font-size:170%\"" + "> Please draw: " + other_word + "</p>";

        var roomlabel = document.getElementById("gamelabel").getAttribute("value");
        var req = new XMLHttpRequest();
        req.open("POST", "/skipguess", true);
        req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        req.send("roomlabel=" + roomlabel + "&word=" + other_word + "&csrfmiddlewaretoken=" + getCSRFToken());
        // top.Right.location.reload();
    } else {

        webSocketBridge.send("The drawer wants to quit.");
        window.history.back(-1);
    }

}

function clearArea() {
    // Use the identity matrix while clearing the canvas
    webSocketBridge.send(["clear"]);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function savePic() { //reference: http://stackoverflow.com/questions/10673122/how-to-save-canvas-as-an-image-with-canvas-todataurl
    // var image = document.getElementById("myCanvas").toDataURL("image/png").replace("image/png", "image/octet-stream");  // here is the most important part because if you dont replace you will get a DOM 18 exception.
    // window.location.href = image;
    var type = 'jpeg';
    var imgData = document.getElementById("myCanvas").toDataURL(type);
    var _fixType = function (type) {
        type = type.toLowerCase().replace(/jpg/i, 'jpeg');
        var r = type.match(/png|jpeg|bmp|gif/)[0];
        return 'image/' + r;
    }
    imgData = imgData.replace(_fixType(type), 'image/octet-stream');
    var saveFile = function (data, filename) {
        var save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
        save_link.href = data;
        save_link.download = filename;

        var event = document.createEvent('MouseEvents');
        event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        save_link.dispatchEvent(event);
    };
    var filename = 'drawsomething_' + (new Date()).getTime() + '.' + type;
    saveFile(imgData, filename);

}

function UploadPic() {

    // Generate the image data
    var Pic = document.getElementById("myCanvas").toDataURL("image/png");
    Pic = Pic.replace(/^data:image\/(png|jpg);base64,/, "")

    // Sending the image data to Server
    $.ajax({
        type: 'POST',
        url: 'Save_Picture.aspx/UploadPic',
        data: '{ "imageData" : "' + Pic + '" }',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function (msg) {
            alert("Done, Picture Uploaded.");
        }
    });
}

function music_control() {
    var music_muted = document.getElementById('background_music').muted;
    //alert(music_muted);
    if (music_muted) {
        document.getElementById('background_music').muted = false;
    }

    else {
        document.getElementById('background_music').muted = true;
    }

}

function exit() {
    console.log("exit");
    if (enter) {
        console.log("exit1");
        webSocketBridge.send("The drawer wants to quit.");
        window.location.href = "http://54.165.110.151:8000/dashboard";
    } else {
        var roomlabel = document.getElementById("gamelabel").getAttribute("value");
        var req = new XMLHttpRequest();
        req.open("POST", "/exit", true);
        req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        req.send("roomlabel=" + roomlabel + "&csrfmiddlewaretoken=" + getCSRFToken());
        window.location.href = "http://54.165.110.151:8000/dashboard";
    }
}

$(function () { //equals to $(document).ready(function() { ... });
    InitThis();
});