setup.init("Mouse And Rotate Example");

//Test rotate and scale and adding anonymous sprites
for (var i=0; i < 101; i++) {
    s = new Sprite("test" + i)
    s.box.set(Math.random() * gv.width, Math.random() * gv.height, 10, 10, 0)
    s.box.drawAttrs.fill = true
    s.box.drawAttrs.border = false
    s.box.drawAttrs.fillOpacity = 0.5
    s.box.drawAttrs.fillColor = choice(["#00ffff", "#ff00ff", "#ffff00"])
    s.theta = choice([0.02, -0.02])
    s.draw = function() {
        this.box.setDir(this.box.dir + this.theta)
        this.box.setSize(this.box.w + 0.2, this.box.h + 0.2)
        this.box.draw()
    }
}

//Test mouse handling
sprite1 = new Sprite("MouseSelector")
sprite1.box.set(0, 0, 0, 0, 0)
sprite1.box.drawAttrs.fill = true
sprite1.box.drawAttrs.fillColor = "blue"
sprite1.box.drawAttrs.fillOpacity = 0.5
sprite1.bind("mouseDown", function(self) {
    self.sx = gv.mouseX;
    self.sy = gv.mouseY;
    self.box.drawAttrs.fillColor = choice(["red", "blue", "green"])
})
sprite1.bind("mouseUp", function(self) {
    self.box.set(0, 0, 0, 0, 0)
})
sprite1.draw = function() {
    if (gv.mouseDown) {
        this.box.setPosition((this.sx + gv.mouseX)/2, (this.sy + gv.mouseY)/2)    
        this.box.setSize(gv.mouseX - this.sx, gv.mouseY - this.sy)
        this.box.draw()
    }
}