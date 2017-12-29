setup.init("Reversi (Othello)");
setup.setDimensions(600, 600);
setup.border();

grid.init(8, 8);

function copyObj(arr) {
    return $.extend(true, {}, arr);
}

var imagesPath = "Examples/reversi/images";

var EMPTY = "";
var BLACK = "b";
var WHITE = "w";
function oppoSide(s) {
    if (s == BLACK) {
        return WHITE;
    } 
    return BLACK;
}

var startingBoard = [
    [EMPTY, EMPTY,  EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],

    [EMPTY, EMPTY,  EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],

    [EMPTY, EMPTY,  EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],

    [EMPTY, EMPTY,  EMPTY, WHITE, BLACK, EMPTY, EMPTY, EMPTY],
    
    [EMPTY, EMPTY,  EMPTY, BLACK, WHITE, EMPTY, EMPTY, EMPTY],
    
    [EMPTY, EMPTY,  EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    
    [EMPTY, EMPTY,  EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],

    [EMPTY, EMPTY,  EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
];

function Game() {
    this.board = copyObj(startingBoard);
    this.currentMoves = [];
    this.turn = WHITE;

    this.switchTurn = function() {
        this.turn = oppoSide(this.turn);
        this.currentMoves = legalMoves(this.board, this.turn);
    }

    this.init = function() {
        this.board = copyObj(startingBoard)
        this.updateGrid();
        this.turn = WHITE;
        this.currentMoves = legalMoves(this.board, this.turn);
    }

    this.handleClick = function(row, col) {
        if (pairIn(this.currentMoves, row, col)) {
            this.board = move(this.board, this.turn, [row, col]);
            this.switchTurn();
            this.updateGrid();
        }
    }

    this.updateGrid = function() {
        var self = this;
        grid.foreach(function(sprite) {
            if (self.board[sprite.row][sprite.col] == EMPTY) {
                sprite.attrs["isOccupied"] = false;
                sprite.box.drawAttrs.image = false;
            } else {    
                sprite.attrs["isOccupied"] = true;
                sprite.box.drawAttrs.image = true;
                sprite.box.drawAttrs.imageSrc = imagesPath + "/" + self.board[sprite.row][sprite.col] + ".png";
                sprite.box.refreshImage();
            }
        });
    }
}

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

var walks = [
    [1, 0], //Right
    [-1, 0], //Left
    [0, 1], //Down
    [0, -1], //Up
    [1, 1], //Northeast
    [-1, 1], //Northwest
    [1, -1], //Southeast
    [-1, -1], //Southwest
]; //length = 8


function move(b, turn, l) {
    var board = copyObj(b);
    var row = l[0];
    var col = l[1];
    var enemy = oppoSide(turn);
    var walk, dx, dy, x, y, flips;
    board[row][col] = turn;
    for (var w = 0; w < 8; w++) {
        walk = walks[w];
        dx = walk[0];
        dy = walk[1];
        x = row+dx;
        y = col+dy;
        flips = [];
        if ((x <= 7 && x >= 0) && (y <= 7 && y >= 0)) {
            if (board[x][y] == enemy) {
                flips.push([x, y]);
                while (true) {
                    x += dx;
                    y += dy;
                    if ((x <= 7 && x >= 0) && (y <= 7 && y >= 0)) {
                        if (board[x][y] == enemy) {
                            flips.push([x, y]);
                        } else if (board[x][y] == turn) {
                            for (var i = flips.length - 1; i >= 0; i--) {
                                board[flips[i][0]][flips[i][1]] = oppoSide(board[flips[i][0]][flips[i][1]]);
                            }
                            break;
                        } else if (board[x][y] == EMPTY) {
                            break;
                        } 
                    } else {
                        break;
                    }
                }
            }
        }
    }
    return board;
}


function legalMoves(board, side) {
    //Return a list of pairs which represent legal moves for the side
    var enemy = oppoSide(side);
    var result = [];
    var walk, dx, dy, x, y;
    for (var i = 0; i < 8; i++) {
        for (var k = 0; k < 8; k++) {
            if (board[i][k] == EMPTY) {
                for (var w = 0; w < 8; w++) {
                    walk = walks[w];
                    dx = walk[0];
                    dy = walk[1];
                    x = i+dx;
                    y = k+dy;
                    if ((x <= 7 && x >= 0) && (y <= 7 && y >= 0)) {
                        if (board[x][y] == enemy) {
                            while (true) {
                                x += dx;
                                y += dy;
                                if ((x <= 7 && x >= 0) && (y <= 7 && y >= 0)) {
                                    if (board[x][y] == side) {
                                        result.push([i, k]);
                                        break;
                                    } else if (board[x][y] == EMPTY) {
                                        break;
                                    } 
                                } else {
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    return result;
}

grid.foreach(function(sprite) {
    sprite.attrs["isOccupied"] = false;
    sprite.box.drawAttrs.fill = true;
    sprite.box.drawAttrs.fillColor = "darkgreen";
    sprite.bind("click", function(self) {
        if (self.box.pointInside([gv.mouseX, gv.mouseY])) {
            game.handleClick(self.row, self.col);
        }
    });
    sprite.bind("mouseMove", function(self) {
        if (!self.attrs["isOccupied"]) {
            self.box.drawAttrs.image = false;
        }
        if (self.box.pointInside([gv.mouseX, gv.mouseY])) {
            if (!self.attrs["isOccupied"]) {
                self.box.drawAttrs.fillColor = "green";
                if (!pairIn(game.currentMoves, self.row, self.col)) {
                    self.box.drawAttrs.image = false;
                } else {    
                    self.box.drawAttrs.image = true;
                    self.box.drawAttrs.imageSrc = imagesPath + "/" + game.turn + ".png";
                    self.box.refreshImage();
                }
            }
        } else {
            self.box.drawAttrs.fillColor = "darkgreen";
        }
    })
});

game = new Game();
game.init();

setup.createOptions({
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
    },
});

setup.createButton("new game", function(e) {
    game.init();
})
