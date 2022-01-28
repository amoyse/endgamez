
function colAndRowFromId(id) {
    let [letter, number] = id.split("");
    let col = parseInt(letter.charCodeAt(0)) - 96;
    let row = parseInt(number);
    return [col, row]
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

    // clickSquare(div) {
    //     let id = div.id;
    //     if (this.highlightedPiece == "")
    // }

    selectPiece(div) {
        let id = div.id;
        let [col, row] = colAndRowFromId(id);
        let arrRow = 8 - row;
        let position = this.chessboard[arrRow][col - 1];
        
        if (this.highlightedPiece == "") {
            if (position.pieceCode != '') {
                this.selectSquare(div, id, true);
                this.highlightedSquares = this.highlightAvailableSquares(id, position);
            }
        } else {
            if (position.pieceCode != '') {
                if (div.id == this.highlightedPiece) {
                    this.unSelectSquare(div, col, row)
                    this.unHighlightAvailableSquares(this.highlightedSquares)
                } else {
                    let [col2, row2] = colAndRowFromId(this.highlightedPiece);
                    let highlightedDiv = document.getElementById(this.highlightedPiece);
                    this.unSelectSquare(highlightedDiv, col2, row2)
                    this.unHighlightAvailableSquares(this.highlightedSquares)
                    this.selectSquare(div, id, true);
                    this.highlightedSquares = this.highlightAvailableSquares(id, position);
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
        div.appendChild(element);
    }

    unSelectSquare(highlightedDiv, col, row) {
        if ((col % 2 == 1 && row % 2 == 0) || (col % 2 == 0 && row % 2 == 1)) {
            highlightedDiv.className = "white1";
        } else {
            highlightedDiv.className = "black2";
        }
        this.highlightedPiece = "";
    }

    unHighlightSquare(highlightedDiv) {
        highlightedDiv.innerHTML = "";
        // if ((col % 2 == 1 && row % 2 == 0) || (col % 2 == 0 && row % 2 == 1)) {
        //     highlightedDiv.className = "white1";
        // } else {
        //     highlightedDiv.className = "black2";
        // }
    }

    highlightAvailableSquares(id, position) {
        let squares = position.getSquares(id);
        for (let i = 0; i < squares.length; i++) {
            let [col, row] = squares[i];

            let colLetter = String.fromCharCode(col + 96);
            let coordinates = colLetter + String(row);
            let div = document.getElementById(coordinates);
            this.highlightSquare(div);
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
}

class Blank {
    constructor() {
        this.pieceCode = '';
    }
}



class Piece {
     constructor(colour, pieceCode) {
         this.pieceCode = pieceCode;
         this.colour = colour;
     }

     getSquares(id) {

     }


}

class Pawn extends Piece {
    constructor(colour, pieceCode, offFirstRow=true) {
        super(colour, pieceCode)
        this.offFirstRow = offFirstRow;
    }

    getSquares(id) {
        let squares = [];
        let [col, row] = colAndRowFromId(id);
        if (this.colour == "black") {
            squares.push([col, row - 1]);
            if (this.offFirstRow) {
                squares.push([col, row - 2]);
            }
        } else {
            squares.push([col, row + 1]);
            if (this.offFirstRow) {
                squares.push([col, row + 2]);
            }
        }
        return squares;
        
        



    }

}

class Rook extends Piece {
    constructor(colour, pieceCode) {
        super(colour, pieceCode)
    }

    getSquares(id) {
        let squares = [];
        let [col, row] = colAndRowFromId(id);



    }

}

class Knight extends Piece {
    constructor(colour, pieceCode) {
        super(colour, pieceCode)
    }

    getSquares(id) {
        let squares = [];
        let [col, row] = colAndRowFromId(id);



    }

}

class Bishop extends Piece {
    constructor(colour, pieceCode) {
        super(colour, pieceCode)
    }

    getSquares(id) {
        let squares = [];
        let [col, row] = colAndRowFromId(id);



    }

}

class Queen extends Piece {
    constructor(colour, pieceCode) {
        super(colour, pieceCode)
    }

    getSquares(id) {
        let squares = [];
        let [col, row] = colAndRowFromId(id);



    }

}

class King extends Piece {
    constructor(colour, pieceCode) {
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
const blackPawn1 = new Pawn("black", blackPawnUni);
const blackPawn2 = new Pawn("black", blackPawnUni);
const blackPawn3 = new Pawn("black", blackPawnUni);
const blackPawn4 = new Pawn("black", blackPawnUni);
const blackPawn5 = new Pawn("black", blackPawnUni);
const blackPawn6 = new Pawn("black", blackPawnUni);
const blackPawn7 = new Pawn("black", blackPawnUni);
const blackPawn8 = new Pawn("black", blackPawnUni);

const blackRook1 = new Rook("black", blackRookUni);
const blackRook2 = new Rook("black", blackRookUni);

const blackKnight1 = new Knight("black", blackKnightUni);
const blackKnight2 = new Knight("black", blackKnightUni);

const blackBishop1 = new Bishop("black", blackBishopUni);
const blackBishop2 = new Bishop("black", blackBishopUni);

const blackQueen = new Queen("black", blackQueenUni);
const blackKing = new King("black", blackKingUni);


// WHITE PIECES
const whitePawn1 = new Pawn("white", whitePawnUni);
const whitePawn2 = new Pawn("white", whitePawnUni);
const whitePawn3 = new Pawn("white", whitePawnUni);
const whitePawn4 = new Pawn("white", whitePawnUni);
const whitePawn5 = new Pawn("white", whitePawnUni);
const whitePawn6 = new Pawn("white", whitePawnUni);
const whitePawn7 = new Pawn("white", whitePawnUni);
const whitePawn8 = new Pawn("white", whitePawnUni);

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















// function grabbable(chessboard) {
//     for (let i = 0; i < chessboard.length; i++) {
//         let row = chessboard[i];
//         for (let j = 0; j < row.length; j++) {
//             let colLetter = String.fromCharCode(j + 97);
//             let coordinates = colLetter + String(8 - i);
//             if (convertToUni(row[j]) != ''){
//                 document.getElementById(coordinates).style.cursor = "pointer";
//             }
//         }
//     }
// }

// grabbable(chessboard);