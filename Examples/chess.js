setup.init("Chess")
setup.setDimensions(600, 600)

grid.init(8, 8);

white = ["wK", "wP", "wQ", "wR", "wK", "wB"];
black = ["bK", "bP", "bQ", "bR", "bK", "bB"];
NONE = "";

startingBoard = [
	["bR", "bK", "bB", "bQ", "bK", "bB", "bK", "bR"],
	["bP", "bP", "bP", "bP", "bP", "bP", "bP", "bP"],
	[NONE, NONE, NONE, NONE, NONE, NONE, NONE, NONE],
	[NONE, NONE, NONE, NONE, NONE, NONE, NONE, NONE],
	[NONE, NONE, NONE, NONE, NONE, NONE, NONE, NONE],
	[NONE, NONE, NONE, NONE, NONE, NONE, NONE, NONE],
	["wP", "wP", "wP", "wP", "wP", "wP", "wP", "wP"],
	["wR", "wK", "wB", "wQ", "wK", "wB", "wK", "wR"]
];

game = {
	turn: "white",
	whiteCastled: false,
	blackCastled: false,
	lastMoveEnPassant: false,
	board: startingBoard,
}

//Populate and checker the grid
grid.foreach(function(sprite) {
    sprite.box.drawAttrs.fill = true;

    if (sprite.row % 2 == sprite.col % 2) {
    	sprite.box.drawAttrs.fillColor = "white";
    } else  {
    	sprite.box.drawAttrs.fillColor = "gray";
    }
    sprite.box.text = game.board[sprite.row][sprite.col];
    sprite.bind("click", function(self) {
        if (self.box.pointInside([gv.mouseX, gv.mouseY])) {
            log(self.name)
        }
    })
})