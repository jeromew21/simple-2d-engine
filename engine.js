//A simple 2d graphics engine
//Uses jQuery for styling page and some helper functions    

var canvas = document.getElementById("canvas-1")
var ctx = canvas.getContext("2d");

//Set global styles
$("body").css({
    "-moz-user-select": "none",
    "-webkit-user-select": "none",
    "-ms-user-select": "none", 
    "user-select": "none",
    "-o-user-select": "none"
});

$("#canvas-1").css("margin-bottom", "20px");

var setup = {
    setDimensions: function(w, h) {
        globals.width = w;
        globals.height = h;
        $("#canvas-1").attr("height", h).attr("width", w).css("float", "left");
    },
    border: function() {
        $("#canvas-1").css("border", "3px darkgrey outset")
    },
    night: function() {
        $("body").css("background-color", "#303030").css("color", "rgba(255, 255, 255, 0.8)");
        $("#canvas-1").css("background-color", "white")
    },
    title: function(t) {
        $("#canvas-wrapper").prepend("<h1 id='mainTitle'>" + t + "</h1>").css("padding-left", "40px");
        $("#mainTitle").css("font-family", "Helvetica, Arial").css("margin-top", "45px").css("margin-bottom", "45px")
        document.title = t;
    },
    background: function(c) {
        $("#canvas-1").css("background-color", c);
    },
    resizeToScreen: function() {
        globals.width = window.innerWidth - 100;
        globals.height = window.innerHeight - 200;
        $("#canvas-1").attr("height", globals.height).attr("width", globals.width);
    },
    resizeToScreenSquare: function() {
        var width = window.innerWidth - 100;
        var height = window.innerHeight - 200;
        if (width < height) {
            globals.width = width;
            globals.height = width;
        } else {
            globals.width = height;
            globals.height = height;
        }
        $("#canvas-1").attr("height", globals.height).attr("width", globals.width);
    },
    dynamicResize: function() {
        this.resizeToScreen();
        window.onresize = this.resizeToScreen;
    },
    init: function(t) {
        this.title(t);
        this.night();
        this.resizeToScreen();
        $("#canvas-wrapper").append("<div style='float:left; margin-left:25px; width:250px;' id='right-col'><div id='message'></div></div>");
    },
    createOptions: function(o) {
        /*
            {
                "booleanKeyValue" : {
                    "type": "boolean",
                    "title": "Foo"
                    "default": true
                }
                "listKeyValue" : {
                    "type": "options",
                    "title": "Bar"
                    "options": {
                        "value1": "title 1",
                        "value2": "title 2",
                    }
                    "default": "value1"
                }
            }
        
        */
        var inner, idGen, checked, title, optionsHtml, optionsJson, selected;
        for (var key in o) {
            if (!gv.hasOwnProperty(key)) {
                inner = o[key];                   
                idGen = Math.random().toString(36).substring(7);
                title = key;
                if (inner["title"] != undefined) {
                    title = inner["title"];
                }
                if (inner["type"] == "boolean") {
                    checked = "";
                    if (inner["default"]) {
                        checked = "checked";
                    }
                    
                    $("#right-col").append("<p><label for='" + idGen + "'>" + title + "</label><input type='checkbox' name='" + idGen + "' id='" + idGen + "' " + checked + "/></p>");
                    var f = function() { //Creates a new scope
                        var id = idGen;
                        globals[key] = function() {
                            return document.getElementById(id).checked;
                        }
                    };
                    f();
                } else if (inner["type"] == "options") {
                    optionsHtml = "";
                    optionsJson = inner["options"];
                    for (var val in optionsJson) {
                        selected = "";
                        if (val == inner["default"]) {
                            selected = "selected";
                        }
                        optionsHtml += "<option value='" + val + "' " + selected + ">" + optionsJson[val] + "</option>";
                    }
                    if (title.length > 0) {
                        title += "&nbsp";
                    }
                    $("#right-col").append("<p><label for='" + idGen + "'>" + title + "</label><select name='" + idGen + "' id='" + idGen + "' " + checked + ">" + optionsHtml + "</select></p>");
                    var f = function() { //Create new scope
                        var id = idGen; // Preserves current value
                        globals[key] = function() {
                            return $("#" + id).val();
                        }
                    }
                    f();
                }
            }
        }
    },
    createButton: function(title, e) {
        var idGen = Math.random().toString(36).substring(7);
        $("#right-col").append("<p><button id='" + idGen + "'>" + title + "</button></p>");
        $("#" + idGen).bind("click", e);
    },
    createText: function(name, text) {
        $("#right-col").append("<textarea style='width: 175px;' spellcheck='false' id='text-" + name + "'>" + text + "</p>");
    },
    updateText: function(name, text) {
        $("#text-" + name).text(text);
    }
}

var globals = {
    width: 600,
    height: 400,
    mouseX: -1000,
    mouseY: -1000,
    mouseDown: false,
    clickDelay: 500,
    clickisValid: true,
    keys: {},

    setCursor: function(c) {
        $("body").css("cursor", c)
    },

    message: function(m) {
        $("#message").html("<h2>" + m + "</h2>");
    },

    bindInputChange : function(f) {
        $("input, select").bind("change", f);
    },

    get: function(f) {
        if ($.isFunction(this[f])) {
            return this[f](); //Returns a value returned by a global function 
        } else {
            return this[f];
        }
    }
}

var events = {
    occur: function(event) {
        this[event]();
        for (var k = 0; k < sprites.length; k++) {
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
var print = console.log;

//Helpers
function choice(arr) {
    return arr[Math.floor(arr.length * Math.random())];
}

function inArr(arr, item) {
    return arr.indexOf(item) > -1;
}

function copyObj(arr) {
    return $.extend(true, {}, arr);
}

//Global event handlers
$("#canvas-1").bind('contextmenu', function(e){
    return false;
}); 

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

document.onkeydown = function(e) {
    if (e.keyCode == "37") {
        globals.keys["left"] = true;
    }
    else if (e.keyCode == "39") {
        globals.keys["right"] = true;
    }
    else if (e.keyCode == "38") {
        globals.keys["up"] = true;
    }
    else if(e.keyCode == "40") {
        globals.keys["down"] = true;
    }
    else if (e.keyCode == "65") {
        globals.keys["a"] = true;
    }
    else if (e.keyCode == "68") {
        globals.keys["d"] = true;
    }
    else if (e.keyCode == "87") {
        globals.keys["w"] = true;
    }
    else if(e.keyCode == "83") {
        globals.keys["s"] = true;
    }
    else if(e.keyCode == "32") {
        globals.keys["space"] = true;
    }
    globals.keys[e.keyCode] = true;
}

document.onkeyup = function(e) {
    if (e.keyCode == "37") {
        globals.keys["left"] = false;
    }
    else if (e.keyCode == "39") {
        globals.keys["right"] = false;
    }
    else if (e.keyCode == "38") {
        globals.keys["up"] = false;
    }
    else if (e.keyCode == "40") {
        globals.keys["down"] = false;
    }
    else if (e.keyCode == "65") {
        globals.keys["a"] = false;
    }
    else if (e.keyCode == "68") {
        globals.keys["d"] = false;
    }
    else if (e.keyCode == "87") {
        globals.keys["w"] = false;
    }
    else if(e.keyCode == "83") {
        globals.keys["s"] = false;
    }
    else if(e.keyCode == "32") {
        globals.keys["space"] = false;
    }
    globals.keys[e.keyCode] = false;
}

var draw = {
    main: function() {},
}

var sprites = [];

var Sprite = function(name) {
    this.name = name; 
    this.box = new BoundingBox(); //Comes with a default box
    this.draw = function() {
        this.box.draw();
    }

    this.events = {};
    this.bind = function(event, func) { //Global events; make own hadling for local events
        this.events[event] = func;
    }

    this.box.set(-999, -999, 0, 0, 0);
    this.attrs = {};
    sprites.push(this);
}

var BoundingBox = function() {
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

    this.turn = function(theta) {
        this.set(this.x, this.y, this.w, this.h, this.dir + theta)
    }

    this.step = function(steps) {
        x = this.x + steps * Math.cos(this.dir)
        y = this.y - steps * Math.sin(this.dir)
        this.set(x, y, this.w, this.h, this.dir)
    }

    this.drawAttrs = {
        fill: false,
        border: true,
        fillColor: "white",
        borderColor: "black",
        thickness: 1,
        fillOpacity: 1,
        font: "sans",
        fontSize: 25,
        fontColor: "black",
        text: true,
        textAlign: "center",
        textDir: 0,
        image: false, //make false
        imageSrc: null,
        imageResize: false,
        imageWidth: 0,
        imageHeight: 0,
    }

    this.text = "";
    this.inactive = false;
    this.image = null;

    this.draw = function() {
        if (this.inactive) return;
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
        //end shape drawing
        if (this.drawAttrs.text) {
            ctx.fillStyle = this.drawAttrs.fontColor
            ctx.font = "" + this.drawAttrs.fontSize + "px " + this.drawAttrs.font
            ctx.save()
            ctx.translate(this.x, this.y)
            ctx.rotate((-1 * this.dir) - this.drawAttrs.textDir)
            ctx.textAlign = this.drawAttrs.textAlign
            ctx.fillText(this.text, ...this.rotate([0, (this.drawAttrs.fontSize/2)-2], this.drawAttrs.textDir))
            ctx.restore()
        }
        if (this.drawAttrs.image) {
            if (this.image == null) {
                //Load image src
                //this.drawAttrs.image = false;
                this.image = new Image();
                this.image.src = this.drawAttrs.imageSrc;
            } else {
                // paint image
                if (this.image.complete && this.image.naturalHeight != 0) {
                    if (this.drawAttrs.imageResize) {
                        ctx.drawImage(this.image, 
                                      this.x-this.w/2, this.y-this.h/2, 
                                      this.drawAttrs.imageWidth, 
                                      this.drawAttrs.imageHeight);
                    } else {
                        ctx.drawImage(this.image, this.x-this.w/2, this.y-this.h/2);
                    }
                }
            }
        } 
    }

    this.refreshImage = function(s) {
        this.image = new Image();
        this.image.src = this.drawAttrs.imageSrc;
    }

    this.drawEllipse = function() {
        ctx.fillStyle = this.drawAttrs.fillColor
        ctx.strokeStyle = this.drawAttrs.borderColor
        ctx.lineWidth = this.drawAttrs.thickness
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.w/2, this.h/2, 0, 0, 2 * Math.PI);    
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

    this.pointRelLine = function(point, p1, p2, rel) {
        //True if point touching line or above [right of] line
        x = point[0]
        y = point[1]
        if (p1[0] - p2[0] == 0) {
            if (rel == "above") {
                return x > p1[0]
            } else {
                return x < p1[0]       
            }   
        }
        slope = (p1[1] - p2[1])/(p1[0] - p2[0]);
        h = p1[0]
        k = p1[1]
        expectedY = slope * (x - h) + k
        if (rel == "above") {
            return y > expectedY
        } else {
            return y < expectedY
        }
    }

    this.pointBetweenLines = function(point, a1, a2, b1, b2) {
        return (this.pointRelLine(point, a1, a2, "above") && this.pointRelLine(point, b1, b2, "below")) || (this.pointRelLine(point, b1, b2, "above") && this.pointRelLine(point, a1, a2, "below"))
    }

    this.pointInside = function(point) {
        //lines from p1 to p2, p3 to p4
        //lines form p2 to p3, p1 to p4
        //must be inside bounds of each of those pairs of lines
        return this.pointBetweenLines(point, this.p1, this.p2, this.p3, this.p4) && this.pointBetweenLines(point, this.p2, this.p3, this.p1, this.p4)
    }

    this.onSegment = function(p, q, r) {
        if (q[0] <= Math.max(p[0], r[0]) && q[0] >= Math.min(p[0], r[0]) &&
            q[1] <= Math.max(p[1], r[1]) && q[1] >= Math.min(p[1], r[1])) {
           return true;
        }
        return false;
    }
 
    // To find orientation of ordered triplet (p, q, r).
    // The function returns following values
    // 0 --> p, q and r are colinear
    // 1 --> Clockwise
    // 2 --> Counterclockwise
    this.orientation = function(p, q, r)
    {
        // See http://www.geeksforgeeks.org/orientation-3-ordered-points/
        // for details of below formula.
        val = (q[1] - p[1]) * (r[0] - q[0]) -
                  (q[0] - p[0]) * (r[1] - q[1]);
     
        if (val == 0) {
            return 0;
        }  // colinear

        if (val > 0) { 
            return 1;
        } else {
            return 2;
        } // clock or counterclock wise
    }
 
    // The main function that returns true if line segment 'p1q1'
    // and 'p2q2' intersect.
    this.doIntersect = function(p1, q1, p2, q2)
    {
        // Find the four orientations needed for general and
        // special cases
        o1 = this.orientation(p1, q1, p2);
        o2 = this.orientation(p1, q1, q2);
        o3 = this.orientation(p2, q2, p1);
        o4 = this.orientation(p2, q2, q1);
     
        // General case
        if (o1 != o2 && o3 != o4)
            return true;
     
        // Special Cases
        // p1, q1 and p2 are colinear and p2 lies on segment p1q1
        if (o1 == 0 && this.onSegment(p1, p2, q1)) return true;
     
        // p1, q1 and p2 are colinear and q2 lies on segment p1q1
        if (o2 == 0 && this.onSegment(p1, q2, q1)) return true;
     
        // p2, q2 and p1 are colinear and p1 lies on segment p2q2
        if (o3 == 0 && this.onSegment(p2, p1, q2)) return true;
     
         // p2, q2 and q1 are colinear and q1 lies on segment p2q2
        if (o4 == 0 && this.onSegment(p2, q1, q2)) return true;
     
        return false; // Doesn't fall in any of the above cases
    }

    this.touching = function(otherBox) {
        pts = [this.p1, this.p2, this.p3, this.p4]
        opts = [otherBox.p1, otherBox.p2, otherBox.p3, otherBox.p4]
        for (var i = 0; i < 4; i++) {
            if (otherBox.pointInside(pts[i]) || this.pointInside(opts[i])) {
                return true
            }
        }
        lines = [[this.p1, this.p2],
                 [this.p2, this.p3],
                 [this.p3, this.p4],
                 [this.p4, this.p1]]
        olines = [[otherBox.p1, otherBox.p2],
                 [otherBox.p2, otherBox.p3],
                 [otherBox.p3, otherBox.p4],
                 [otherBox.p4, otherBox.p1]]
        for (var i = 0; i < 4; i++) {
            for (var k = 0; k < 4; k++) {
                if (this.doIntersect(...lines[i], ...olines[k])) {
                    return true
                }
            }
        }
        return false
    }

    this.offstage = function() {
        pts = [this.p1, this.p2, this.p3, this.p4]
        for (var i = 0; i < 4; i++) { //if any are on stage return false
            x = pts[i][0]
            y = pts[i][1]
            if ((x >= 0 && x <= gv.width) && (y >= 0 && y <= gv.height)) {
                return false
            }
        }
        return true
    }
}

var grid = {
    rows: 8,
    cols: 8,
    tiles: [],

    getCellWidth: function() {
        return gv.width / this.rows;
    },

    getCellHeight: function() {
        return gv.height / this.cols;
    },

    draw: function() {
        var width = gv.width / grid.rows;
        var height = gv.height / grid.cols;
        for (var i = 0; i < grid.rows; i++) {
            ctx.beginPath()
            ctx.moveTo(width * i, 0)
            ctx.lineTo(width * i, gv.height)
            ctx.stroke()
        }
        for (var i = 0; i < grid.cols; i++) {
            ctx.beginPath()
            ctx.moveTo(0, height * i)
            ctx.lineTo(gv.width, height * i)
            ctx.stroke()
        }
    },

    tiles: [],

    get: function(r, c) {
        return this.tiles[r][c]
    },

    foreach: function(f) {
        for (var i = 0; i < this.rows; i++) {
            for (var k = 0; k < this.cols; k++) {
                f(this.tiles[i][k]);
            }
        }
    },

    init: function(r, c) {
        this.rows = r;
        this.cols = c;
        var width = gv.width / this.rows;
        var height = gv.height / this.cols;
        this.tiles = [];
        for (var i = 0; i < this.rows; i++) {
            this.tiles.push([])
            for (var k = 0; k < this.cols; k++) {
                s = new Sprite("gridCell" + i + k);
                s.row = i;
                s.col = k;
                s.box.set((width * k) + (width/2), (height * i) + (height/2), width, height, 0)
                this.tiles[i].push(s)
            }
        }
        draw.overdraw = this.draw;
    },

    resetRotation: function() {
        var width = gv.width / this.rows;
        var height = gv.height / this.cols;
        for (var i = 0; i < this.rows; i++) {
            for (var k = 0; k < this.cols; k++) {
                this.tiles[i][k].box.set((width * k) + (width/2), (height * i) + (height/2), width, height, 0)
            }
        }
    },

    rotate: function(amt) {
        if (this.rows == this.cols) {
            if (amt == 90) {
                positions = []
                for (var i = 0; i < this.rows; i++) {
                    //create an array of positions, rotate it, then iterate thru original and give each a new position
                    positions.push([])
                    for (var k = 0; k < this.cols; k++) {
                        positions[i].push([this.tiles[i][k].box.x, this.tiles[i][k].box.y]);
                    }
                } 

                newPositions = []
                for (var i = 0; i < this.rows; i++) {
                    newPositions.push([])
                    for (var k = this.rows-1; k >= 0; k -= 1) {
                        newPositions[i].push(positions[k][i]);
                    }
                }

                for (var i = 0; i < this.rows; i++) {
                    for (var k = 0; k < this.cols; k++) {
                        this.tiles[i][k].box.setPosition(newPositions[i][k][0], newPositions[i][k][1]);
                    }
                }
            } else if (amt == 180) {
                this.rotate(90);
                this.rotate(90);
            } else if (amt == 270) {
                this.rotate(90);
                this.rotate(90);
                this.rotate(90);
            }
        } else {
            print("Cannot rotate a nonsquare grid")
        }
    },
}

var request = {
    get: function(url) {
        $.get(url, function(data) {
            return data;
        })
    }
}

//Kick off
var update = function() {
    window.requestAnimationFrame(update);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = canvas.width;
    for (k in draw) {
        draw[k]();
    }
    for (var k = 0; k < sprites.length; k++) {
        sprites[k].draw();
    }
} 
update();
