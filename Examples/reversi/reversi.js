setup.init("Reversi (Othello)");
setup.setDimensions(600, 600);
setup.background("green");
setup.border();

grid.init(8, 8);

function copyObj(arr) {
    return $.extend(true, {}, arr);
}

var imagesPath = "Examples/reversi/images";

var EMPTY = "";
var BLACK = "b";
var WHITE = "w";

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

    this.init = function() {
        this.board = copyObj(startingBoard)
        this.updateGrid();
    }
    
    this.updateGrid = function() {
        var self = this;
        grid.foreach(function(sprite) {
            if (self.board[sprite.row][sprite.col] == EMPTY) {
                sprite.box.drawAttrs.image = false;
                sprite.box.text = EMPTY;
            } else {    
                sprite.box.drawAttrs.image = true;
                sprite.box.drawAttrs.imageSrc = imagesPath + "/" + self.board[sprite.row][sprite.col] + ".png";
                sprite.box.refreshImage();
            }
        });
    }
}

game = new Game();
game.init();

grid.foreach(function(sprite) {
    sprite.bind("click", function(self) {
        if (self.box.pointInside([gv.mouseX, gv.mouseY])) {
            //handle click
        }
    });
    sprite.bind("mouseover", function(self) {
        if (self.box.pointInside([gv.mouseX, gv.mouseY])) {
            //handle click
        }
    })
});


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

})
