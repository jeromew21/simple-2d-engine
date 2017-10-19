setup.border();
setup.night();

draw.main = function() {
    ctx.fillText("Mouse Example", 10, 10, 100)
}

sprite1 = new Sprite("MouseSelector")
sprite1.bind("mouseDown", function(self) {
    self.startX = gv.mouseX;
    self.startY = gv.mouseY;
})
sprite1.draw = function() {
    if (gv.mouseDown) {
        ctx.rect(this.startX, this.startY, gv.mouseX - this.startX, gv.mouseY - this.startY)
        ctx.stroke()
    }   
}