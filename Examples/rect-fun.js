var startX
var startY

draw.main = function() {
    if (gv.mouseDown) {
        ctx.rect(startX, startY, gv.mouseX - startX, gv.mouseY - startY);
        ctx.stroke()
    }
}

ev.mouseDown = function(x, y) {
    startX = x
    startY = y
}