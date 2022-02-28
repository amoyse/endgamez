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

let checked = "";

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


class Player {
    constructor(colour) {
        this.colour = colour;
        this.inCheck = false;
    }

    setCheck(board) {
        for (let i = 0; i < board.chessboard.length; i++) {
            let row = board.chessboard[i];
            for (let j = 0; j < row.length; j++) {
                if (row[j].piece == king && row[j].colour == this.colour) {
                    let coordinates = idFromColAndRow(j + 1, 8 - i);

                    if (board.checkCheck(coordinates, this.colour)) {
                        board.pieceAtId(coordinates).inCheck = true;
                        checked = coordinates;
                        this.inCheck = true;
                        board.makeChecked(coordinates);
                        return true;
                    } else {
                        if (this.inCheck && checked != "") {
                            board.resetSquareColour(document.getElementById(checked));
                            checked = "";
                        }
                        this.inCheck = false
                        return false;
                    }
                }
            }
        }
    }

}


class Board {
    constructor(chessboard) {
        this.highlightedPiece = "";
        this.chessboard = chessboard;
        this.boardDiv = document.getElementById("chessboard");
        this.highlightedSquares = [];
        this.takeableSquares = [];
        this.attackingPiece = "";
    }


    fenToBoard(fen) {
    
        let [piecePlacement, move, castling, enPassant, halfmove, fullmove] = fen.split("_"); // change to "_" -> using space for testing purposes
        let ranks = piecePlacement.split("/");
        for (let i = 0; i < ranks.length; i++ ) {
            let rank = ranks[i];
            let col = 0;
            for (let j = 0; j < rank.length; j++) {

                if (!isNaN(rank[j])) {
                    let numberOfBlank = parseInt(rank[j]);
                    for (let b = 0; b < numberOfBlank; b++) {
                        this.chessboard[i][col] = new Blank();
                        col++;
                    }
                } else if (rank[j] === rank[j].toLowerCase()) {
                    if (rank[j] == "p") {
                        this.chessboard[i][col] = new Pawn(black, blackPawnUni, pawn);
                        
                    } else if (rank[j] == "n") {
                        this.chessboard[i][col] = new Knight(black, blackKnightUni, knight);
                        
                    } else if (rank[j] == "b") {
                        this.chessboard[i][col] = new Bishop(black, blackBishopUni, bishop);

                    } else if (rank[j] == "r") {
                        this.chessboard[i][col] = new Rook(black, blackRookUni, rook);
                        
                    } else if (rank[j] == "k") {
                        this.chessboard[i][col] = new King(black, blackKingUni, king);
                        
                    } else if (rank[j] == "q") {
                        this.chessboard[i][col] = new Queen(black, blackQueenUni, queen);
                    }

                    col++;

                } else {
                    if (rank[j] == "P") {
                        this.chessboard[i][col] = new Pawn(white, whitePawnUni, pawn);
                        
                    } else if (rank[j] == "N") {
                        this.chessboard[i][col] = new Knight(white, whiteKnightUni, knight);
                        
                    } else if (rank[j] == "B") {
                        this.chessboard[i][col] = new Bishop(white, whiteBishopUni, bishop);

                    } else if (rank[j] == "R") {
                        this.chessboard[i][col] = new Rook(white, whiteRookUni, rook);
                        
                    } else if (rank[j] == "K") {
                        this.chessboard[i][col] = new King(white, whiteKingUni, king);
                        
                    } else if (rank[j] == "Q") {
                        this.chessboard[i][col] = new Queen(white, whiteQueenUni, queen);
                    }
                    
                    col++;
                    
                }
            }
    
        }
        if (move == "w") {
            turn = white;
        } else {
            turn = black;
        }
        this.setTurn();
    }
    
    boardToFEN() {
        let fen = "";
        let piecePlacement = "";
        let move = "";
        for (let i = 0; i < this.chessboard.length; i++) {
            let row = this.chessboard[i];
            let blankInARow = 0;
            let rank = "";
            for (let j = 0; j < row.length; j++) {
                if (row[j].piece == "blank") {
                    blankInARow++;
                    if (j == row.length - 1) {
                        rank += blankInARow;
                    }
                } else {
                    if (blankInARow > 0) {
                        rank += String(blankInARow);
                        blankInARow = 0;
                    }
                    if (row[j].colour == white) {
                        if (row[j].piece == pawn) {
                            rank += "P";
                        } else if (row[j].piece == knight) {
                            rank += "N";
                        } else if (row[j].piece == bishop) {
                            rank += "B";
                        } else if (row[j].piece == rook) {
                            rank += "R";
                        } else if (row[j].piece == king) {
                            rank += "K";
                        } else if (row[j].piece == queen) {
                            rank += "Q";
                        }
                    } else if (row[j].colour == black) {
                        if (row[j].piece == pawn) {
                            rank += "p";
                        } else if (row[j].piece == knight) {
                            rank += "n";
                        } else if (row[j].piece == bishop) {
                            rank += "b";
                        } else if (row[j].piece == rook) {
                            rank += "r";
                        } else if (row[j].piece == king) {
                            rank += "k";
                        } else if (row[j].piece == queen) {
                            rank += "q";
                        }
                    }
                }
            }
            if (i > 0) {
                piecePlacement += "/" + rank;
            } else {
                piecePlacement += rank;
            }
        }

        if (turn == white) {
            move = "w";
        } else {
            move = "b";
        }
        
        fen = piecePlacement + "_" + move + "_-_-_0_1"
        return fen;

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

    setTurn(checkmate=false) {
        let turnElement = document.getElementById("turnToMove");
        if (!checkmate) {
            if (turn == white) {
                turnElement.innerHTML = "White to Move";
            } else {
                turnElement.innerHTML = "Black to Move";
            }
        } else {
            if (turn == white) {
                turnElement.innerHTML = "Checkmate! Black Wins!";
            } else {
                turnElement.innerHTML = "Checkmate! White Wins!";
            }
        }
        
    }

    checkCheckCheck() {
        player1.setCheck(board);
        player2.setCheck(board);
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

    
    checkCheck(id, colour) {
        for (let i = 0; i < this.chessboard.length; i++) {
            let row = this.chessboard[i];
            for (let j = 0; j < row.length; j++) {
                let coordinates = idFromColAndRow(j + 1, 8 - i);
                if (row[j].colour != colour) {
                    if (row[j].pieceCode != '') {
                        let [takeable, highlight] = row[j].getSquaresIgnoringCheck(board, coordinates);
                        if (takeable.includes(id) || highlight.includes(id)) {
                            this.attackingPiece = coordinates;
                            return true;
                        }
                    }
                }
            }
        }
        if (!player1.inCheck && !player2.inCheck) {
            this.attackingPiece = "";
        }
        return false;
    }
    
    checkSquareToMoveTo(id, mate=false) {
        let squareToMoveTo = this.pieceAtId(id);

        for (let i = 0; i < this.chessboard.length; i++) {
            let row = this.chessboard[i];
            for (let j = 0; j < row.length; j++) {
                let coordinates = idFromColAndRow(j + 1, 8 - i);
                if ((row[j].colour != turn && !mate) || (row[j].colour != squareToMoveTo.colour && mate)) {
                    if (row[j].pieceCode != '') {
                        if (squareToMoveTo.pieceCode != '' && !mate) {
                            let controlled = row[j].getControlledSquares(board, coordinates);
                            if (controlled.includes(id)) {
                                return true;
                            }
            
                        } else {
                            let [takeable, highlight] = row[j].getSquaresIgnoringCheck(board, coordinates);
                            if (takeable.includes(id) || highlight.includes(id)) {
                                if (row[j].piece == king && mate) {
                                    if (!this.checkIfDefended(coordinates)) {
                                        return true;
                                    }
                                }
                                return true;
                            } else if (mate) {
                                return true;
                            }
                        }
                        
                    }
                }
            }
        }
        return false;
    }

    checkIfDefended(id) {
        let squareToMoveTo = this.pieceAtId(id);
        for (let i = 0; i < this.chessboard.length; i++) {
            let row = this.chessboard[i];
            for (let j = 0; j < row.length; j++) {
                let coordinates = idFromColAndRow(j + 1, 8 - i);
                if (squareToMoveTo.colour == row[j].colour) {
                    if (row[j].pieceCode != '') {
                        let controlled = row[j].getControlledSquares(board, coordinates);
                        if (controlled.includes(id)) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    getsOutOfCheck(oldId, newId) { // passes in the id of square to come from and id of square to go to and checks if moving there changes check status
        let outOfCheck = true;


        let piece = this.pieceAtId(oldId);
        this.setPieceAtId(newId, piece);
        this.setPieceAtId(oldId, new Blank());

        this.checkCheck()

        if (player1.inCheck || player2.inCheck) {
            outOfCheck = !this.checkIfKingUnderAttack(turn);
        }
        
        piece = this.pieceAtId(newId);
        this.setPieceAtId(oldId, piece);
        this.setPieceAtId(newId, new Blank());

        this.checkCheckCheck()

        return outOfCheck;
    }

    checkIfKingUnderAttack(colour) {
        for (let i = 0; i < this.chessboard.length; i++) {
            let row = this.chessboard[i];
            for (let j = 0; j < row.length; j++) {
                if (row[j].piece == king && row[j].colour == colour) {
                    let coordinates = idFromColAndRow(j + 1, 8 - i);
                    if (this.checkCheck(coordinates, colour)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    checkForCheckmate() {
        if (checked != '') {
            let piece = this.pieceAtId(checked);
            let [takeable, highlight] = piece.getLegalSquares(this, checked);
            if (takeable.length == 0 && highlight.length == 0) {
                
                if (this.checkSquareToMoveTo(checked, true)) {
                    this.setTurn(true);
                }

            } else {
                if (highlight.length != 0) {
                    for (let i = 0; i < highlight.length; i++) {
                        if (this.getsOutOfCheck(checked, highlight[i])) {
                            return;
                        }
                    }
                }
                if (takeable.length != 0) {
                    if (takeable.includes(this.attackingPiece)) {
                        if (!this.checkSquareToMoveTo(this.attackingPiece)) {
                            return;
                        }
                    }
                }
                this.setTurn(true);
            }
        }
    }
    
    checkForPromotion(id) {
        let piece = this.pieceAtId(id);
        let [letter, number] = id.split("");
        if (piece.piece == pawn) {
            if ((piece.colour == white && number == 8) || (piece.colour == black && number == 1)) {
                this.promotePawn(id); 
             }
        }
        
        
    }
    
    promotePawn(id) {
        let piece = this.pieceAtId(id);
        if (piece.colour == white) {
            this.setPieceAtId(id, new Queen(white, whiteQueenUni, queen)); 
        } else {
            this.setPieceAtId(id, new Queen(black, blackQueenUni, queen)); 
        }
    }


    selectPiece(div) {

        this.checkCheckCheck();

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
                            this.draw();
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
                        this.movePiece(this.highlightedPiece, id);
                        this.draw();
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
    
    makeChecked(id) {
        let div = document.getElementById(id);
        div.className = "checked"
        
    }


    unSelectSquare(highlightedDiv) {
        if (highlightedDiv.id != checked) {
            this.resetSquareColour(highlightedDiv)
        }
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
        if ((player1.setCheck(this) && player1.colour == turn) || (player2.setCheck(this) && player2.colour == turn)) {
            let takeable = [];
            let highlight = [];
            if (piece.piece == pawn || piece.piece == king) {
                [takeable, highlight] = piece.getLegalSquares(this, id);
            } else {
                [takeable, highlight] = piece.getSquaresIgnoringCheck(this, id);
            }
            if (highlight.length != 0) {
                for (let i = 0; i < highlight.length; i++) {
                    if (this.getsOutOfCheck(this.highlightedPiece, highlight[i])) {
                        let div = document.getElementById(highlight[i]);
                        this.highlightSquare(div);
                        highlighted.push(colAndRowFromId(highlight[i]));
                    }
                }
            }
            if (takeable.length != 0) {
                if (takeable.includes(this.attackingPiece)) {
                    let div = document.getElementById(this.attackingPiece);
                    this.makeTakeable(div);
                }
                if (piece.piece == king) {
                    for (let i = 0; i < takeable.length; i++) {
                        if (takeable[i] != this.attackingPiece) {
                            let div = document.getElementById(takeable[i]);
                            this.makeTakeable(div);
                        }
                    }
                }
            }
        } else {
            // let takeable = [];
            // let highlight = [];
            // if (piece.piece != king) {
            //     [takeable, highlight] = piece.getLegalSquares(this, id);
            // } else {
            //     [takeable, highlight] = piece.getSquaresIgnoringCheck(this, id);
            // }
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
        }
        return highlighted;
    }

    unHighlightAvailableSquares(squares) {
        if (squares.length > 0) {
            for (let i = 0; i < squares.length; i++) {
                let [col, row] = squares[i];

                let coordinates = idFromColAndRow(col, row);
                let div = document.getElementById(coordinates);
                this.unHighlightSquare(div);
            }
            
        }
        
    }

    movePiece(from, to) {
        let [col, row] = colAndRowFromId(to);

        for (let i = 0; i < this.highlightedSquares.length; i++) {
            if (col == this.highlightedSquares[i][0] && row == this.highlightedSquares[i][1]) {
                
                let piece = this.pieceAtId(from);
                this.setPieceAtId(to, piece);
                this.setPieceAtId(from, new Blank());

                this.highlightedPiece = "";
                
                if (turn == white) {
                    turn = black;
                } else {
                    turn = white;
                }
                this.checkForPromotion(to);
                this.setTurn();
                
            }
        }        
        this.checkCheckCheck();
        this.checkForCheckmate();
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
            this.highlightedPiece = "";
            
            if (turn == white) {
                turn = black;
            } else {
                turn = white;
            }
            this.checkForPromotion(id);
            this.checkCheckCheck();
            this.setTurn();
            this.checkForCheckmate();
            
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
        this.piece = "blank";
    }

    getPieceName(id) {

    }

    getSquaresIgnoringCheck(board, id) {
         return null;
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
    
     getLegalSquares(board, id) {

     }

     getSquaresIgnoringCheck(board, id) {
         
     }
    
     getControlledSquares(board, id) {

     }

     isWhite() {

     }
}

class Pawn extends Piece {
    constructor(colour, pieceCode, piece) {
        super(colour, pieceCode, piece)
        this.piece = piece;
    }

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

    getSquaresIgnoringCheck(board, id) {
        return [this.getControlledSquares(board, id), []];
    }

    getControlledSquares(board, id) {
        let controlled = [];
        let [selectedCol, selectedRow] = colAndRowFromId(id);
        let squares = this.getSquares(id);
        for (let i = 0; i < squares.length; i++) {
            let [col, row] = squares[i];
            if (board.checkIfInBoard(row, col) && col != selectedCol) {
                controlled.push(idFromColAndRow(col, row));
            }
        }
        return controlled;
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

    getLegalSquares(board, id, controlled=false) {
        let squares = this.getSquares(id);
        let takeable = [];
        let highlight = [];
        let [selectedCol, selectedRow] = colAndRowFromId(id);
        for (let i = 0; i < squares.length; i++) {
            let [col, row] = squares[i];
            if (board.checkIfInBoard(row, col)) {
                let coordinates = idFromColAndRow(col, row);
                let piece = board.pieceAt(row, col);
                if (piece.pieceCode != "" && ((piece.colour != this.colour && !controlled) || (piece.colour == this.colour && controlled))) {
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

    getSquaresIgnoringCheck(board, id) {
        return this.getLegalSquares(board, id);
    }
    
    getControlledSquares(board, id) {
        let [takeable, highlight] = this.getLegalSquares(board, id, true); 
        return takeable.concat(highlight); 
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

    getLegalSquares(board, id, controlled=false) {
        let squares = this.getSquares(id);
        let takeable = [];
        let highlight = [];
        for (let i = 0; i < squares.length; i++) {
            let [col, row] = squares[i];
            if (board.checkIfInBoard(row, col)) {
                let coordinates = idFromColAndRow(col, row);
                let piece = board.pieceAt(row, col);
                if (piece.pieceCode != "" && ((piece.colour != this.colour && !controlled) || (piece.colour == this.colour && controlled))) { 
                    takeable.push(coordinates);
                } else if (piece.pieceCode == "") {
                    highlight.push(coordinates);
                }
            }
        }

        return [takeable, highlight]
    }

    getSquaresIgnoringCheck(board, id) {
        return this.getLegalSquares(board, id);
    }

    getControlledSquares(board, id) {
        let [takeable, highlight] = this.getLegalSquares(board, id, true); 
        return takeable.concat(highlight); 
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

    getLegalSquares(board, id, controlled=false) {
        let squares = this.getSquares(id);
        let takeable = [];
        let highlight = [];
        let [selectedCol, selectedRow] = colAndRowFromId(id);
        for (let i = 0; i < squares.length; i++) {
            let [col, row] = squares[i];
            if (board.checkIfInBoard(row, col)) {
                let coordinates = idFromColAndRow(col, row);
                let piece = board.pieceAt(row, col);

                if (piece.pieceCode != "" && ((piece.colour != this.colour && !controlled) || (piece.colour == this.colour && controlled))) {
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

    getSquaresIgnoringCheck(board, id) {
        return this.getLegalSquares(board, id);
    }

    getControlledSquares(board, id) {
        let [takeable, highlight] = this.getLegalSquares(board, id, true); 
        return takeable.concat(highlight); 
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

    getLegalSquares(board, id, controlled=false) {
        let squares = this.getSquares(id);
        let takeable = [];
        let highlight = [];
        let [selectedCol, selectedRow] = colAndRowFromId(id);
        for (let i = 0; i < squares.length; i++) {
            let [col, row] = squares[i];
            if (board.checkIfInBoard(row, col)) {
                let coordinates = idFromColAndRow(col, row);
                let piece = board.pieceAt(row, col);

                if (piece.pieceCode != "" && ((piece.colour != this.colour && !controlled) || (piece.colour == this.colour && controlled))) {
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

    getSquaresIgnoringCheck(board, id) {
        return this.getLegalSquares(board, id);
    }

    getControlledSquares(board, id) {
        let [takeable, highlight] = this.getLegalSquares(board, id, true); 
        return takeable.concat(highlight); 
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
        for (let i = 0; i < squares.length; i++) {
            let [col, row] = squares[i];
            if (board.checkIfInBoard(row, col)) {
                let piece = board.pieceAt(row, col);
                let coordinates = idFromColAndRow(col, row);
                if (!board.checkSquareToMoveTo(coordinates)) {
                    if (piece.pieceCode != "" && piece.colour != this.colour) {
                        takeable.push(coordinates);
                    } else if (piece.pieceCode == "") {
                        highlight.push(coordinates);
                    }
                }
            }
        }
        return [takeable, highlight]
    }

    getSquaresIgnoringCheck(board, id, controlled=false) {
        let squares = this.getSquares(id);
        let takeable = [];
        let highlight = [];
        for (let i = 0; i < squares.length; i++) {
            let [col, row] = squares[i];
            if (board.checkIfInBoard(row, col)) {
                let piece = board.pieceAt(row, col);
                let coordinates = idFromColAndRow(col, row);
                
                if (piece.pieceCode != "" && ((piece.colour != this.colour && !controlled) || (piece.colour == this.colour && controlled))) {
                    takeable.push(coordinates);
                } else if (piece.pieceCode == "") {
                    highlight.push(coordinates);
                }
            }
        }
        return [takeable, highlight]
    }
    
    getControlledSquares(board, id) {
        let [takeable, highlight] = this.getSquaresIgnoringCheck(board, id, true); 
        return takeable.concat(highlight); 
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

// Blank piece
const blank = new Blank();


// Players
const player1 = new Player(white);
const player2 = new Player(black);




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
