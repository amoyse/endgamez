const black = "black"
const white = "white";

const pawn = "pawn";
const rook = "rook";
const knight = "knight";
const bishop = "bishop";
const queen = "queen";
const king = "king";


let taken = [];
let turn = white;


function colAndRowFromId(id) {
    let [letter, number] = id.split("");
    let col = parseInt(letter.charCodeAt(0)) - 96;
    let row = parseInt(number);
    return [col, row];
}

function idFromColAndRow(col, row) {
    let colLetter = String.fromCharCode(col + 96);
    let id = colLetter + String(row);
    return id;
}

function removeSquares() {

}


class Board {
    constructor(chessboard) {
        this.highlightedPiece = "";
        this.chessboard = chessboard;
        this.boardDiv = document.getElementById("chessboard");
        this.highlightedSquares = [];
        this.takeableSquares = [];
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
                } else {
                    document.getElementById(coordinates).style.cursor = "default";  // because moving a piece left a trail which seems selectable
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
    
    checkIfInBoard(row, col){
        for (let i = 0; i < this.chessboard.length; i++) {
            let boardRow = this.chessboard[i];
            for (let j = 0; j < boardRow.length; j++) {
                if (8 - row == i && col - 1 == j) {
                    return true
                }
            }
        }
        return false
    }
    
    checkIfTakeable(id) {
        let [col, row] = colAndRowFromId(id);
        for (let i = 0; i < this.takeableSquares.length; i++) {
            let smallArray = this.takeableSquares[i];
            for (let j = 0; j < row; j++) {
                if (col == smallArray[0] && row == smallArray[1]) {
                    return true;
                }
            }
        }
        return false;
    }


    selectPiece(div) {
        let id = div.id;
        let [col, row] = colAndRowFromId(id);
        let position = this.pieceAtId(id)
        
        if ((position.colour == turn || position.colour == null) || (this.takeableSquares.length > 0 && this.checkIfTakeable(id))) {
            if (this.highlightedPiece == "") {
                if (position.pieceCode != '') {
                    if (document.getElementsByClassName("selected")[0] !== undefined) {
                        this.unSelectSquare(document.getElementsByClassName("selected")[0]);
                    }
                    
                    this.selectSquare(div, id, true);
                    this.highlightedSquares = this.highlightAvailableSquares(id);
                    
                }
            } else {
                if (position.pieceCode != '') { // ie you clicked on a piece, not an empty square
                    if (div.id == this.highlightedPiece) {
                        this.unSelectSquare(div, col, row);
                        this.unHighlightAvailableSquares(this.highlightedSquares);
                        if (this.takeableSquares.length != 0) {
                            this.makeUnTakeable();
                        }
                        
                    } else {
                        let highlightedDiv = document.getElementById(this.highlightedPiece);
                        
                        if (position.colour != this.pieceAtId(this.highlightedPiece).colour) { // if you clicked on an enemy piece -> take it!!
                            this.takePiece(id);
                            console.log(taken);
                            if (this.takeableSquares.length != 0) {
                                this.makeUnTakeable();
                            }
                            this.unHighlightAvailableSquares(this.highlightedSquares);
                            this.unSelectSquare(highlightedDiv);
                            
                        } else {
                            if (this.takeableSquares.length != 0) {
                                this.makeUnTakeable();
                            }
                            this.unHighlightAvailableSquares(this.highlightedSquares);
                            this.unSelectSquare(highlightedDiv);
                            this.selectSquare(div, id, true);

                            this.highlightedSquares = this.highlightAvailableSquares(id); 
                        }
                                       
                    }
                } else {
                    if (div.lastChild) {
                        this.unHighlightAvailableSquares(this.highlightedSquares);
                        if (this.takeableSquares.length != 0) {
                            this.makeUnTakeable();
                        }
                        this.movePiece(div);
                    }
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
        this.resetSquareColour(highlightedDiv)
        this.highlightedPiece = "";
    }

    resetSquareColour(div) {
        let [col, row] = colAndRowFromId(div.id);
        if ((col % 2 == 1 && row % 2 == 0) || (col % 2 == 0 && row % 2 == 1)) {
            div.className = "white1";
        } else {
            div.className = "black2";
        }
    }

    unHighlightSquare(highlightedDiv) {
        if (highlightedDiv.lastChild) {
            highlightedDiv.removeChild(highlightedDiv.lastChild);
        }
    }

    highlightAvailableSquares(id) {
        let highlighted = [];
        let piece = this.pieceAtId(id);
        let [takeable, highlight] = piece.getLegalSquares(this, id);
        if (highlight.length != 0) {
            for (let i = 0; i < highlight.length; i++) {
                let div = document.getElementById(highlight[i]);
                this.highlightSquare(div);
                highlighted.push(colAndRowFromId(highlight[i]));
            }
        }
        if (takeable.length != 0) {
            for (let i = 0; i < takeable.length; i++) {
                let div = document.getElementById(takeable[i]);
                this.makeTakeable(div);
            }
        }


        // if (piece instanceof Pawn && piece.isBlack)
        // if (this.pieceAtId(id).piece == "whitePawn" || this.pieceAtId(id).piece == "blackPawn") {
        //     for (let i = 0; i < squares.length; i++) {
        //         let legal = false
        //         let [col, row] = squares[i];
    
        //         let colLetter = String.fromCharCode(col + 96);
        //         let coordinates = colLetter + String(row);
        //         let div = document.getElementById(coordinates);
        //         if (col != selectedCol) {
        //             if (this.pieceAt(row, col).pieceCode != "") {
        //                 this.makeTakeable(div);
        //                 legal = true
        //             }
        //         } else {
        //             if (this.pieceAt(row, col).pieceCode == "") {
        //                 this.highlightSquare(div);
        //                 legal = true
        //             }
        //         }

        //         if (legal) {
        //             highlighted.push(squares[i])
        //         }
        //     }
        // } else {
        //     for (let i = 0; i < squares.length; i++) {
        //         let [col, row] = squares[i];
    
        //         let colLetter = String.fromCharCode(col + 96);
        //         let coordinates = colLetter + String(row);
        //         let div = document.getElementById(coordinates);
        //         if (this.pieceAt(row, col).pieceCode == "") {
        //             this.highlightSquare(div);
        //             highlighted.push(squares[i])
        //         }
        //     }
        // }

        

        return highlighted;
    }

    unHighlightAvailableSquares(squares) {
        for (let i = 0; i < squares.length; i++) {
            let [col, row] = squares[i];

            let coordinates = idFromColAndRow(col, row);
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
                
                if (turn == white) {
                    turn = black;
                } else {
                    turn = white;
                }
                
            }
        }        
    }

    makeTakeable(div) {
        div.className = "takeable";
        this.takeableSquares.push(colAndRowFromId(div.id));
    }

    makeUnTakeable() {
        for (let i = 0; i < this.takeableSquares.length; i++) {
            let [col, row] = this.takeableSquares[i];

            let colLetter = String.fromCharCode(col + 96);
            let coordinates = colLetter + String(row);
            let div = document.getElementById(coordinates);
            this.resetSquareColour(div);
        }
        this.takeableSquares = [];
        

    }
    
    takePiece(id) {
        let piece = this.pieceAtId(this.highlightedPiece);
        if (document.getElementById(id).className == "takeable") {
            let pieceToTake = this.pieceAtId(id);
            taken.push([pieceToTake.piece, pieceToTake.colour]); // it doesn't matter which knight (for example) the piece is, we just need to know where it is and what piece it is
            this.setPieceAtId(id, piece);
            this.setPieceAtId(this.highlightedPiece, new Blank());
            this.draw();
            this.highlightedPiece = "";
            
            if (turn == white) {
                turn = black;
            } else {
                turn = white;
            }
            
        }
    }

}

class Chessboard {
    constructor() {
        this.board = new Array(8)

        for (var i = 0; i < 8; i++) {
            board[i] = new Array(8)
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
}


class Blank {
    constructor() {
        this.pieceCode = '';
        this.colour = null
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

     isWhite() {

     }
}

class Pawn extends Piece {
    constructor(colour, pieceCode, piece, offFirstRow=true) {
        super(colour, pieceCode, piece)
        this.offFirstRow = offFirstRow;
        this.piece = piece;
    }

    // getCharacter() {
    //     if (this.colour == black) {
    //         return ""
    //     }
    // }

    getSquares(id) {
        let squares = [];
        let [col, row] = colAndRowFromId(id);
        if (this.colour == black) {
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
        return squares;
    }


    getLegalSquares(board, id) {
        let squares = this.getSquares(id);
        let takeable = [];
        let highlight = [];
        let [selectedCol, selectedRow] = colAndRowFromId(id);

        for (let i = 0; i < squares.length; i++) {
            let [col, row] = squares[i];
            if (board.checkIfInBoard(row, col)) {
                let coordinates = idFromColAndRow(col, row);
                let piece = board.pieceAt(row, col);
                if (col != selectedCol) {
                    if (piece.pieceCode != "" && piece.colour != this.colour) {
                        takeable.push(coordinates);
                    }
                } else {
                    if (piece.pieceCode == "") {
                        highlight.push(coordinates);
                    } else {
                        if (squares[i + 1]) { // stops pawns from hopping over pieces to go behind them when on first rank
                            if (this.colour == white) {
                                if (squares[i + 1][1] == row + 1) {
                                    squares.splice(i, 1);
                                }
                            } else {
                                if (squares[i + 1][1] == row - 1) {
                                    squares.splice(i, 1);
                                }
                            }
                            
                        }
                    }
                }   
                
            }

        }
        return [takeable, highlight];
    }
}


class Rook extends Piece {
    constructor(colour, pieceCode, piece) {
        super(colour, pieceCode, piece)
    }

    getSquares(id) {
        let squares = [];
        let [col, row] = colAndRowFromId(id);
        for (let i = 1; i < 8; i++) {
            squares.push([col + i, row]);
            squares.push([col - i, row]);
            squares.push([col, row + i]);
            squares.push([col, row - i]);
        }
        return squares
    }

    getLegalSquares(board, id) {
        let squares = this.getSquares(id);
        let takeable = [];
        let highlight = [];
        let [selectedCol, selectedRow] = colAndRowFromId(id);
        for (let i = 0; i < squares.length; i++) {
            let [col, row] = squares[i];
            if (board.checkIfInBoard(row, col)) {
                let coordinates = idFromColAndRow(col, row);
                let piece = board.pieceAt(row, col);
                if (piece.pieceCode != "" && piece.colour != this.colour) {
                    takeable.push(coordinates);
                    if (col > selectedCol) {
                        for (let j = 0; j < squares.length; j++) {
                            if (squares[j][0] > col) {
                                squares.splice(j, 1);
                            }
                        }
                    } else if (col < selectedCol) {
                        for (let j = 0; j < squares.length; j++) {
                            if (squares[j][0] < col) {
                                squares.splice(j, 1);
                            }
                        }
                    } else if (row > selectedRow) {
                        
                        for (let j = 0; j < squares.length; j++) {
                            if (squares[j][1] > row) {
                                squares.splice(j, 1);
                            }
                        }
                    } else if (row < selectedRow) {
                        for (let j = 0; j < squares.length; j++) {
                            if (squares[j][1] < row) {
                                squares.splice(j, 1);
                            }
                        }
                    }
                } else if (piece.pieceCode == "") {
                    highlight.push(coordinates);
                } else {
                    if (col > selectedCol) {
                        for (let j = 0; j < squares.length; j++) {
                            if (squares[j][0] > col) {
                                squares.splice(j, 1);
                            }
                        }
                    } else if (col < selectedCol) {
                        for (let j = 0; j < squares.length; j++) {
                            if (squares[j][0] < col) {
                                squares.splice(j, 1);
                            }
                        }
                    } else if (row > selectedRow) {
                        
                        for (let j = 0; j < squares.length; j++) {
                            if (squares[j][1] > row) {
                                squares.splice(j, 1);
                            }
                        }
                    } else if (row < selectedRow) {
                        for (let j = 0; j < squares.length; j++) {
                            if (squares[j][1] < row) {
                                squares.splice(j, 1);
                            }
                        }
                    }
                }
            }
        }

        return [takeable, highlight]
    }

}

class Knight extends Piece {
    constructor(colour, pieceCode, piece) {
        super(colour, pieceCode, piece)
    }

    getSquares(id) {
        let squares = [];
        let [col, row] = colAndRowFromId(id);
        squares.push([col - 2, row + 1])
        squares.push([col - 2, row - 1])
        squares.push([col - 1, row + 2])
        squares.push([col - 1, row - 2])
        squares.push([col + 2, row + 1])
        squares.push([col + 2, row - 1])
        squares.push([col + 1, row - 2])
        squares.push([col + 1, row + 2])
        return squares
    }

    getLegalSquares(board, id) {
        let squares = this.getSquares(id);
        let takeable = [];
        let highlight = [];
        for (let i = 0; i < squares.length; i++) {
            let [col, row] = squares[i];
            if (board.checkIfInBoard(row, col)) {
                let coordinates = idFromColAndRow(col, row);
                let piece = board.pieceAt(row, col);
                if (piece.pieceCode != "" && piece.colour != this.colour) {
                    takeable.push(coordinates);
                } else if (piece.pieceCode == "") {
                    highlight.push(coordinates);
                }
            }
        }

        return [takeable, highlight]
    }

}

class Bishop extends Piece {
    constructor(colour, pieceCode, piece) {
        super(colour, pieceCode, piece)
    }

    getSquares(id) {
        let squares = [];
        let [col, row] = colAndRowFromId(id);
        for (let i = 1; i < 8; i++) {
            squares.push([col + i, row + i]);
            squares.push([col + i, row - i]);
            squares.push([col - i, row + i]);
            squares.push([col - i, row - i]);
        }
        return squares;

    }

    getLegalSquares(board, id) {
        let squares = this.getSquares(id);
        let takeable = [];
        let highlight = [];
        let [selectedCol, selectedRow] = colAndRowFromId(id);
        for (let i = 0; i < squares.length; i++) {
            let [col, row] = squares[i];
            if (board.checkIfInBoard(row, col)) {
                let coordinates = idFromColAndRow(col, row);
                let piece = board.pieceAt(row, col);

                if (piece.pieceCode != "" && piece.colour != this.colour) {
                    takeable.push(coordinates);
                } else if (piece.pieceCode == "") {
                    highlight.push(coordinates);
                    continue;
                }

                if (col > selectedCol && row > selectedRow) {
                    for (let j = 0; j < squares.length; j++) {
                        if (squares[j][0] > col && squares[j][1] > row) {
                            squares.splice(j, 1);
                        }
                    }
                } else if (col > selectedCol && row < selectedRow) {
                    for (let j = 0; j < squares.length; j++) {
                        if (squares[j][0] > col && squares[j][1] < row) {
                            squares.splice(j, 1);
                        }
                    }
                } else if (col < selectedCol && row > selectedRow) {
                    for (let j = 0; j < squares.length; j++) {
                        if (squares[j][0] < col && squares[j][1] > row) {
                            squares.splice(j, 1);
                        }
                    }
                } else if (col < selectedCol && row < selectedRow) {
                    for (let j = 0; j < squares.length; j++) {
                        if (squares[j][0] < col && squares[j][1] < row) {
                            squares.splice(j, 1);
                        }
                    }
                }
            }
        }

        return [takeable, highlight]
    }

}


class Queen extends Piece {
    constructor(colour, pieceCode, piece) {
        super(colour, pieceCode, piece)
    }

    getSquares(id) {
        let squares = [];
        let [col, row] = colAndRowFromId(id);
        for (let i = 1; i < 8; i++) {
            squares.push([col + i, row]);
            squares.push([col - i, row]);
            squares.push([col, row + i]);
            squares.push([col, row - i]);
            squares.push([col + i, row + i]);
            squares.push([col + i, row - i]);
            squares.push([col - i, row + i]);
            squares.push([col - i, row - i]);
        }
        return squares;
    }

    getLegalSquares(board, id) {
        let squares = this.getSquares(id);
        let takeable = [];
        let highlight = [];
        let [selectedCol, selectedRow] = colAndRowFromId(id);
        for (let i = 0; i < squares.length; i++) {
            let [col, row] = squares[i];
            if (board.checkIfInBoard(row, col)) {
                let coordinates = idFromColAndRow(col, row);
                let piece = board.pieceAt(row, col);

                if (piece.pieceCode != "" && piece.colour != this.colour) {
                    takeable.push(coordinates);

                } else if (piece.pieceCode == "") {
                    highlight.push(coordinates);
                    continue;
                }


                if (col > selectedCol && row > selectedRow) {
                    for (let j = 0; j < squares.length; j++) {
                        if (squares[j][0] > col && squares[j][1] > row) {
                            squares.splice(j, 1);
                        }
                    }
                } else if (col > selectedCol && row < selectedRow) {
                    for (let j = 0; j < squares.length; j++) {
                        if (squares[j][0] > col && squares[j][1] < row) {
                            squares.splice(j, 1);
                        }
                    }
                } else if (col < selectedCol && row > selectedRow) {
                    for (let j = 0; j < squares.length; j++) {
                        if (squares[j][0] < col && squares[j][1] > row) {
                            squares.splice(j, 1);
                        }
                    }
                } else if (col < selectedCol && row < selectedRow) {
                    for (let j = 0; j < squares.length; j++) {
                        if (squares[j][0] < col && squares[j][1] < row) {
                            squares.splice(j, 1);
                        }
                    }
                } else if (col > selectedCol) {
                    for (let j = 0; j < squares.length; j++) {
                        if (squares[j][0] > col && squares[j][1] == row) {
                            squares.splice(j, 1);
                        }
                    }
                } else if (col < selectedCol) {
                    for (let j = 0; j < squares.length; j++) {
                        if (squares[j][0] < col && squares[j][1] == row) {
                            squares.splice(j, 1);
                        }
                    }
                } else if (row > selectedRow) {
                    for (let j = 0; j < squares.length; j++) {
                        if (squares[j][1] > row && squares[j][0] == col) {
                            squares.splice(j, 1);
                        }
                    }
                } else if (row < selectedRow) {
                    for (let j = 0; j < squares.length; j++) {
                        if (squares[j][1] < row && squares[j][0] == col) {
                            squares.splice(j, 1);
                        }
                    }
                }
            }
        }
        return [takeable, highlight]
    }

}

class King extends Piece {
    constructor(colour, pieceCode, piece) {
        super(colour, pieceCode, piece)
    }

    getSquares(id) {
        let squares = [];
        let [col, row] = colAndRowFromId(id);
        squares.push([col + 1, row]);
        squares.push([col - 1, row]);
        squares.push([col, row + 1]);
        squares.push([col, row - 1]);
        squares.push([col + 1, row + 1]);
        squares.push([col + 1, row - 1]);
        squares.push([col - 1, row + 1]);
        squares.push([col - 1, row - 1]);

        return squares;

    }
    
    getLegalSquares(board, id) {
        let squares = this.getSquares(id);
        let takeable = [];
        let highlight = [];
        let notMovable = [];
        let [selectedCol, selectedRow] = colAndRowFromId(id);
        for (let i = 0; i < squares.length; i++) {
            let [col, row] = squares[i];
            if (board.checkIfInBoard(row, col)) {
                let coordinates = idFromColAndRow(col, row);
                let piece = board.pieceAt(row, col);
                


                // if (board.checkIfInBoard(row + 1, col + 1)) {
                //     if (board.pieceAt(row + 1, col + 1).piece == king && (board.pieceAt(row + 1, col + 1).colour != this.colour)) {
                //         notMovable.push(row + 1, col + 1);
                //     }
                // } else if (board.checkIfInBoard(row + 1, col - 1)) {
                //     if (board.pieceAt(row + 1, col - 1).piece == king && (board.pieceAt(row + 1, col - 1).colour != this.colour)) {
                //         notMovable.push(row + 1, col - 1);
                //     }
                // } else if (board.checkIfInBoard(row - 1, col + 1)) {
                //     if (board.pieceAt(row - 1, col + 1).piece == king && (board.pieceAt(row - 1, col + 1).colour != this.colour)) {
                //         notMovable.push(row - 1, col + 1);
                //     }
                // } else if (board.checkIfInBoard(row - 1, col - 1)) {
                //     if (board.pieceAt(row - 1, col - 1).piece == king && (board.pieceAt(row - 1, col - 1).colour != this.colour)) {
                //         notMovable.push(row - 1, col - 1);
                //     }
                // } else if (board.checkIfInBoard(row, col + 1)) {
                //     if (board.pieceAt(row, col + 1).piece == king && (board.pieceAt(row, col + 1).colour != this.colour)) {
                //         notMovable.push(row, col + 1);
                //     }
                // } else if (board.checkIfInBoard(row, col - 1)) {
                //     if (board.pieceAt(row, col - 1).piece == king && (board.pieceAt(row, col - 1).colour != this.colour)) {
                //         notMovable.push(row, col - 1);
                //     }
                // } else if (board.checkIfInBoard(row + 1, col)) {
                //     if (board.pieceAt(row + 1, col).piece == king && (board.pieceAt(row + 1, col).colour != this.colour)) {
                //         notMovable.push(row + 1, col);
                //     }
                // } else if (board.checkIfInBoard(row - 1, col)) {
                //     if (board.pieceAt(row - 1, col).piece == king && (board.pieceAt(row - 1, col).colour != this.colour)) {
                //         notMovable.push(row - 1, col);
                //     }
                // }
                
                if (!this.underAttack(coordinates, board)) {
                    if (piece.pieceCode != "" && piece.colour != this.colour) {
                        takeable.push(coordinates);
                    } else if (piece.pieceCode == "") {
                        highlight.push(coordinates);
                    }
                    
                }

            }
        }
        // for (let i = 0; i < highlight; i++) {
        //     if (highlight[i] in notMovable) {
        //         highlight.splice(i, 1);
        //     }
        // }
        // for (let i = 0; i < takeable; i++) {
        //     if (takeable[i] in notMovable) {
        //         takeable.splice(i, 1);
        //     }

        return [takeable, highlight]
    }

    underAttack(id, board) {
        for (let i = 0; i < board.length; i++) {
            let row = board[i];
            for (let j = 0; j < row.length; j++) {
                if (row[j].colour != this.colour) {
                    let [takeable, highlight] = row[j].getLegalSquares(board, id)
                    if (id in takeable || id in highlight) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

}




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
const blackPawn1 = new Pawn(black, blackPawnUni, pawn);
const blackPawn2 = new Pawn(black, blackPawnUni, pawn);
const blackPawn3 = new Pawn(black, blackPawnUni, pawn);
const blackPawn4 = new Pawn(black, blackPawnUni, pawn);
const blackPawn5 = new Pawn(black, blackPawnUni, pawn);
const blackPawn6 = new Pawn(black, blackPawnUni, pawn);
const blackPawn7 = new Pawn(black, blackPawnUni, pawn);
const blackPawn8 = new Pawn(black, blackPawnUni, pawn);

const blackRook1 = new Rook(black, blackRookUni, rook);
const blackRook2 = new Rook(black, blackRookUni, rook);

const blackKnight1 = new Knight(black, blackKnightUni, knight);
const blackKnight2 = new Knight(black, blackKnightUni, knight);

const blackBishop1 = new Bishop(black, blackBishopUni, bishop);
const blackBishop2 = new Bishop(black, blackBishopUni, bishop);

const blackQueen = new Queen(black, blackQueenUni, queen);
const blackKing = new King(black, blackKingUni, king);


// WHITE PIECES
const whitePawn1 = new Pawn(white, whitePawnUni, pawn);
const whitePawn2 = new Pawn(white, whitePawnUni, pawn);
const whitePawn3 = new Pawn(white, whitePawnUni, pawn);
const whitePawn4 = new Pawn(white, whitePawnUni, pawn);
const whitePawn5 = new Pawn(white, whitePawnUni, pawn);
const whitePawn6 = new Pawn(white, whitePawnUni, pawn);
const whitePawn7 = new Pawn(white, whitePawnUni, pawn);
const whitePawn8 = new Pawn(white, whitePawnUni, pawn);

const whiteRook1 = new Rook(white, whiteRookUni, rook);
const whiteRook2 = new Rook(white, whiteRookUni, rook);

const whiteKnight1 = new Knight(white, whiteKnightUni, knight);
const whiteKnight2 = new Knight(white, whiteKnightUni, knight);

const whiteBishop1 = new Bishop(white, whiteBishopUni, bishop);
const whiteBishop2 = new Bishop(white, whiteBishopUni, bishop);

const whiteQueen = new Queen(white, whiteQueenUni, queen);
const whiteKing = new King(white, whiteKingUni, king);


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
