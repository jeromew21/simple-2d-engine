//A simple 2d graphics engine
//Uses jQuery for styling page

var canvas = document.getElementById("canvas-1")
var ctx = canvas.getContext("2d");

var globals = {
    mouseX: 0,
    mouseY: 0,
    mouseDown: false,
}

var events = {
    mouseMove: function() {
    },
    mouseDown: function(x, y) {
    },
    mouseUp: function(x, y) {
    }
}

//Shorthand names
var gv = globals;
var ev = events;

document.onmousemove = function(e) {
  var rect = canvas.getBoundingClientRect();
  globals.mouseX = e.clientX - rect.left;
  globals.mouseY = e.clientY - rect.top;
  events.mouseMove()
}

canvas.onmousedown = function(e) {
    globals.mouseDown = true;
    events.mouseDown(globals.mouseX, globals.mouseY);
}

canvas.onmouseup = function(e) {
    globals.mouseDown = false;
    events.mouseUp(globals.mouseX, globals.mouseY);
}

var draw = {
    main: function() {
        ctx.fillText("Hello World", 100, 100, 100);
    }
}

var sprites = {}

function Sprite(name) {
    this.name = name
    this.draw = function() {}
    this.boundingBox = new BoundingBox()
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