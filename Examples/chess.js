setup.init("Chess")
setup.setDimensions(600, 600)

grid.init(8, 8);

white = ["wN", "wP", "wQ", "wR", "wK", "wB"];
black = ["bN", "bP", "bQ", "bR", "bK", "bB"];
NONE = "";

colorScheme = {
	whiteCell: "white",
	blackCell: "gray",
	active: "pink",
	move: "yellow"
}

startingBoard = [
	["bR", "bN", "bB", "bQ", "bK", "bB", "bN", "bR"],
	["bP", "bP", "bP", "bP", "bP", "bP", "bP", "bP"],
	[NONE, NONE, NONE, NONE, NONE, NONE, NONE, NONE],
	[NONE, NONE, NONE, NONE, NONE, NONE, NONE, NONE],
	[NONE, NONE, NONE, NONE, NONE, NONE, NONE, NONE],
	[NONE, NONE, NONE, NONE, NONE, NONE, NONE, NONE],
	["wP", "wP", "wP", "wP", "wP", "wP", "wP", "wP"],
	["wR", "wN", "wB", "wQ", "wK", "wB", "wN", "wR"]
];

//helpers
pairIn = function(arr, p1, p2) {
	for (var i = 0; i < arr.length; i++) {
		if(arr[i][0] == p1 && arr[i][1] == p2) {
			return true;
		}
	}
	return false;
}

game = {
	turn: white,
	whiteCastled: false,
	blackCastled: false,
	lastMoveEnPassant: false,
	board: startingBoard,
	active: null,
	potentialMoves: [],
	handleClick: function(r, c) {
		grid.foreach(function(sprite) {
			sprite.box.drawAttrs.fillColor = sprite.gridColor;
		}); //Clear all added colors

		//Possiblities: 
		//1. Our turn and a friendly piece -- color possible moves as well -- set active Piece -- Remove all statuses -- Add statuses
		//2. Our turn and a empty space / enemy piece -- Remove all statuses
		//3. Our turn and clicking on a possible move
		cell = grid.get(r, c);
		piece = this.board[r][c];
		turn = this.turn;
		if (turn.indexOf(piece) > -1) {
			//Case 1 ^
			cell.box.drawAttrs.fillColor = colorScheme.active;
			pm = this.legalMoves(r, c);
			this.potentialMoves = pm;
			this.active = [r, c];
			for (var i = 0; i < pm.length; i++) { 
				//Color in potential moves
				grid.get(pm[i][0], pm[i][1]).box.drawAttrs.fillColor = colorScheme.move;
			}
		} else if (pairIn(this.potentialMoves, r, c)) {
			//case 3 ^
			this.move(this.active, [r, c]); //switches turn
			//interfacing
			this.active = null; 
			this.potentialMoves = [];
		} 
	},
	updateGrid: function() {
		grid.foreach(function(sprite) {
			sprite.box.text = game.board[sprite.row][sprite.col];
		})
	},
	move: function(l1, l2) {
		if (this.turn == white) {
			this.turn = black;
		} else {
			this.turn = white;
		}
		piece = this.board[l1[0]][l1[1]];
		this.board[l1[0]][l1[1]] = NONE;
		this.board[l2[0]][l2[1]] = piece; //Do material cals and stuff here
		this.updateGrid();
	},
	legalMoves: function(r, c) {
		piece = this.board[r][c];
		if (piece != NONE) {
			if (white.indexOf(piece) > -1) {
				friendlies = white;
				enemies = black;
			} else {
				friendlies = black;
				enemies = white;
			}
			result = []
			if (piece == "wP") {
				result.push([r-1, c])
				if (r == 6) {
					result.push([r-2, c])
				}
			}
			return result;
		}
		return [];
	}
}

//Populate and checker the grid
grid.foreach(function(sprite) {
    sprite.box.drawAttrs.fill = true;
    if (sprite.row % 2 == sprite.col % 2) {
    	sprite.gridColor = colorScheme.whiteCell
    	sprite.box.drawAttrs.fillColor = colorScheme.whiteCell;
    } else  {
    	sprite.gridColor = colorScheme.blackCell
    	sprite.box.drawAttrs.fillColor = colorScheme.blackCell;
    }
    sprite.box.text = game.board[sprite.row][sprite.col];
    sprite.bind("click", function(self) {
        if (self.box.pointInside([gv.mouseX, gv.mouseY])) {
            game.handleClick(self.row, self.col)
        }
    });
})