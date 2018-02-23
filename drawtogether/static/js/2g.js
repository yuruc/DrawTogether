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
function load() {
    var imageElement = document.getElementById("image")
    console.log(imageElement.getAttribute("class"));
    word = imageElement.getAttribute("class")
    word_length = word.length;
    for (var i = 0; i < word_length; i++) {

        list.innerHTML += "<input class=\"col-md-1\"" + " " + "id=\"blank_id" + i + "\"" + "type=\"text\"" + "  " + "maxlength=\"1\"" + "readonly" + ">";
        // list.append(newItem);
    }
    var letter_array = word.split("");
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
    }

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

function change(id) {
    if (blank_trace < word_length) {
        var str1 = "pink_id" + id;
        var pink_element = document.getElementById(str1);
        pink_element.innerHTML = null;
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

function check() {
    var guess = "";
    for (var i = 0; i < blank_trace; i++) {
        var str1 = "blank_id" + i;
        var blank_element = document.getElementById(str1);
        guess = guess + blank_element.value;
    }
    if (word === guess) {
        alert("Success!");
    } else {
        alert("Failure!\nThe right answer is " + word);
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

