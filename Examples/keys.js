setup.night()
setup.title("Keyboard and Multi-Box Demo")

sprite1 = new Sprite("tank")
sprite1.box.set(100, 100, 100, 100, 0)
sprite1.box.drawAttrs.fill = true;
sprite1.box.drawAttrs.fillColor = "purple"
sprite1.box.text = sprite1.name
sprite1.box.drawAttrs.font = "Arial"
sprite1.box.drawAttrs.fontSize = 20
sprite1.box.drawAttrs.textPosition = [-40, 0]
sprite1.box.drawAttrs.textDir = 3*Math.PI/2 

sprite1.speed = 1

sprite1.box2 = new BoundingBox();
sprite1.box2.drawAttrs.fill = true;
sprite1.box2.drawAttrs.fillColor = "blue"

sprite1.bullets = []
sprite1.canShoot = true;
sprite1.shootTimer = 200;

sprite1.shoot = function() {
    if (this.canShoot) {
        this.bullets = this.bullets.filter(function(x) {
            return !x.offstage()
        })
        b = new BoundingBox()
        b.set(this.box.x, this.box.y, 10, 10, this.box.dir)
        b.drawAttrs.fill = true
        b.drawAttrs.fillColor = "red"
        this.bullets.push(b)
        this.canShoot = false
        self = this
        setTimeout(function() {
            self.canShoot = true
        }, this.shootTimer);
    }
}
sprite1.draw = function() {
    if (gv.keys["left"]) {
        this.box.setPosition(this.box.x - this.speed, this.box.y)
    }
    if (gv.keys["right"]) {
        this.box.setPosition(this.box.x + this.speed, this.box.y)
    }
    if (gv.keys["up"]) {
        this.box.setPosition(this.box.x, this.box.y - this.speed)
    }
    if (gv.keys["down"]) {
        this.box.setPosition(this.box.x, this.box.y + this.speed)
    }
    if (gv.keys["a"]) {
        this.box.turn(0.01)
    }
    if (gv.keys["d"]) {
        this.box.turn(-0.01)
    }
    if (gv.keys["w"]) {
        this.box.step(1)
    }
    if (gv.keys["s"]) {
        this.box.step(-1)
    }
    if (gv.keys["space"]) {
        this.shoot()
    }
    this.box2.set(this.box.x, this.box.y, 100, 30, this.box.dir)
    this.box2.step(75) // Translate it consistently

    for (var i=0; i<this.bullets.length; i++) {
        this.bullets[i].step(10)
        this.bullets[i].drawEllipse()
    }

    this.box.draw()
    this.box2.draw()
}