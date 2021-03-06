setup.init("Chess");
setup.setDimensions(600, 600);
setup.resizeToScreenSquare();
setup.border()

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

var letters = "abcdefgh".split("");

var paths = {
    "ugly": "Examples/chess/pieces",
    "merida": "Examples/chess/pieces/merida/80",
    "alpha": "Examples/chess/pieces/alpha/80",
    "ugly2": "Examples/chess/pieces/gaygaygay"
}

var imagesPath = paths["merida"];

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

//chess-specific helpers
function pairIn(arr, p1, p2) { 
    //Is [p1, p2] in arr (an Nx2 array)
    for (var i = 0; i < arr.length; i++) {
        if (arr[i][0] == p1 && arr[i][1] == p2) {
            return true;
        }
    }
    return false;
}

function opponent(s) {
    if (s == white) {
        return black;
    }
    return white;
}

function Game() {
    this.init = function(t) {
        this.gameType = t;
        this.active = null;
        this.potentialMoves = [];
        this.turn = white;
        this.whiteCastled = false;
        this.blackCastled = false;
        this.whiteCanCastleKs = true;
        this.blackCanCastleKs = true;
        this.whiteCanCastleQs = true;
        this.blackCanCastleQs = true;
        this.lastMove = null;
        this.board = copyObj(startingBoard);
        gv.message("White's turn");
        this.gameOver = false;
        this.gameOverStatus = "";
        this.updateGrid();
        grid.resetRotation();
        this.pgn = "";
        setup.updateText("pgn", "");
        this.moveNumber = 1;
        this.boards = [copyObj(this.board)];
        if (t == "0player") {
            var self = this;
            f = function() {
                aiMove(self, self.turn, 2);
                self.updateGrid();
                self.switchTurn();
                self.updateGameStatus();
                if (!self.gameOver) {
                    setTimeout(f, 10)
                } else {
                    gv.message(self.gameOverStatus);
                }
            }
            f();
        } else if (t == "1playerBlack") {
            if (gv.get("flipBoard")) {
                grid.rotate(180);
            }
            aiMove(this, this.turn, 2);
            this.updateGrid();
            this.switchTurn();
        }
    }
    
    this.switchTurn = function() {
        if (this.turn == white) {
            this.turn = black;
            gv.message("Black's turn");
        } else {
            this.turn = white;
            gv.message("White's turn");
            this.moveNumber += 1;
        }
        setup.updateText("pgn", this.pgn);
    }

    this.updateGameStatus = function() { //do later: Draw by repeated position, ugh
        var totalMovesBlack = 0;
        var totalMovesWhite = 0;
        var moves;

        //Check for material draw
        var mSum = getMaterial(this, white) + getMaterial(this, black);
        if (mSum == 0 || mSum == 3.5) {
            this.gameOver = true;
            this.gameOverStatus = "Draw by insufficient material";
            this.pgn += "1/2-1/2";
            setup.updateText("pgn", this.pgn);
            return;
        }

        for (var i = 0; i < 8; i++) {
            for (var k = 0; k < 8; k++) {
                if (inArr(white, this.board[i][k])) {
                    moves = legalMoves(this, i, k, true);
                    totalMovesWhite += moves.length;
                } else if (inArr(black, this.board[i][k])) {
                    moves = legalMoves(this, i, k, true);
                    totalMovesBlack += moves.length;
                }
            }
        }
        if (this.turn == black && totalMovesBlack == 0) {
            this.gameOver = true;
            if (isCheck(this, black, [], [], true)) {
                this.gameOverStatus = "White wins by checkmate";
                this.pgn += "1-0";
            } else {
                this.gameOverStatus = "Stalemate";
                this.pgn += "1/2-1/2";
            }
        } else if (this.turn == white && totalMovesWhite == 0) {
            this.gameOver = true;
            if (isCheck(this, white, [], [], true)) {
                this.gameOverStatus = "Black wins by checkmate";
                this.pgn += "0-1";
            } else {
                this.gameOverStatus = "Stalemate";
                this.pgn += "1/2-1/2";
            }
        }
        setup.updateText("pgn", this.pgn);
    }

    this.updateGrid = function() {
        var self = this;
        grid.foreach(function(sprite) {
            sprite.box.drawAttrs.fillColor = sprite.gridColor;
            if (self.board[sprite.row][sprite.col] == EMPTY) {
                sprite.box.drawAttrs.image = false;
                sprite.box.text = EMPTY;
                sprite.box2.inactive = !gv.get("showCoords");
            } else {    
                sprite.box2.inactive = true;
                sprite.box.drawAttrs.image = true;
                var oldImageSrc = sprite.box.drawAttrs.imageSrc;
                sprite.box.drawAttrs.imageSrc = imagesPath + "/" + self.board[sprite.row][sprite.col] + ".png";
                if (oldImageSrc != sprite.box.drawAttrs.imageSrc) {
                    sprite.box.refreshImage();
                }
                
            }
        });
    }
    
    this.move = function(l1, l2) { 
        if (this.turn == white) {
            this.pgn += this.moveNumber + ". ";
        }

        var piece = this.board[l1[0]][l1[1]];
        if (piece == "wP" && l2[0] == 0) {
            piece = "wQ";
        }
        if (piece == "bP" && l2[0] == 7) {
            piece = "bQ";
        }

        this.board[l1[0]][l1[1]] = EMPTY; //remove from current location
        if (piece.charAt(1) == "P") {
            if (this.board[l2[0]][l2[1]] != EMPTY) {
                this.pgn += letters[l1[1]] + "x";
            }
        } else {
            this.pgn += piece.charAt(1);
        }

        //en passant
        if (piece == "wP" && l1[1] != l2[1]) {
            if (this.board[l2[0]][l2[1]] == EMPTY) {
                this.board[l2[0]+1][l2[1]] = EMPTY;
                this.pgn += letters[l1[1]] + "x";
            }
        } else if (piece == "bP" && l1[1] != l2[1]) {
            if (this.board[l2[0]][l2[1]] == EMPTY) {
                this.board[l2[0]-1][l2[1]] = EMPTY;
                this.pgn += letters[l1[1]] + "x";
            }
        } else {
            var oldCellValue = this.board[l2[0]][l2[1]];
            if (inArr(black, oldCellValue)) {
                //Took a black piece
                this.pgn += "x";
            } else if (inArr(white, oldCellValue)) {
                //Took a white piece
                this.pgn += "x";
            }
        }

        this.board[l2[0]][l2[1]] = piece; //place at new location
        this.pgn += letters[l2[1]] + (8 - l2[0]) + " "; 

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

function aiMove(g, turn, depth) {
    //Make an AI move
    //Before AI though make more game metadata id. count turns
    //    and make sure legalMoves is optimized
    var m = getAIMove(g, turn, depth);
    g.move(m[0], m[1]);
}

var pieceValueLookup = {
    "wP": 1,
    "wN": 3.5,
    "wB": 3.5,
    "wR": 5,
    "wQ": 9,
    "bP": 1,
    "bN": 3.5,
    "bB": 3.5,
    "bR": 5,
    "bQ": 9,
    "bK": 0,
    "wK": 0
}

function handleClick(g, r, c) {
    if (!g.gameOver) {
        grid.foreach(function(sprite) {
            sprite.box.drawAttrs.fillColor = sprite.gridColor;
        }); //Clear all added colors

        //Possiblities: 
        //1. Our turn and a friendly piece -- color possible moves as well -- set active Piece -- Remove all statuses -- Add statuses
        //2. Our turn and clicking on a possible move
        var cell = grid.get(r, c);
        var piece = g.board[r][c];
        var turn = g.turn;
        var gameType = gv.get("gameType");
        if (inArr(turn, piece) && (((turn == white && gameType == "1playerWhite") || (turn == black && gameType == "1playerBlack")) || gameType == "2player")) {
            //Case 1 ^
            if (g.active != null && (g.active[0] == r && g.active[1] == c)) {
                //Clicked on already active spot
                g.active = null;
                g.potentialMoves = [];
                grid.foreach(function(sprite) {
                    sprite.box.drawAttrs.fillColor = sprite.gridColor;
                });
            } else {
                cell.box.drawAttrs.fillColor = colorScheme.active;
                var pm = legalMoves(g, r, c, true);
                g.potentialMoves = pm;
                g.active = [r, c];
                for (var i = 0; i < pm.length; i++) { 
                    //Color in potential moves
                    grid.get(pm[i][0], pm[i][1]).box.drawAttrs.fillColor = colorScheme.move;
                }
            }
        } else if (pairIn(g.potentialMoves, r, c)) {
            //case 2 ^
            g.move(g.active, [r, c]);
            //interfacing
            g.active = null; 
            g.potentialMoves = [];
            g.updateGrid();
            g.switchTurn();
            g.updateGameStatus();
            if (g.gameOver) {
                gv.message(g.gameOverStatus);
            } else {
                if (gameType == "2player" && gv.get("flipBoard")) {
                    grid.rotate(180);
                    g.updateGrid();
                } else if (gameType == "1playerWhite" || gameType == "1playerBlack") {
                    aiMove(g, g.turn, 2);
                    g.updateGrid();
                    g.switchTurn();
                    g.updateGameStatus();
                    if (g.gameOver) {
                        gv.message(g.gameOverStatus);
                    }
                }
            }
        } 
    }
}

function getMaterial(g, side) {
    var result = 0;
    var p;
    for (var i = 0; i < 8; i++) {
        for (var k = 0; k < 8; k++) {
            p = g.board[i][k];
            if (inArr(side, p)) {
                result += pieceValueLookup[p];
            }
        }
    }
    return result;
}

function getAIMove(g, turn, depth) {
    if (depth == 0) {
        var result = [];
        var moves;
        for (var i = 0; i < 8; i++) {
            for (var k = 0; k < 8; k++) {
                if (inArr(turn, g.board[i][k])) {
                    moves = legalMoves(g, i, k, true);
                    for (var m = 0; m < moves.length; m++) {
                        result.push([
                            [i, k],
                            moves[m]
                        ]);
                    }
                } 
            }
        }
        return choice(result);
    } if (depth == 1) {
        var minEnemy = getMaterial(g, opponent(turn));
        var result = getAIMove(g, turn, 0);
        var moves, gCopy, mat;
        for (var i = 0; i < 8; i++) {
            for (var k = 0; k < 8; k++) {
                if (inArr(turn, g.board[i][k])) {
                    moves = legalMoves(g, i, k, true);
                    for (var m = 0; m < moves.length; m++) {
                        gcopy = copyObj(g);
                        gcopy.move([i, k], moves[m]);
                        mat = getMaterial(gcopy, opponent(turn));
                        if (mat < minEnemy) {
                            minEnemy = mat;
                            result = [
                                [i, k],
                                moves[m]
                            ];
                        }
                    }
                } 
            }
        }
        return result;
    } if (depth == 2) {
        //game roll back to optimize memory performance instead of creating a new copy everytime
        var maxDelta = -1000;
        var result = getAIMove(g, turn, 0);
        var moves, gCopy, delta, h;
        for (var i = 0; i < 8; i++) {
            for (var k = 0; k < 8; k++) {
                if (inArr(turn, g.board[i][k])) {
                    moves = legalMoves(g, i, k, true);
                    for (var m = 0; m < moves.length; m++) {
                        gcopy = copyObj(g);
                        gcopy.move([i, k], moves[m]);

                        //aiMove(gCopy, opponent(turn), 1);
                        h = getAIMove(gcopy, opponent(turn), 1);
                        gcopy.move(h[0], h[1]);

                        delta = getMaterial(gcopy, turn) - getMaterial(gcopy, opponent(turn));
                        if (delta > maxDelta) {
                            maxDelta = delta;
                            result = [
                                [i, k],
                                moves[m]
                            ];
                        }
                    }
                } 
            }
        }
        print(maxDelta)
        return result;
    }
    return [[], []]
}

function isCheck(g, side, l1, l2, pass) {
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
    if (!pass) {
        gg.move(l1, l2);
    }
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
                if (r == 4) {
                    if (Math.abs(g.lastMove[0][1]-c) == 1 && g.lastMove[0][1] == g.lastMove[1][1]) {
                        if ((g.lastMove[1][0] == 4 && g.lastMove[0][0] == 6) && board[g.lastMove[1][0]][g.lastMove[1][1]] == "wP") {
                            result.push([r+1, g.lastMove[0][1]]);
                        }
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
                if ((r+dy <= 7 && r+dy >= 0) && (c+dx <= 7 && c+dx >= 0)) {
                    if (!inArr(friendlies, board[r+dy][c+dx])) {
                        if (inArr(enemies, board[r+dy][c+dx]) || board[r+dy][c+dx] == EMPTY) {
                            result.push([r+dy, c+dx]);
                        }
                    }
                }
            }
            //king cannot pass thru check or CASTLE OUT OF CHECK
            //Can only do once, and if either piece has moved, then cannot
            if (check && !isCheck(g, friendlies, [], [], true)) {
                if (((piece == "wK" && !g.whiteCastled) && (c == 4 && r == 7)) || ((piece == "bK" && !g.blackCastled) && (c == 4 && r == 0))) {
                    if (((piece == "wK" && g.whiteCanCastleKs) && board[7][7] == "wR") || ((piece == "bK" && g.blackCanCastleKs) && board[0][7] == "bR")){
                        if (board[r][c+1] == EMPTY && board[r][c+2] == EMPTY) {
                            if (!isCheck(g, friendlies, [r, c], [r, c+1], false)) {
                                result.push([r, c+2]);
                            }
                        } 
                    } 
                    if (((piece == "wK" && g.whiteCanCastleQs) && board[7][0] == "wR") || ((piece == "bK" && g.blackCanCastleQs) && board[0][0] == "bR")){
                        if ((board[r][c-1] == EMPTY && board[r][c-2] == EMPTY) && board[r][c-3] == EMPTY) {
                            if (!isCheck(g, friendlies, [r, c], [r, c-1], false) && !isCheck(g, friendlies, [r, c], [r, c-2], false)) {
                                result.push([r, c-2]);
                            }
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
            if (!isCheck(g, friendlies, t, result[i], false)) {
                finalResult.push(result[i]);
            }
        }
    } else {
        return result;
    }
    return finalResult;
}

var game = new Game();

//Populate and checker the grid
grid.foreach(function(sprite) {
    sprite.box.drawAttrs.fill = true;
    sprite.box.drawAttrs.border = false;
    sprite.box.drawAttrs.imageResize = true;
    sprite.box.drawAttrs.imageWidth = grid.getCellWidth();
    sprite.box.drawAttrs.imageHeight = grid.getCellHeight();
    if (sprite.row % 2 == sprite.col % 2) {
        sprite.gridColor = colorScheme.whiteCell
        sprite.box.drawAttrs.fillColor = colorScheme.whiteCell;
    } else  {
        sprite.gridColor = colorScheme.blackCell
        sprite.box.drawAttrs.fillColor = colorScheme.blackCell;
    }    

    sprite.bind("click", function(self) {
        if (self.box.pointInside([gv.mouseX, gv.mouseY])) {
            handleClick(game, self.row, self.col);
        }
    })
    //Add box w/ relative positioning for coordinate
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
    sprite.box2.inactive = true;
})

//Create some option input
setup.createOptions({
    "flipBoard": {
        "type": "boolean",
        "title": "Flip Board"
    },
    "showCoords": {
        "type": "boolean",
        "title": "Show algebraic coords",
        "default": false
    },
    "drawBorder": {
        "type": "boolean",
        "title": "Draw Borders",
        "default": false
    },
    "pieceStyle": {
        "type": "options",
        "title": "Piece Style",
        "options": {
            "merida": "Merida",
            "alpha": "Alpha",
            "ugly": "Hand-drawn",
            "ugly2": "Ugly",
        },
        "default": "Merida"
    },
    "gameType": {
        "type": "options",
        "title": "",
        "options": {
            "1playerWhite": "1 Player | Play as White",
            "1playerBlack": "1 Player | Play as Black",
            "2player": "2 Players",
            "0player": "No players"
        },
        "default": "2player"
    }
});

draw.overdraw = function() {}; // override defualt grid behavior on startup

setup.createButton("new game", function(e) {
    game.init(gv.get("gameType"));
})

setup.createText("pgn", game.pgn);

gv.bindInputChange(function(){
    if (gv.get("drawBorder")) {
        draw.overdraw = grid.draw;
    } else {
        draw.overdraw = function() {};
    }
    imagesPath = paths[gv.get("pieceStyle")];
    game.updateGrid();
})

game.init("2player");
