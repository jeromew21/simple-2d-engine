setup.night()
setup.title("Collision Demo")

sprite1 = new Sprite("rotatocollision")
sprite1.box.set(100, 100, 100, 100, 0)
sprite1.box.drawAttrs.fill = true;
sprite1.draw = function() {
    this.box.setDir(this.box.dir + 0.01)
    if (this.box.touching(sprite2.box)) {
        this.box.drawAttrs.fillColor = "red";
    } else {
        this.box.drawAttrs.fillColor = "white";
    }
    this.box.draw()
}

for (var i=0; i<10; i++) {
    s = new Sprite("test" + i)
    s.box.set(Math.random() * gv.width, Math.random() * gv.height, 100, 100, 0)
    s.box.drawAttrs.fill = true
    s.draw = function() {
        if (this.box.touching(sprite2.box)) {
            this.box.drawAttrs.fillColor = "yellow"

        } else {
            this.box.drawAttrs.fillColor = "white"
        }
        this.box.draw()
    }
}

//Test mouse handling
sprite2 = new Sprite("MouseSelector")
sprite2.box.set(-1000, -1000, 0, 0, 0)
sprite2.box.drawAttrs.fill = true
sprite2.box.drawAttrs.fillColor = "blue"
sprite2.box.drawAttrs.fillOpacity = 0.5
sprite2.bind("mouseDown", function(self) {
    self.sx = gv.mouseX;
    self.sy = gv.mouseY;
    self.box.drawAttrs.fillColor = choice(["red", "blue", "green"])
})
sprite2.bind("mouseUp", function(self) {
    self.box.set(-1000, -1000, 0, 0, 0)
})
sprite2.draw = function() {
    if (gv.mouseDown) {
        this.box.setPosition((this.sx + gv.mouseX)/2, (this.sy + gv.mouseY)/2)    
        this.box.setSize(gv.mouseX - this.sx, gv.mouseY - this.sy)
        this.box.draw()
    }
}