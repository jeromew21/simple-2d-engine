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

//Helpers
function choice(arr) {
    return arr[Math.floor(arr.length * Math.random())];
}

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
    }
}

var sprites = {}

function Sprite(name) {
    this.name = name; //unique; think about making ordering of layers
    this.draw = function() {}
    this.box = new BoundingBox();
    this.events = {};
    this.bind = function(event, func) {
        this.events[event] = func;
    }
    sprites[this.name] = this;
}

function BoundingBox() {
    //Begin init
    this.set = function(x, y, w, h, dir) {
        this.dir = dir
        this.center = [x, y]
        hw = w/2
        hh = h/2
        this.p1 = this.restore(this.rotate(this.translate([x - hw, y - hh], this.center), this.dir), this.center)
        this.p2 = this.restore(this.rotate(this.translate([x + hw, y - hh], this.center), this.dir), this.center)
        this.p3 = this.restore(this.rotate(this.translate([x + hw, y + hh], this.center), this.dir), this.center)
        this.p4 = this.restore(this.rotate(this.translate([x - hw, y + hh], this.center), this.dir), this.center)
        this.w = w;
        this.h = h;
        this.x = x;
        this.y = y;
    }
    this.translate = function(coord, center) {
        //given a coord pair and a center, both w respect to global, give the new coords with respect to the center
        return [coord[0] - center[0], center[1] - coord[1]]
    }
    this.restore = function(coord, center) {
        //given a coord with respect to center and a center w respect to global return a coord w respect to global
        return [coord[0] + center[0], center[1] - coord[1]]
    }
    this.rotate = function(coord, theta) {
        //given a coord, rotate it theta radians with respect to 0, 0
        //rotation matrix:
        // |cos -sin |
        // |sin  cos | 
        // [xcos - ysin, xsin + ycos] with respect to center...
        x = coord[0];
        y = coord[1];

        return [x * Math.cos(theta) - y * Math.sin(theta), x * Math.sin(theta) + y * Math.cos(theta)]
    }
    this.setPosition = function(x, y) {
        this.set(x, y, this.w, this.h, this.dir)
    }
    this.setSize = function(w, h) {
        this.set(this.x, this.y, w, h, this.dir)
    }
    this.setDir = function(dir) {
        this.set(this.x, this.y, this.w, this.h, dir)
    }
    this.drawAttrs = {
        fill: false,
        border: true,
        fillColor: "white",
        borderColor: "black",
        thickness: 1,
        fillOpacity: 1,
    }
    this.drawStates = {}
    this.saveDrawState = function(name) {
        this.drawStates[name] = $.extend({}, this.drawAttrs)
    }
    this.restoreDrawState = function(name) {
        this.drawAttrs = this.drawStates[name]
    }
    this.draw = function() {
        ctx.fillStyle = this.drawAttrs.fillColor
        ctx.strokeStyle = this.drawAttrs.borderColor
        ctx.lineWidth = this.drawAttrs.thickness
        ctx.beginPath();
        ctx.moveTo(...this.p1)
        ctx.lineTo(...this.p2)
        ctx.lineTo(...this.p3)
        ctx.lineTo(...this.p4)
        ctx.lineTo(...this.p1)
        ctx.closePath()
        if (this.drawAttrs.fill) {
            ctx.globalAlpha = this.drawAttrs.fillOpacity
            ctx.fill()
            ctx.globalAlpha = 1
        } 
        if (this.drawAttrs.border) {
            ctx.stroke()
        }
    }
    //End init

    this.pointInside = function(point) {
        px = point[0];
        py = point[1];
        //lines from p1 to p2, p3 to p4
        //lines form p2 to p3, p1 to p4
        //must be inside bounds of each of those pairs of lines
    }
    this.touching = function(otherBox) {
        pts = [this.p1, this.p2, this.p3, this.p4]
        opts = [otherBox.p1, otherBox.p2, otherBox.p3, otherBox.p4]
        for (var i = 0; i < 4; i++) {
            if (otherBox.pointInside(pts[i]) || this.pointInside(opts[i])) {
                return true
            }
        }
        return false
    }
}

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

//think about cleaning sprite object?