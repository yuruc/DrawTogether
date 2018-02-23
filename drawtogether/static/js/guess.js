var mousePressed = false;
var lastX, lastY;
var ctx;
var color = "black";
var blank_trace = 0;
var list = document.getElementById("blank-button");
var word_length;
var hint_array;
var clear_button = document.getElementById("clear_button");
var delete_button = document.getElementById("delete_button");
var previous_pink_id_array = [];
var previous_pink_id;
var enter_button = document.getElementById("enter_button");
var word;
//var previous_pink_value;
var breakmessage;
var otheruserexit;
var nextGameFlag = "Not next";
var hint_array_temp = [];
var letter_array = [];
target_list = ["box", "house", "star", "rocket", "glasses", "tree", "boat", "flower", "bee", "rabbit",
    "car", "airplane", "lamp", "bonbon", "cat", "bird", "eye", "cloud", "guitar", "castle",
    "mushroom", "bottle", "bed", "chair", "key", "gun", "phone", "shoe", "book", "train", "pen",
    "ice cream", "dog", "sun", "moon", "fish", "cheese", "money", "hat", "computer", "squirrel"];

//reference: http://www.htmleaf.com/ziliaoku/qianduanjiaocheng/201502101363.html

var ws_scheme = window.location.protocol == "https:" ? "wss" : "ws";
//var ws_path = "ws://" + window.location.host + "/guess/";
console.log(window.location.pathname)
game_room = window.location.pathname.split("/")
console.log(game_room)

var ws_path = ws_scheme + '://' + window.location.host + "/game/" + game_room[2];

var socket = new WebSocket(ws_path);
var webSocketBridge = new channels.WebSocketBridge();
var thisIsAnotherOne;
var imcrazy;
webSocketBridge.connect(ws_path);
webSocketBridge.listen(function (data) {
    if (data == "clear") {
        console.log("clear the data", data);
        clearArea_2();
        return;
    }
    else {
        Watch(data[0], data[1], data[2], data[3]);
    }
    console.log("socket.onmessage" + data);
    if (data == '60') {
        console.log("60 seconds left!");
        countdown();
    }
    if (data == '0') {
        console.log("No time left!");
        // timeEnd();
    }
    if (data == "Guess right!") {
        breakmessage = "Guess right!";
    }
    if (data == "Next Game") {
        window.location.reload();
        nextGameFlag == "Next";
        imcrazy = "Draw Confirm";
    }
    if (data == "Refresh guesser") {
        thisIsAnotherOne = "Here I am";
        // window.location.reload();
    }
    if (data == '404' && nextGameFlag != "Next") {
        console.log("The other user has disconnected.");
        console.log(nextGameFlag);
        otheruserexit = "Exit";
    }
    if (data == "The drawer wants to quit.") {
        alert("The drawer wants to quit,\nplease find others to play with you.");
        window.location.href = "http://54.165.110.151:8000/dashboard";
    }
    if (data.substring(0, 4) == "skip") {
        var word = data.substring(4);
        skip_guess(word);
    }
    if (data == "The guesser wants to quit.") {
        window.location.href = "http://54.165.110.151:8000/dashboard";
    }
});

function skip_guess(word) {
    var roomlabel = document.getElementById("gamelabel").getAttribute("value");
    console.log(roomlabel);
    console.log(word);
    var req = new XMLHttpRequest();
    req.open("POST", "/skipguess", true);
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    req.send("roomlabel=" + roomlabel + "&word=" + word + "&csrfmiddlewaretoken=" + getCSRFToken());

}

function InitThis() {
    ctx = document.getElementById('myCanvas').getContext("2d");
}

webSocketBridge.socket.onopen = function () {
    console.log("Connected to game socket");
    console.log(ws_path);
    //webSocketBridge.send({"lastX": lastX});

}

webSocketBridge.socket.onclose = function () {
    console.log("Disconnected from game socket");
    webSocketBridge.send("Disconnected");
    alert("Closed!");
}


function countdown() {
    var countDownDate = new Date().getTime() + 60500;
    // webSocketBridge.send("New clear");


    // Update the count down every 1 second
    var x = setInterval(function () {

        // Get todays date and time
        var now = new Date().getTime();

        // Find the distance between now an the count down date
        var distance = countDownDate - now;
        console.log(distance);
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
        webSocketBridge.send(seconds);

        // Display the result in the element with id="timer"
        document.getElementById("timer").innerHTML = seconds;

        if (breakmessage == "Guess right!") {
            webSocketBridge.send(["stop!", seconds]);
            clearInterval(x);
            guessright();
        }
        if (otheruserexit == "Exit" && nextGameFlag != "Next") {
            alert("To Guesser: Drawer has disconnected\nYou will be redirected to dashboard.");
            console.log(nextGameFlag);
            window.location.href = "http://54.165.110.151:8000/dashboard";
        }

        // If the count down is finished, write some text
        if (distance < 0 && document.getElementById("timer").innerHTML != "EXPIRED" && breakmessage != "Guess right!") {
            clearInterval(x);
            document.getElementById("timer").innerHTML = "EXPIRED";
            timeEnd();
            console.log("oh my god!!!");
        }
    }, 1000);
}

function timeEnd() {
    webSocketBridge.send("Time's up");
    var req = new XMLHttpRequest();
    req.open("GET", "/loss", true);
    req.send();
    var result = confirm("Time's out!\nDo you still want to play?");
    if (result == false) {
        window.location.href = "http://54.165.110.151:8000/dashboard";
        webSocketBridge.send("The guesser wants to quit.");
    } else {

        if (imcrazy == "Draw confirm") {
        }
    }

}

function guessright() {
    var result = confirm("Congratulations! You guessed it!\nDo you still want to play?");
    if (result == false) {
        webSocketBridge.send("The guesser wants to quit.");
    } else {
        if (thisIsAnotherOne != "Here I am") {
            webSocketBridge.send("Guesser is reloading");
            window.location.reload();
        }
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

function check() {
    var guess = "";
    for (var i = 0; i < blank_trace; i++) {
        var str1 = "blank_id" + i;
        var blank_element = document.getElementById(str1);
        guess = guess + blank_element.value;
    }
    if (guess.length < word.length) {
        alert("you need more letter");
    } else if (word === guess) {
        //  alert("success!");
        webSocketBridge.send("Guess right!");
        // alert("Your answer is right!");
        var req = new XMLHttpRequest();
        req.open("GET", "/win", true);
        req.send();
    } else {
        alert("failure,please guess again!");
    }
}

function Watch(x, y, isDown, color) {
    console.log("watching");
    if (isDown) {
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

function clearArea_2() {
    // Use the identity matrix while clearing the canvas
    //webSocketBridge.send(["clear"]);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}


function load(target) {
    console.log(target)
    word = target;
    word_length = word.length;
    console.log(word_length);
    for (var i = 0; i < word_length; i++) {

        list.innerHTML += "<input class=\"col-md-1\"" + " " + "id=\"blank_id" + i + "\"" + "type=\"text\"" + "  " + "maxlength=\"1\"" + "readonly" + ">";
        // list.append(newItem);
    }
    letter_array = word.split("");
    var number_array = [];
    for (var i = 1; i <= 26; i++) {
        number_array[i - 1] = i;
    }
    number_array.sort(function () {
        return 0.5 - Math.random()
    });
    var pink_blank = 10;
    var rest_number = pink_blank - letter_array.length;
    //  console.log(rest_number);
    rest_array = [];
    for (var i = 0; i < rest_number; i++) {
        rest_array.push(number_array[i]);
    }
    hint_array = [];
    for (var i = 0; i < rest_number; i++) {
        hint_array[i] = String.fromCharCode(parseInt(96) + parseInt(rest_array[i]));
        hint_array_temp[i] = hint_array[i];
    }
    console.log(hint_array_temp);

    for (var i = 0; i < letter_array.length; i++) {
        hint_array.push(letter_array[i]);
    }
    hint_array.sort(function () {
        return 0.5 - Math.random()
    });
    var hint_list = document.getElementById("pink-button");
    for (var i = 0; i < hint_array.length; i++) {
        hint_list.innerHTML += "<td>" + " " + "<button type=\"button\"" + " " + "id=\"pink_id" + i + "\"" + " " +
            "class=\"button button-pink\"" + " " + "onclick=change(" + i + ")" + " " + "font size=\"20px\"" + ">" + hint_array[i]
            + "</button> </td>";
    }
    //clear function
    clear_button.onclick = clear;
    //delete function
    delete_button.onclick = dele;
    //enter function
    enter_button.onclick = check;
}

function hint() {
    hint_array = [];
    for (var i = 0; i < hint_array_temp.length - 2; i++) {
        hint_array[i] = hint_array_temp[i];
    }
    for (var i = 0; i < letter_array.length; i++) {
        hint_array.push(letter_array[i]);
    }
    hint_array.sort(function () {
        return 0.5 - Math.random()
    });
    var hint_list = document.getElementById("pink-button");
    hint_list.innerHTML = null;
    for (var i = 0; i < hint_array.length; i++) {
        hint_list.innerHTML += "<td>" + " " + "<button type=\"button\"" + " " + "id=\"pink_id" + i + "\"" + " " +
            "class=\"button button-pink\"" + " " + "onclick=change(" + i + ")" + " " + "font size=\"20px\"" + ">" + hint_array[i]
            + "</button> </td>";
    }
    //clear function
    clear_button.onclick = clear;
    //delete function
    delete_button.onclick = dele;
    //enter function
    enter_button.onclick = check;
}

function change(id) {
    if (blank_trace < word_length) {
        var str1 = "pink_id" + id;
        var pink_element = document.getElementById(str1);
        //pink_element.innerHTML = null;
        previous_pink_id_array.push(id);
        previous_pink_id = id;
        var str2 = "blank_id" + blank_trace;
        var blank_element = document.getElementById(str2);
        blank_element.value = hint_array[id];
        blank_trace++;
    }
}

function clear() {
    var hint_list = document.getElementById("pink-button");
    hint_list.innerHTML = null;
    for (var i = 0; i < hint_array.length; i++) {
        hint_list.innerHTML += "<td>" + " " + "<button type=\"button\"" + " " + "id=\"pink_id" + i + "\"" + " " +
            "class=\"button button-pink\"" + " " + "onclick=change(" + i + ")" + " " + "font size=\"20px\"" + ">" + hint_array[i]
            + "</button> </td>";
    }
    var blank_list = document.getElementById("blank-button");
    for (var i = 0; i < blank_trace; i++) {
        var str1 = "blank_id" + i;
        var blank_element = document.getElementById(str1);
        blank_element.value = null;
    }
    blank_trace = 0;
    previous_pink_id_array = [];
    previous_pink_id = 0;
}

function dele() {
    var original_blank_trace = blank_trace;
    if (blank_trace > 0) {
        blank_trace = blank_trace - 1;
    } else if (blank_trace == 0) {
        blank_trace = 0;
    }
    if (original_blank_trace > 0) {
        var str1 = "blank_id" + blank_trace;
        var blank_element = document.getElementById(str1);
        var temp = blank_element.value;
        blank_element.value = null;
        var location = previous_pink_id_array.pop();
        var str2 = "pink_id" + parseInt(location);
        var pink_element = document.getElementById(str2);

        //
        var hint_list = document.getElementById("pink-button");
        hint_list.innerHTML = null;
        for (var i = 0; i < hint_array.length; i++) {
            var search = false;
            for (var j = 0; j < previous_pink_id_array.length; j++) {
                if (i == previous_pink_id_array[j]) {
                    search = true;
                    break;
                }
            }
            if (search == true && location == i) {
                hint_list.innerHTML += "<td>" + " " + "<button type=\"button\"" + " " + "id=\"pink_id" + i + "\"" + " " +
                    "class=\"button button-pink\"" + " " + "onclick=change(" + i + ")" + " " + "font size=\"20px\"" + ">" + temp
                    + "</button> </td>";
            } else if (search == true && location != i) {
                hint_list.innerHTML += "<td>" + " " + "<button type=\"button\"" + " " + "id=\"pink_id" + i + "\"" + " " +
                    "class=\"button button-pink\"" + " " + "onclick=change(" + i + ")" + " " + "font size=\"20px\"" + ">" + " "
                    + "</button> </td>";
            } else {
                hint_list.innerHTML += "<td>" + " " + "<button type=\"button\"" + " " + "id=\"pink_id" + i + "\"" + " " +
                    "class=\"button button-pink\"" + " " + "onclick=change(" + i + ")" + " " + "font size=\"20px\"" + ">" + hint_array[i]
                    + "</button> </td>";
            }
        }
        previous_pink_id = previous_pink_id_array[previous_pink_id_array.length - 1];
    }
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
    webSocketBridge.send("The guesser wants to quit.");
    window.location.href = "http://54.165.110.151:8000/dashboard";
}

$(function () { //equals to $(document).ready(function() { ... });
    InitThis();
});