setup.night()
setup.title("Grid demo")

draw.overdraw = grid.draw

grid.populate = function(i, k) {
    width = gv.width/grid.rows
    height = gv.height/grid.cols
    b = new Sprite(i + "" + k)
    b.row = i
    b.col = k
    b.box.set((width * i) + (width/2), (height * k) + (height/2), width, height, 0)
    b.box.text = b.name
    b.box.drawAttrs.fill = true
    b.box.drawAttrs.fillColor = "red"
    b.box.drawAttrs.border = false
    b.basecolor = "red"
    b.bind("click", function(self) {
        if (self.box.pointInside([gv.mouseX, gv.mouseY])) {
            self.box.text = "o"
            self.basecolor = "purple"
        }
    })
    b.draw = function() {
        if (this.box.pointInside([gv.mouseX, gv.mouseY])) {
            this.box.drawAttrs.fillColor = "blue"
        } else {
            this.box.drawAttrs.fillColor = this.basecolor
        }
        this.box.draw()
    }
    return b
}

grid.setup()


