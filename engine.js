//A simple 2d graphics engine
//Uses jQuery for styling page

var canvas = document.getElementById("canvas-1")
var ctx = canvas.getContext("2d");

var setup = {
    setDimensions: function(w, h) {
        globals.width = w;
        globals.height = h;
        $("#canvas-1").attr("height", h).attr("width", w);
    },
    border: function() {
        $("#canvas-1").css("border", "2px darkgrey solid")
    },
    night: function() {
        $("body").css("background-color", "#303030")
        $("#canvas-1").css("background-color", "white")
    },
    setCursor: function(c) {
        $("body").css("cursor", c)
    },
    title: function(t) {
        $("#canvas-wrapper").prepend("<h1 id='mainTitle'>" + t + "</h1>").css("padding-left", "40px");
        $("#mainTitle").css("color", "rgba(255, 255, 255, 0.8)").css("font-family", "Helvetica, Arial").css("margin-top", "45px").css("margin-bottom", "45px")
        document.title = t;
    },
}

var globals = {
    width: 600,
    height: 400,
    mouseX: 0,
    mouseY: 0,
    mouseDown: false,
    clickDelay: 500,
    clickisValid: true,
}

var events = {
    occur: function(event) {
        this[event]();
        for (k in sprites) {
            sprite = sprites[k]
            if (sprite.events[event]) {
                sprite.events[event](sprite);
            }
        }
    },
    mouseMove: function() {
    },
    mouseDown: function() {
    },
    mouseUp: function() {
    },
    click: function () {
    }
}

//Shorthand names
var gv = globals;
var ev = events;
var log = console.log;

document.onmousemove = function(e) {
    var rect = canvas.getBoundingClientRect();
    globals.mouseX = e.clientX - rect.left;
    globals.mouseY = e.clientY - rect.top;
    events.occur("mouseMove")
}

canvas.onmousedown = function(e) {
    globals.mouseDown = true;
    cancelClick = setTimeout(function() {
        globals.clickisValid = false;
    }, globals.clickDelay);
    events.occur("mouseDown")
}

canvas.onmouseup = function(e) {
    globals.mouseDown = false;
    events.occur("mouseUp")
    clearTimeout(cancelClick)
    if (globals.clickisValid) {
        events.occur("click")
    }
    globals.clickisValid = true;
}

var draw = {
    main: function() {
        ctx.fillText("Hello World", 100, 100, 100);
    }
}

var sprites = {}

function Sprite(name) {
    this.name = name; //unique
    this.draw = function() {}
    this.boundingBox = new BoundingBox();
    this.events = {};
    this.bind = function(event, func) {
        this.events[event] = func;
    }
    sprites[this.name] = this
}

function BoundingBox() {}

//Kick off
var update = function() {
    window.requestAnimationFrame(update);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = canvas.width;
    for (k in draw) {
        draw[k]()
    }
    for (j in sprites) {
        sprites[j].draw()
    }
} 
update();