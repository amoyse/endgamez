
function colAndRowFromId(id) {
    let [letter, number] = id.split("");
    let col = parseInt(letter.charCodeAt(0)) - 96;
    let row = parseInt(number);
    return [col, row];
}


class Board {
    constructor(chessboard) {
        this.highlightedPiece = "";
        this.chessboard = chessboard;
        this.boardDiv = document.getElementById("chessboard");
        this.highlightedSquares = [];
    }

    draw() {
        for (let i = 0; i < this.chessboard.length; i++) {
            let row = this.chessboard[i];
            for (let j = 0; j < row.length; j++) {
                let colLetter = String.fromCharCode(j + 97);
                let coordinates = colLetter + String(8 - i);
                document.getElementById(coordinates).innerHTML = row[j].pieceCode;
                if (row[j].pieceCode != ''){
                    document.getElementById(coordinates).style.cursor = "pointer";
                }
                
            }
        }
    }

    pieceAtId(id) {
        let [col, row] = colAndRowFromId(id);
        
        return this.pieceAt(row, col);
    }

    pieceAt(row, col) {
        return this.chessboard[8 - row][col - 1];
    }

    setPieceAtId(id, value) {
        let [col, row] = colAndRowFromId(id);

        this.setPieceAt(row, col, value);
    }

    setPieceAt(row, col, value) {
        this.chessboard[8 - row][col - 1] = value;
    }


    selectPiece(div) {
        let id = div.id;
        let [col, row] = colAndRowFromId(id);
        let arrRow = 8 - row;
        let position = this.chessboard[arrRow][col - 1];
        
        if (this.highlightedPiece == "") {
            if (position.pieceCode != '') {
                if (document.getElementsByClassName("selected")[0] !== undefined) {
                    this.unSelectSquare(document.getElementsByClassName("selected")[0]);
                }
                this.selectSquare(div, id, true);
                this.highlightedSquares = this.highlightAvailableSquares(id, position);
            }
        } else {
            if (position.pieceCode != '') {
                if (div.id == this.highlightedPiece) {
                    this.unSelectSquare(div, col, row);
                    this.unHighlightAvailableSquares(this.highlightedSquares);
                    
                } else {
                    let highlightedDiv = document.getElementById(this.highlightedPiece);
                    this.unSelectSquare(highlightedDiv);
                    this.unHighlightAvailableSquares(this.highlightedSquares);
                    this.selectSquare(div, id, true);
                    this.highlightedSquares = this.highlightAvailableSquares(id, position);
                }
            } else {
                if (div.lastChild) {
                    this.unHighlightAvailableSquares(this.highlightedSquares);
                    this.movePiece(div);
                }
            } 
        }
    }

    selectSquare(div, id, clicked=false) {
        div.className = "selected";
        if (clicked) {
            this.highlightedPiece = id;
        }
        
    }

    highlightSquare(div) {
        let element = document.createElement("span");
        element.className = "highlighted";
        element.id = "dot";
        div.appendChild(element);
    }

    unSelectSquare(highlightedDiv) { 
        let [col, row] = colAndRowFromId(highlightedDiv.id);
        if ((col % 2 == 1 && row % 2 == 0) || (col % 2 == 0 && row % 2 == 1)) {
            highlightedDiv.className = "white1";
        } else {
            highlightedDiv.className = "black2";
        }
        this.highlightedPiece = "";
    }

    unHighlightSquare(highlightedDiv) {
        highlightedDiv.removeChild(highlightedDiv.lastChild);
        
    }

    highlightAvailableSquares(id, position) {
        let squares = position.getSquares(id);
        if (this.pieceAtId(id).piece == "whitePawn" || this.pieceAtId(id).piece == "blackPawn") {
            for (let i = 0; i < squares.length; i++) {
                let [col, row] = squares[i];
    
                let colLetter = String.fromCharCode(col + 96);
                let coordinates = colLetter + String(row);
                let div = document.getElementById(coordinates);
                if (col)
                if (this.pieceAt(row, col).pieceCode == "") {
                    this.highlightSquare(div);
                } else {
                    squares.splice(i, 1);
                }
            }
        } else {
            for (let i = 0; i < squares.length; i++) {
                let [col, row] = squares[i];
    
                let colLetter = String.fromCharCode(col + 96);
                let coordinates = colLetter + String(row);
                let div = document.getElementById(coordinates);
                if (this.pieceAt(row, col).pieceCode == "") {
                    this.highlightSquare(div);
                } else {
                    squares.splice(i, 1);
                }
            }
        }
        
        return squares;
    }

    unHighlightAvailableSquares(squares) {
        for (let i = 0; i < squares.length; i++) {
            let [col, row] = squares[i];

            let colLetter = String.fromCharCode(col + 96);
            let coordinates = colLetter + String(row);
            let div = document.getElementById(coordinates);
            this.unHighlightSquare(div);
        }
    }

    movePiece(div) {
        let id = div.id;
        let [col, row] = colAndRowFromId(id);

        for (let i = 0; i < this.highlightedSquares.length; i++) {
            if (col == this.highlightedSquares[i][0] && row == this.highlightedSquares[i][1]) {
                
                let piece = this.pieceAtId(this.highlightedPiece);
                this.setPieceAtId(id, piece);

                this.setPieceAtId(this.highlightedPiece, new Blank());

                this.draw();

                this.highlightedPiece = "";
                
            }
        }

        // if (this.pieceAtId(this.highlightedPiece).piece == "pawn")
        
    }

    makeTakeable(div) {
        div.className += "takeable";
    }
}

class Blank {
    constructor() {
        this.pieceCode = '';
    }

    getPieceName(id) {

    }
}



class Piece {
     constructor(colour, pieceCode, piece) {
         this.pieceCode = pieceCode;
         this.colour = colour;
         this.piece = piece
     }

     getSquares(id) {
        return "blank"
     }


}

class Pawn extends Piece {
    constructor(colour, pieceCode, piece, offFirstRow=true) {
        super(colour, pieceCode, piece)
        this.offFirstRow = offFirstRow;
        this.piece = piece;
    }

    getSquares(id) {
        let squares = [];
        let [col, row] = colAndRowFromId(id);
        if (this.colour == "black") {
            squares.push([col, row - 1]);
            if (row == 7) {
                squares.push([col, row - 2]);
            }
            squares.push([col - 1, row -  1]);
            squares.push([col + 1, row -  1]);
        } else {
            squares.push([col, row + 1]);
            if (row == 2) {
                squares.push([col, row + 2]);
            }
            squares.push([col - 1, row + 1]);
            squares.push([col + 1, row + 1]);
        }
        console.log(squares);
        return squares;
    }


}

class Rook extends Piece {
    constructor(colour, pieceCode, piece) {
        super(colour, pieceCode, piece)
    }

    getSquares(id) {
        let squares = [];
        let [col, row] = colAndRowFromId(id);



    }

}

class Knight extends Piece {
    constructor(colour, pieceCode, piece) {
        super(colour, pieceCode, piece)
    }

    getSquares(id) {
        let squares = [];
        let [col, row] = colAndRowFromId(id);



    }

}

class Bishop extends Piece {
    constructor(colour, pieceCode, piece) {
        super(colour, pieceCode)
    }

    getSquares(id) {
        let squares = [];
        let [col, row] = colAndRowFromId(id);



    }

}

class Queen extends Piece {
    constructor(colour, pieceCode, piece) {
        super(colour, pieceCode, piece)
    }

    getSquares(id) {
        let squares = [];
        let [col, row] = colAndRowFromId(id);



    }

}

class King extends Piece {
    constructor(colour, pieceCode, piece) {
        super(colour, pieceCode)
    }

    getSquares(id) {
        let squares = [];
        let [col, row] = colAndRowFromId(id);



    }

}


// let codeDict = {
//     "R": '&#9820;', 
//     "N": '&#9822;', 
//     "B": '&#9821;', 
//     "Q": '&#9819;', 
//     "K": '&#9818;',
//     "P": '&#9823;',

//     "r": '&#9814;', 
//     "n": '&#9816;', 
//     "b": '&#9815;', 
//     "q": '&#9813;', 
//     "k": '&#9812;',
//     "p": '&#9817;',

//     '': ''
// }

const blackRookUni = '&#9820;';
const blackKnightUni = '&#9822;';
const blackBishopUni = '&#9821;';
const blackQueenUni = '&#9819;';
const blackKingUni = '&#9818;';
const blackPawnUni = '&#9823;';

const whiteRookUni = '&#9814;';
const whiteKnightUni = '&#9816;';
const whiteBishopUni = '&#9815;';
const whiteQueenUni = '&#9813;';
const whiteKingUni = '&#9812;';
const whitePawnUni = '&#9817;';


// BLACK PIECES
const blackPawn1 = new Pawn("black", blackPawnUni, "blackPawn");
const blackPawn2 = new Pawn("black", blackPawnUni, "blackPawn");
const blackPawn3 = new Pawn("black", blackPawnUni, "blackPawn");
const blackPawn4 = new Pawn("black", blackPawnUni, "blackPawn");
const blackPawn5 = new Pawn("black", blackPawnUni, "blackPawn");
const blackPawn6 = new Pawn("black", blackPawnUni, "blackPawn");
const blackPawn7 = new Pawn("black", blackPawnUni, "blackPawn");
const blackPawn8 = new Pawn("black", blackPawnUni, "blackPawn");

const blackRook1 = new Rook("black", blackRookUni);
const blackRook2 = new Rook("black", blackRookUni);

const blackKnight1 = new Knight("black", blackKnightUni);
const blackKnight2 = new Knight("black", blackKnightUni);

const blackBishop1 = new Bishop("black", blackBishopUni);
const blackBishop2 = new Bishop("black", blackBishopUni);

const blackQueen = new Queen("black", blackQueenUni);
const blackKing = new King("black", blackKingUni);


// WHITE PIECES
const whitePawn1 = new Pawn("white", whitePawnUni, "whitePawn");
const whitePawn2 = new Pawn("white", whitePawnUni, "whitePawn");
const whitePawn3 = new Pawn("white", whitePawnUni, "whitePawn");
const whitePawn4 = new Pawn("white", whitePawnUni, "whitePawn");
const whitePawn5 = new Pawn("white", whitePawnUni, "whitePawn");
const whitePawn6 = new Pawn("white", whitePawnUni, "whitePawn");
const whitePawn7 = new Pawn("white", whitePawnUni, "whitePawn");
const whitePawn8 = new Pawn("white", whitePawnUni, "whitePawn");

const whiteRook1 = new Rook("white", whiteRookUni);
const whiteRook2 = new Rook("white", whiteRookUni);

const whiteKnight1 = new Knight("white", whiteKnightUni);
const whiteKnight2 = new Knight("white", whiteKnightUni);

const whiteBishop1 = new Bishop("white", whiteBishopUni);
const whiteBishop2 = new Bishop("white", whiteBishopUni);

const whiteQueen = new Queen("white", whiteQueenUni);
const whiteKing = new King("white", whiteKingUni);


const blank = new Blank();


let chessboard = [[blackRook1, blackKnight1, blackBishop1, blackQueen, blackKing, blackBishop2, blackKnight2, blackRook2], 
                  [blackPawn1, blackPawn2, blackPawn3, blackPawn4, blackPawn5, blackPawn6, blackPawn7, blackPawn8], 
                  [blank, blank ,blank, blank, blank, blank, blank, blank],
                  [blank, blank ,blank, blank, blank, blank, blank, blank],
                  [blank, blank ,blank, blank, blank, blank, blank, blank],
                  [blank, blank ,blank, blank, blank, blank, blank, blank],
                  [whitePawn1, whitePawn2, whitePawn3, whitePawn4, whitePawn5, whitePawn6, whitePawn7, whitePawn8],
                  [whiteRook1, whiteKnight1, whiteBishop1, whiteQueen, whiteKing, whiteBishop2, whiteKnight2, whiteRook2] ];




const board = new Board(chessboard);
board.draw()


