setup.init("Chess")
setup.setDimensions(600, 600)

grid.init(8, 8);

white = ["wN", "wP", "wQ", "wR", "wK", "wB"];
black = ["bN", "bP", "bQ", "bR", "bK", "bB"];
EMPTY = "";

colorScheme = {
	whiteCell: "white",
	blackCell: "gray",
	active: "pink",
	move: "yellow"
}

startingBoard = [
	["bR",    "bN", "bB", "bQ", "bK", "bB", "bN", "bR"],
	["bP",    "bP", "bP", "bP", "bP", "bP", "bP", "bP"],
	[EMPTY, EMPTY,  EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
	[EMPTY, EMPTY,  EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
	[EMPTY, EMPTY,  EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
	[EMPTY, EMPTY,  EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
	["wP",    "wP", "wP", "wP", "wP", "wP", "wP", "wP"],
	["wR",    "wN", "wB", "wQ", "wK", "wB", "wN", "wR"]
];

//helpers
pairIn = function(arr, p1, p2) { 
    //Is [p1, p2] in arr (an Nx2 array)
	for (var i = 0; i < arr.length; i++) {
		if(arr[i][0] == p1 && arr[i][1] == p2) {
			return true;
		}
	}
	return false;
}

inArr = function(arr, item) {
    return arr.indexOf(item) > 0;
}

game = {
    init: function() {
        this.turn = white;
        this.whiteCastled = false;
        this.blackCastled = false;
        this.lastMove = null;
        this.board = $.extend(true, {}, startingBoard);
    },
	turn: white,
	whiteCastled: false,
	blackCastled: false,
	lastMove: null,
	board: $.extend(true, {}, startingBoard),
	active: null,
	potentialMoves: [],
	handleClick: function(r, c) {
		grid.foreach(function(sprite) {
			sprite.box.drawAttrs.fillColor = sprite.gridColor;
		}); //Clear all added colors

		//Possiblities: 
		//1. Our turn and a friendly piece -- color possible moves as well -- set active Piece -- Remove all statuses -- Add statuses
		//2. Our turn and a empty space / enemy piece  -- Defaults
		//3. Our turn and clicking on a possible move
		cell = grid.get(r, c);
		piece = this.board[r][c];
		turn = this.turn;
		if (inArr(turn, piece)) {
            //Case 1 ^
            if (this.active != null && (this.active[0] == r && this.active[1] == c)) {
                //Clicked on already active spot
                this.active = null;
                this.potentialMoves = [];
                grid.foreach(function(sprite) {
                    sprite.box.drawAttrs.fillColor = sprite.gridColor;
                });
            } else {
    			cell.box.drawAttrs.fillColor = colorScheme.active;
    			pm = this.legalMoves(r, c, true);
    			this.potentialMoves = pm;
    			this.active = [r, c];
    			for (var i = 0; i < pm.length; i++) { 
    				//Color in potential moves
    				grid.get(pm[i][0], pm[i][1]).box.drawAttrs.fillColor = colorScheme.move;
    			}
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
		this.board[l1[0]][l1[1]] = EMPTY;
		this.board[l2[0]][l2[1]] = piece; //Do material cals and stuff here
		this.updateGrid();
        //Check for mate/stale
	},
	legalMoves: function(r, c, check) {
		piece = this.board[r][c];
		if (piece != EMPTY) {
			if (inArr(white, piece)) {
				friendlies = white;
				enemies = black;
			} else {
				friendlies = black;
				enemies = white;
			}
			result = []
			if (piece == "wP") {
                if (this.board[r-1][c] == EMPTY) {
    				result.push([r-1, c]);
    				if (r == 6 && this.board[r-2][c] == EMPTY) {
    					result.push([r-2, c]);
    				}
                }
			}
            if (piece == "bP") {
                if (this.board[r+1][c] == EMPTY) {
                    result.push([r+1, c]);
                    if (r == 1   && this.board[r+2][c] == EMPTY) {
                        result.push([r+2, c]);
                    }
                }
            }
			return result;
		}
		return [];
	}
}

//Populate and checker the grid
letters = "abcdefgh".split("");
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
            game.handleClick(self.row, self.col);
        }
    })
    //Add box relative positioning 
    sprite.box2 = new BoundingBox(); //Make child of box
    sprite.box2.set(sprite.box.x-sprite.box.w/2+10, 
                    sprite.box.y+sprite.box.h/2-10, 
                    sprite.box.w, sprite.box.h, sprite.box.dir);
    sprite.box2.text = letters[sprite.col] + "" + (8-sprite.row);
    sprite.box2.drawAttrs.border = false;
    sprite.box2.drawAttrs.fontSize = 10;
    sprite.draw = function () {
        sprite.box.draw();
        sprite.box2.draw();
    }
})