setup.init("Grid demo")
setup.setDimensions(600, 600)

grid.init(8, 8);

grid.foreach(function(sprite) {
    sprite.box.drawAttrs.fill = true;
    sprite.box.drawAttrs.fillColor = "red";
    sprite.box.text = sprite.row;
    sprite.bind("click", function(self) {
        if (self.box.pointInside([gv.mouseX, gv.mouseY])) {
            log(self.name)
        }
    })
})

