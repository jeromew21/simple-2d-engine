setup.init("Chess");
setup.setDimensions(600, 600);

grid.init(8, 8);

var white = ["wN", "wP", "wQ", "wR", "wK", "wB"];
var black = ["bN", "bP", "bQ", "bR", "bK", "bB"];
var EMPTY = "";

var colorScheme = {
    whiteCell: "white",
    blackCell: "gray",
    active: "#98FB98",
    move: "#FFFF54"
}

var startingBoard = [
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
function pairIn(arr, p1, p2) { 
    //Is [p1, p2] in arr (an Nx2 array)
    for (var i = 0; i < arr.length; i++) {
        if (arr[i][0] == p1 && arr[i][1] == p2) {
            return true;
        }
    }
    return false;
}

function inArr(arr, item) {
    return arr.indexOf(item) > -1;
}

function copyObj(arr) {
    return $.extend(true, {}, arr);
}

//test
//gv["flip board"] = true;

function Game() {
    this.init = function() {
        this.turn = white;
        this.whiteCastled = false;
        this.blackCastled = false;
        this.whiteCanCastleKs = true;
        this.blackCanCastleKs = true;
        this.whiteCanCastleQs = true;
        this.blackCanCastleQs = true;
        this.lastMove = null;
        this.board = copyObj(startingBoard);
        this.updateGrid();
        gv.message("White's turn");
    }
    this.turn = white;
    this.whiteCastled = false;
    this.blackCastled = false;
    this.whiteCanCastleKs = true;
    this.blackCanCastleKs = true;
    this.whiteCanCastleQs = true;
    this.blackCanCastleQs = true;
    this.lastMove = null;
    this.board = copyObj(startingBoard);
    this.active = null;
    this.potentialMoves = [];
    this.handleClick = function(r, c) {
        grid.foreach(function(sprite) {
            sprite.box.drawAttrs.fillColor = sprite.gridColor;
        }); //Clear all added colors

        //Possiblities: 
        //1. Our turn and a friendly piece -- color possible moves as well -- set active Piece -- Remove all statuses -- Add statuses
        //2. Our turn and a empty space / enemy piece  -- Defaults
        //3. Our turn and clicking on a possible move
        var cell = grid.get(r, c);
        var piece = this.board[r][c];
        var turn = this.turn;
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
                var pm = legalMoves(this, r, c, true);
                this.potentialMoves = pm;
                this.active = [r, c];
                for (var i = 0; i < pm.length; i++) { 
                    //Color in potential moves
                    grid.get(pm[i][0], pm[i][1]).box.drawAttrs.fillColor = colorScheme.move;
                }
            }
        } else if (pairIn(this.potentialMoves, r, c)) {
            //case 3 ^
            this.move(this.active, [r, c]);
            //interfacing
            this.active = null; 
            this.potentialMoves = [];
            //switch turn
            if (this.turn == white) {
                this.turn = black;
                gv.message("Black's turn");
            } else {
                this.turn = white;
                gv.message("White's turn");
            }
            this.updateGrid();
            //check for win/stale
            if (gv["flip board"]) {
                grid.rotate(180);
                this.updateGrid();
            }
        } 
    },
    this.updateGrid = function() {
        var self = this;
        grid.foreach(function(sprite) {
            if (self.board[sprite.row][sprite.col] == EMPTY) {
                sprite.box.drawAttrs.image = false;
                sprite.box.text = EMPTY;
            } else {    
                sprite.box.drawAttrs.image = true;
                sprite.box.drawAttrs.imageSrc = "Examples/chess/pieces/" + self.board[sprite.row][sprite.col] + ".png";
                sprite.box.refreshImage();
            }
        });
    }
    this.move = function(l1, l2) { 
        var piece = this.board[l1[0]][l1[1]];
        if (piece == "wP" && l2[0] == 0) {
            piece = "wQ";
        }
        if (piece == "bP" && l2[0] == 7) {
            piece = "bQ";
        }
        
        //en passant
        if (piece == "wP") {
            if (l1[1] != l2[1]) {
                if (this.board[l2[0]][l2[1]] == EMPTY) {
                    this.board[l2[0]+1][l2[1]] = EMPTY;
                }
            }
        }
        if (piece == "bP") {
            if (l1[1] != l2[1]) {
                if (this.board[l2[0]][l2[1]] == EMPTY) {
                    this.board[l2[0]-1][l2[1]] = EMPTY;
                }
            }
        }

        this.board[l1[0]][l1[1]] = EMPTY; //remove from current location
        this.board[l2[0]][l2[1]] = piece; //place at new location

        var rook;
        if (piece == "wK") {
            this.whiteCanCastleKs = false;
            this.whiteCanCastleQs = false;
            this.whiteCastled = true;
            rook = "wR";
        }
        if (piece == "bK") {
            this.blackCanCastleKs = false;
            this.blackCanCastleQs = false;
            this.blackCastled = true;
            rook = "bR";
        }
        if ((piece == "wK") || (piece == "bK")) {
            if (l1[1] == 4 && l2[1] == 6) {
                this.board[l1[0]][7] = EMPTY;
                this.board[l1[0]][5] = rook;
            } else if (l1[1] == 4 && l2[1] == 2) {
                this.board[l1[0]][0] = EMPTY;
                this.board[l1[0]][3] = rook;
            }
        }
        if (piece == "wR") {
            if (l1[0] == 7 && l1[1] == 7) {
                this.whiteCanCastleKs = false;
            }
            if (l1[0] == 7 && l1[1] == 0) {
                this.whiteCanCastleQs = false;
            }
        }
        if (piece == "bR") {
            if (l1[0] == 0 && l1[1] == 7) {
                this.blackCanCastleKs = false;
            }
            if (l1[0] == 0 && l1[1] == 0) {
                this.blackCanCastleQs = false;
            }
        }
        this.lastMove = [l1, l2];
    }
}

function isCheck(g, side, l1, l2) {
    var king = "bK";
    var attackers = white;
    if (side == white) {
        king = "wK";
        attackers = black;
    } 
    var gg = copyObj(g);
    var board = gg.board;
    var moves;
    //apply move
    gg.move(l1, l2);
    for (var i = 0; i < 8; i++) {
        for (var k = 0; k < 8; k++) {
            if (inArr(attackers, board[i][k])) {
                moves = legalMoves(gg, i, k, false); 
                for (var m = 0; m < moves.length; m++) {
                    if (board[moves[m][0]][moves[m][1]] == king) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

function legalMoves(g, r, c, check) {
    var piece = g.board[r][c];
    var board = g.board;
    var friendlies;
    var enemies;
    var result = [];
    var finalResult = [];
    if (piece != EMPTY) {
        if (inArr(white, piece)) {
            friendlies = white;
            enemies = black;
        } else {
            friendlies = black;
            enemies = white;
        }
        if (piece == "wP") {
            if (r-1 >= 0) {
                if (board[r-1][c] == EMPTY) {
                    result.push([r-1, c]);
                    if (r == 6 && board[r-2][c] == EMPTY) {
                        result.push([r-2, c]);
                    }   
                }
                if (c-1 >= 0) {
                    if (inArr(enemies, board[r-1][c-1])) {
                        result.push([r-1, c-1]);
                    }
                }
                if (c+1 <= 7) {
                    if (inArr(enemies, board[r-1][c+1])) {
                        result.push([r-1, c+1]);
                    }
                }
                if (r == 3) {
                    if (Math.abs(g.lastMove[0][1]-c) == 1 && g.lastMove[0][1] == g.lastMove[1][1]) {
                        if ((g.lastMove[1][0] == 3 && g.lastMove[0][0] == 1) && board[g.lastMove[1][0]][g.lastMove[1][1]] == "bP") {
                            result.push([r-1, g.lastMove[0][1]]);
                        }
                    }
                }
            }
        } else if (piece == "bP") {
            if (r+1 <= 7) {
                if (board[r+1][c] == EMPTY) {
                    result.push([r+1, c]);
                    if (r == 1   && board[r+2][c] == EMPTY) {
                        result.push([r+2, c]);
                    }
                }
                if (c-1 >= 0) {
                    if (inArr(enemies, board[r+1][c-1])) {
                        result.push([r+1, c-1]);
                    }
                }
                if (c+1 <= 7) {
                    if (inArr(enemies, board[r+1][c+1])) {
                        result.push([r+1, c+1]);
                    }
                }
            }
        } else if (piece == "wN" || piece == "bN") {
            for (var i = -2; i < 3; i++) {
                for (var k = -2; k < 3; k++) {
                    if ((i != 0 && k != 0) && Math.abs(i) != Math.abs(k)) {
                        if ((r+i <= 7 && r+i >= 0) && (c+k <= 7 && c+k >= 0)) {
                            if (board[r+i][c+k] == EMPTY || inArr(enemies, board[r+i][c+k])) {
                                result.push([r+i, c+k]);
                            }
                        }
                    }
                }
            }
        } else if (piece == "wR" || piece == "bR") {
            walks = [
                [1, 0],
                [-1, 0],
                [0, 1],
                [0, -1]
            ]
            for (var i = 0; i < 4; i++) {
                dx = walks[i][0];
                dy = walks[i][1];
                while (true) {
                    if ((r+dy > 7 || r+dy < 0) || (c+dx > 7 || c+dx < 0)) {
                        break;
                    }
                    if (inArr(friendlies, board[r+dy][c+dx])) {
                        break;
                    }
                    if (inArr(enemies, board[r+dy][c+dx])) {
                        result.push([r+dy, c+dx]);
                        break;
                    }
                    if (board[r+dy][c+dx] == EMPTY) {
                        result.push([r+dy, c+dx])
                    }
                    dx += walks[i][0];
                    dy += walks[i][1];
                }
            }
        } else if (piece == "wB" || piece == "bB") {
            walks = [
                [1, 1],
                [-1, 1],
                [1, -1],
                [-1, -1]
            ]
            for (var i = 0; i < 4; i++) {
                dx = walks[i][0];
                dy = walks[i][1];
                while (true) {
                    if ((r+dy > 7 || r+dy < 0) || (c+dx > 7 || c+dx < 0)) {
                        break;
                    }
                    if (inArr(friendlies, board[r+dy][c+dx])) {
                        break;
                    }
                    if (inArr(enemies, board[r+dy][c+dx])) {
                        result.push([r+dy, c+dx]);
                        break;
                    }
                    if (board[r+dy][c+dx] == EMPTY) {
                        result.push([r+dy, c+dx])
                    }
                    dx += walks[i][0];
                    dy += walks[i][1];
                }
            }
        } else if (piece == "wQ" || piece == "bQ") {
            walks = [
                [1, 1],
                [-1, 1],
                [1, -1],
                [-1, -1],
                [1, 0],
                [-1, 0],
                [0, 1],
                [0, -1]
            ]
            for (var i = 0; i < 8; i++) {
                dx = walks[i][0];
                dy = walks[i][1];
                while (true) {
                    if ((r+dy > 7 || r+dy < 0) || (c+dx > 7 || c+dx < 0)) {
                        break;
                    }
                    if (inArr(friendlies, board[r+dy][c+dx])) {
                        break;
                    }
                    if (inArr(enemies, board[r+dy][c+dx])) {
                        result.push([r+dy, c+dx]);
                        break;
                    }
                    if (board[r+dy][c+dx] == EMPTY) {
                        result.push([r+dy, c+dx])
                    }
                    dx += walks[i][0];
                    dy += walks[i][1];
                }
            }
        } else if (piece == "wK" || piece == "bK") {
            walks = [
                [1, 1],
                [-1, 1],
                [1, -1],
                [-1, -1],
                [1, 0],
                [-1, 0],
                [0, 1],
                [0, -1]
            ]
            for (var i = 0; i < 8; i++) {
                dx = walks[i][0];
                dy = walks[i][1];
                if (!(r+dy > 7 || r+dy < 0) || (c+dx > 7 || c+dx < 0)) {
                    if (!inArr(friendlies, board[r+dy][c+dx])) {
                        if (inArr(enemies, board[r+dy][c+dx]) || board[r+dy][c+dx] == EMPTY) {
                            result.push([r+dy, c+dx]);
                        }
                    }
                }
            }
            //king cannot pass thru check or CASTLE OUT OF CHECK
            //Can only do once, and if either piece has moved, then cannot
            if (((piece == "wK" && !g.whiteCastled) && (c == 4 && r == 7)) || ((piece == "bK" && !g.blackCastled) && (c == 4 && r == 0))) {
                if (((piece == "wK" && g.whiteCanCastleKs) && board[7][7] == "wR") || ((piece == "bK" && g.blackCanCastleKs))){// && board[0][7] == "bR")){
                    if (board[r][c+1] == EMPTY && board[r][c+2] == EMPTY) {
                        if (!isCheck(g, friendlies, [r, c], [r, c+1])) {
                            result.push([r, c+2]);
                        }
                    } 
                } 
                if (((piece == "wK" && g.whiteCanCastleQs) && board[7][0] == "wR") || ((piece == "bK" && g.blackCanCastleQs) && board[0][0] == "bR")){
                    if ((board[r][c-1] == EMPTY && board[r][c-2] == EMPTY) && board[r][c-3] == EMPTY) {
                        if (!isCheck(g, friendlies, [r, c], [r, c-1]) && !isCheck(g, friendlies, [r, c], [r, c-2])) {
                            result.push([r, c-2]);
                        }
                    } 
                }
            }
        } 
    }
    if (check) {
        //Keep results that don't create a check for the current side
        var t = [r, c];
        for (var i = 0; i < result.length; i++) {
            //for some reason breaks
            if (!isCheck(g, friendlies, t, result[i])) {
                finalResult.push(result[i]);
            }
        }
    } else {
        return result;
    }
    return finalResult;
}

game = new Game();
game.init();

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

    sprite.bind("click", function(self) {
        if (self.box.pointInside([gv.mouseX, gv.mouseY])) {
            game.handleClick(self.row, self.col);
        }
    })
    
    //Add box w/ relative positioning 
    sprite.box2 = new BoundingBox(); //Make child of box
    sprite.box2.text = letters[sprite.col] + "" + (8-sprite.row);
    sprite.box2.drawAttrs.border = false;
    sprite.box2.drawAttrs.fontSize = 10;

    sprite.draw = function() {
        sprite.box.draw();
        sprite.box2.set(sprite.box.x-sprite.box.w/2+10, 
                        sprite.box.y+sprite.box.h/2-10, 
                        sprite.box.w, sprite.box.h, sprite.box.dir);
        sprite.box2.draw();
    }
})
