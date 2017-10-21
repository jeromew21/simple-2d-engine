setup.night()
setup.title("Click demo")

for (var i=0; i<10; i++) {
    s = new Sprite("test" + i)
    s.box.set(Math.random() * gv.width, Math.random() * gv.height, 100, 100, 0)
    s.box.drawAttrs.fill = true
    s.box.drawAttrs.fontSize = 50
    s.numClicks = 0
    s.bind("click", function(self) {
        if (self.box.pointInside([gv.mouseX, gv.mouseY])) {
            self.numClicks++;
            self.box.drawAttrs.fillColor = choice(["red", "blue", "green", "yellow"])
            self.box.setDir(self.box.dir + Math.PI/6)
            self.box.setPosition(Math.random() * gv.width, Math.random() * gv.height)
        }
    })
    s.draw = function() {
        this.box.text = this.numClicks
        this.box.draw()
    }
}

sprite2 = new Sprite("MouseSelector")
sprite2.box.set(-1000, -1000, 0, 0, 0)
sprite2.box.drawAttrs.fill = true
sprite2.box.drawAttrs.fillColor = "blue"
sprite2.box.drawAttrs.fillOpacity = 0.5
sprite2.box.drawAttrs.textPosition = [0, 0]
sprite2.bind("mouseDown", function(self) {
    self.sx = gv.mouseX;
    self.sy = gv.mouseY;
    color = choice(["red", "blue", "green"])
    self.box.drawAttrs.fillColor = color
    self.box.drawAttrs.fontColor = "#404040"
    self.box.drawAttrs.fontSize = 0
})
sprite2.bind("mouseUp", function(self) {
    self.box.set(-1000, -1000, 0, 0, 0)
    self.box.drawAttrs.fontSize = 0
})
sprite2.draw = function() {
    if (gv.mouseDown) {
        this.box.text = "Hello World"
        this.box.drawAttrs.fontSize = Math.abs(this.box.w) / 10
        this.box.setPosition((this.sx + gv.mouseX)/2, (this.sy + gv.mouseY)/2)    
        this.box.setSize(gv.mouseX - this.sx, gv.mouseY - this.sy)
        this.box.draw()
    }
}