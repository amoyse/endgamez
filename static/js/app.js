
// colour constants
const black = "black"
const white = "white";

// constants for the piece names
const pawn = "pawn";
const rook = "rook";
const knight = "knight";
const bishop = "bishop";
const queen = "queen";
const king = "king";

// constants for the unicode chess pieces
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

// list of taken pieces
let taken = [];

// sets turn to white at the beginning of the game
let turn = white;

let checked = "";

// two stacks, used for storing arrays of stored FENs and the current number of moves until mate
let storedFens = [];
let loadedFens = [];



/** 
* A sleep function designed to wait a certain amount of time before returning.
* @param {Integer} ms - The number of miliseconds the function will sleep for.
* @return {Promise} - Timeout function.
*/
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}



/** 
* Splits the id and converts the letter and number into the column and row umbers for use on the model.
* @param {String} id - A chess square id value, e.g. 'b6'.
* @return {Array} - Array containing the values of col and row.
*/
function colAndRowFromId(id) {
    let [letter, number] = id.split("");
    let col = parseInt(letter.charCodeAt(0)) - 96;
    let row = parseInt(number);
    return [col, row];
}



/** 
* Turns column and row values into the id for a square on the chessboard.
* @param {Integer} col - the column value for the position in question.
* @param {Integer} row - the row value for the position in question.
* @return {String} - the unique identifier for a square on the chessboard.
*/
function idFromColAndRow(col, row) {
    let colLetter = String.fromCharCode(col + 96);
    let id = colLetter + String(row);
    return id;
}



/** 
* This function contacts the backend python flask server, sending an fen of the current state of the board. 
* The response received is then used to play then next move, depending on what the result is. If uciMove == -1, then the function 
* displays a graphic from SweetAlert, to let the user know the game is over and to give them the option to restart or go back. 
* If a draw is deteced, then a graphic is displayed to tell the user. If a move is played (and showSolution is false), 
* then the move counter is updated to the returned value from the flask server.
* @summary Contacts the backend to get a move to play and plays it if necessary.
* @param {String} fen - the FEN description of the current state of the board.
* @param {Boolean} [showSolution=false] - tells the function whether it's being called for the 
                                showSolution function (repeatedly). 
*/
async function playNextMove(fen, showSolution=false) {

    // sends the fen to the flask api
    let fenKey = {"fen": fen};
    let response = await fetch("/api/nextMove", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(fenKey)
    });
    
    // receives the response from /api/nextMove
    let data = await response.json();
    let uciMove = data["a"]
    let moveCount = data["b"]
    
    // moveCount is number of moves for both black and white until mate, but just white's moves are needed
    // so this splits moveCount in half to get white's moves
    if (moveCount % 2 == 0) {
        moveCount = Math.floor(moveCount / 2)
    } else {
        moveCount = Math.floor(moveCount / 2) + 1
    }
    
    // checks if uciMove is -1 which means the position is mate
    if (uciMove == -1) {
        if (showSolution) { 

            // sleep for 400 miliseconds
            await sleep(400); 

            // uses SweetAlert to display a graphic telling the user the position is completed
            // gives option to try to solve it or go back to list of endgames
            swal({
                title: "Checkmate!",
                text: "This endgame position has been completed",
                icon: "success",
                buttons: {
                    back: {
                        text: "Back to endgames",
                        value: "back"
                    },
                    again: {
                        text: "Try to solve",
                        value: "again",
                    }
                }
            }).then((value) => {
                if (value == "again") {

                    // reload page if "Try to solve" was selected
                    window.location.reload();

                }
                else if (value == "back") {

                    // go back one page if "Back to endgames" was selected
                    window.history.back();
                }
            });

        // if showSolution was not used, congratulate the user for solving the position themselves
        } else {
            await sleep(400);
            swal({
                title: "Checkmate!",
                text: "You have won this endgame position",
                icon: "success",
                buttons: {
                    back: {
                        text: "Back to endgames",
                        value: "back"
                    },
                    again: {
                        text: "Play again",
                        value: "again",
                    }
                }
            }).then((value) => {
                if (value == "again") {

                    // reload page if "Play again" was selected
                    window.location.reload();
                }
                else if (value == "back") {

                    // go back one page if "Back to endgames" was selected
                    window.history.back();
                }
            });
        }
        
    // if uciMove is longer than 6 characters, then the position is drawn
    } else if (uciMove.length > 6) {
        
        // if uciMove is less than 15 characters then it is a draw and not a stalemate, so play another move
        if (uciMove.length < 15) {
            await sleep(400);
            board.moveFromUCI(uciMove, showSolution);
            board.draw();
        }

        // if uciMove is longer than 15 characters the move isn't played (because a move cannot be played)
        // then the draw graphic is shown, whether it is a draw or stalemate
        await sleep(300);
        swal("Draw!", "This position is drawn... play again?").then((playAgain) => {
            if (playAgain) {
               window.location.reload(); 
            }
        });
    
    // if uciMove is any shorter than 6 characters, then it is a legal position and black can move
    } else {
        await sleep(400);
        
        // calls the move function using the uciMove and passing in the optional bool showSolution
        board.moveFromUCI(uciMove, showSolution);
        board.draw();
        
        // if turn is black, then don't update the counter and return instead
        if (turn == black) return;

        // updates the onscreen counter to show moves until mate for white
        if (moveCount == 1) {
            document.getElementById("moveCounter").innerHTML = moveCount + " move until mate";
            
        } else {
            document.getElementById("moveCounter").innerHTML = moveCount + " moves until mate";
        }
    }
}




/** 
* Contacts the flask server api/nextMove to get the next move that should be played, then highlights the piece to be 
* moved and the square that it can move to.
*/
async function getHint() {

    // generates a description of the current state of the board in the form of a FEN
    let fen = board.boardToFEN();
    
    // contacts the flask api/nextMove sending the FEN
    let fenKey = {"fen": fen};
    let response = await fetch("/api/nextMove", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(fenKey)
    });
    
    let data = await response.json();
    
    // receives the uci notation move to be played, e.g. "e6f5"
    let uci = data["a"]

    // splitting the move into which square the piece comes from and where it should move to 
    let from = uci[0] + uci[1]
    let to = uci[2] + uci[3]

    let pieceToTake = board.pieceAtId(to);

    // setting turn as null stops the user being able to move a piece while the hint is occuring
    let oldTurn = turn;
    turn = null;
    
    
    // if there is an actual piece on that square, make that square highlight orange as takeable
    // as well as highlighting the piece to be moved in green
    if (pieceToTake.pieceCode != '') {
        board.selectSquare(document.getElementById(from), from);
        board.makeTakeable(document.getElementById(to))
    } else {
        board.selectSquare(document.getElementById(from), from);
        board.highlightSquare(document.getElementById(to))
    }
    
    // wait for the user to see the highlighted squares, then reset the colour of all squares on the board so the hint disappears
    await sleep(800);
    board.resetSquares();

    // reset turn so that user can now move
    turn = oldTurn;
}



/** 
* Disables all buttons and gets the number of moves left until mate. Then, calls playNextMove() on the current state of the board
* twice (for white AND black because moves until mate is just for white) for the number of moves left until mate. 
* Then re-enables all buttons.
* @summary Repeatedly calls playNextMove until number of moves until mate == 0.
*/
async function showSolution() {

    // disabling hint, solve, forward and back buttons
    document.getElementById("hint").style.pointerEvents = "none";
    document.getElementById("solve").style.pointerEvents = "none";
    document.getElementById("forwardButton").style.pointerEvents = "none";
    document.getElementById("backButton").style.pointerEvents = "none";
    
    // gets the current number of moves until mate for white
    let counter = document.getElementById("moveCounter").innerHTML.split(" ")[0];
    let noOfMoves = parseInt(counter);

    while (noOfMoves > 0) {

        // calls playNextMove twice for white and black, using the current state of the board as one parameter, and true as another
        // to tell playNextMove that it is being called from showSolution
        await playNextMove(board.boardToFEN(), true);
        await playNextMove(board.boardToFEN(), true);
        noOfMoves--;
    }
    
    // re-enabling forward and back buttons (hint and solution no longer needed)
    document.getElementById("forwardButton").style.pointerEvents = "auto";
    document.getElementById("backButton").style.pointerEvents = "auto";
    
    // making sure moveCounter says 0 moves until mate
    document.getElementById("moveCounter").innerHTML =  "0 moves until mate";
}



/** 
* If there are enough items on the storedFens stack, takes top item off stack, notes current moves until mate then updates 
* with new number. Then notes the current state of board and updates it to the new FEN. Then stores the noted values in loadedFens.
*/
function goBack() {
    
    if (storedFens.length > 0) {
        let [fen, numberOfMoves] = storedFens.pop();

        // gets the current number of moves until mate from the moveCounter
        let oldNumberOfMoves = parseInt(document.getElementById("moveCounter").innerHTML.split(" ")[0]);

        if (numberOfMoves == 1) {
            document.getElementById("moveCounter").innerHTML = numberOfMoves + " move until mate";
        } else {
            document.getElementById("moveCounter").innerHTML = numberOfMoves + " moves until mate";
        }

        let oldFen = board.boardToFEN();
        board.fenToBoard(fen);
        board.draw();
        loadedFens.push([oldFen, oldNumberOfMoves]);
    }
}



/** 
* If there are enough items on the loadedFens stack, takes top item off stack, notes current moves until mate then updates 
* with new number. Then notes current state of board and updates it to the new FEN. Then stores the noted values in storedFens.
*/
function goForward() {

    if (loadedFens.length > 0) {
        let [fen, numberOfMoves] = loadedFens.pop();
        
        // gets the current number of moves until mate from the moveCounter
        let oldNumberOfMoves = parseInt(document.getElementById("moveCounter").innerHTML.split(" ")[0]);

        if (numberOfMoves == 1) {
            document.getElementById("moveCounter").innerHTML = numberOfMoves + " move until mate";
            
        } else {
            document.getElementById("moveCounter").innerHTML = numberOfMoves + " moves until mate";
        }

        let oldFen = board.boardToFEN();
        board.fenToBoard(fen);
        board.draw();
        storedFens.push([oldFen, oldNumberOfMoves]);
    }
}



/**
* Manages whether the player is in check and holds the player's colour
*/
class Player {
    constructor(colour) {
        this.colour = colour;
        this.inCheck = false;
    }

    /** 
    * Checks every piece in the chessboard to find the king and checks if it corresponds to the correct colour. 
    * Then, checks if the king is in check and if it is, set inCheck to true, highlight the king as in check (unless temp == true) 
    * and return true. Otherwise, set inCheck to false, make the king no loner highlighted to be in check and return false.
    * @summary Sets values to be in check and highlights king in check if it is.
    * @param {Object} board - An instantiation of the Board object
    * @param {Boolean} [temp=false] - Tells the function if check is being set temporarily or permanently
    * @return {Boolean} Returns true if in check and false if not
    */
    setCheck(board, temp=false) {
        
        // goes through ever row and coloumn on chessboard to check every posiiton in model
        for (let i = 0; i < board.chessboard.length; i++) {
            let row = board.chessboard[i];
            for (let j = 0; j < row.length; j++) {
                
                // checks if the position has a king of the right colour
                if (row[j].piece == king && row[j].colour == this.colour) {
                    let coordinates = idFromColAndRow(j + 1, 8 - i);

                    // checks if the king is in check
                    if (board.checkCheck(coordinates, this.colour)) {

                        // don't want to set variables permanently if this is a temporary check
                        if (!temp) {
                            board.pieceAtId(coordinates).inCheck = true;
                            checked = coordinates;
                            this.inCheck = true;

                            // highlights the king as in check
                            board.makeChecked(coordinates);
                        }
                        return true;
                    } else {
                        
                        // checks if king was in check before function called
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


/**
* The main class handling the state of the board and the playing of the game
*/
class Board {
    constructor(chessboard) {
        this.highlightedPiece = "";
        this.chessboard = chessboard;
        this.boardDiv = document.getElementById("chessboard");
        this.highlightedSquares = [];
        this.takeableSquares = [];
        this.attackingPiece = "";
    }


    /** 
    * Takes in an fen description of a board state, splits it up into rows on the board and translates it into 
    * the state of the board on this.chessboard.
    * @param {String} fen - A description of the state of the board using Forsyth Edwards Notation.
    */
    fenToBoard(fen) {
    
        // splits the fen into the description of the board and whose turn it is to move (the rest is discarded)
        let [piecePlacement, move, castling, enPassant, halfmove, fullmove] = fen.split("_");
        let ranks = piecePlacement.split("/");
        
        // goes through each rank and each character in each rank
        for (let i = 0; i < ranks.length; i++ ) {
            let rank = ranks[i];
            let col = 0;
            for (let j = 0; j < rank.length; j++) {

                // checks if the current char is a number or not
                if (!isNaN(rank[j])) {

                    //if it is, add n number of blanks to the equivalent position on the board
                    let numberOfBlank = parseInt(rank[j]);
                    for (let b = 0; b < numberOfBlank; b++) {
                        this.chessboard[i][col] = new Blank();
                        col++;
                    }

                // checks if lowervase, which would mean it is a black piece
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

                // else, must be a white piece
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
        // sets turn depending on the value held in the FEN
        if (move == "w") {
            turn = white;
        } else {
            turn = black;
        }
        this.setTurn(false, true);
    }
    
    
    /** 
    * Takes a uci description of a move and uses it to move a piece, then updates the moveCounter and sets the turn.
    * @param {String} uci - a two part description of the square from which a piece will move and the square it will move to.
    * @param {Boolean} [showSolution=false] - tells the function whether it is being used in a solution (needed to pass into setTurn).
    */
    moveFromUCI(uci, showSolution=false) {
        
        // splitting the uci into the square a piece will move from and where it will move to
        let from = uci[0] + uci[1]
        let to = uci[2] + uci[3]

        let fromPiece = this.pieceAtId(from);
        let pieceToTake = this.pieceAtId(to);

        // checks if the square to move to has a piece in it and if it does, take the piece
        if (pieceToTake.pieceCode != '') {
            taken.push([pieceToTake.piece, pieceToTake.colour]);
        }

        // if turn is not black, update the moveCounter and store the position in storedFens
        if (turn != black) {
            let counter = parseInt(document.getElementById("moveCounter").innerHTML.split(" ")[0]);
            storedFens.push([this.boardToFEN(), counter]);
        }

        // moving the pieces in the board model
        this.setPieceAtId(to, fromPiece);
        this.setPieceAtId(from, new Blank());


        if (turn == white) {
            turn = black;
        } else {
            turn = white;
        }

        // checks if pawn can be promoted, sets turn and resets the colours of all squares on the board
        this.checkForPromotion(to)
        this.setTurn(false, showSolution)
        this.resetSquares();
    }
    
    
    
    /** 
    * Generates a description of the board using Forsyth-Edwards' Notation.
    * @return {String} The FEN description of the board.
    */
    boardToFEN() {
        let fen = "";
        let piecePlacement = "";
        let move = "";
        
        // goes through every position on the chessboard
        for (let i = 0; i < this.chessboard.length; i++) {
            let row = this.chessboard[i]; 
            let blankInARow = 0;
            let rank = "";
            for (let j = 0; j < row.length; j++) {
                
                // checks if a piece is blank and if it is, increments the blankInARow variable
                if (row[j].piece == "blank") {
                    blankInARow++;
                    if (j == row.length - 1) {
                        rank += blankInARow;
                    }
                } else {
                    
                    // if piece isn't blank and blankInARow is bigger than 0 (ie there has been some blank squares but now there is a piece)
                    // then add blankInARow to rank
                    if (blankInARow > 0) {
                        rank += String(blankInARow);
                        blankInARow = 0;
                    }

                    // adding letters to the rank depending on pieces in the model
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

            // adding the rank to the final placement of the pieces on the board
            // using a "/" before the rank if not the first rank
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
        
        // putting every element of the FEN together
        fen = piecePlacement + "_" + move + "_-_-_0_1"
        return fen;
    }


    
    /** 
    * Goes through every piece in the board model and adds the piece code of that piece into the onscreen html board.
    */
    draw() {
        
        // traversing every piece on the board
        for (let i = 0; i < this.chessboard.length; i++) {
            let row = this.chessboard[i];
            for (let j = 0; j < row.length; j++) {
                
                // turning the column and row values into the coordinates or "id" of each square on the board
                let colLetter = String.fromCharCode(j + 97);
                let coordinates = colLetter + String(8 - i);
                
                // adding unicode to each square depending on piece and coordinates
                document.getElementById(coordinates).innerHTML = row[j].pieceCode;
                
                // making sure that the mouse doesn't look like it can select something while hovering over a blank square
                if (row[j].pieceCode != ''){
                    document.getElementById(coordinates).style.cursor = "pointer";
                } else {
                    document.getElementById(coordinates).style.cursor = "default";  // because moving a piece left a trail which seems selectable
                }
            }
        }
    }

    
    /** 
    * Splits the given id into column and row values and calls pieceAt with them.
    * @param {String} id - Chess coordinates for a square's position on a chessboard, e.g. "e4".
    * @return {Object} The piece that is on square with the given id
    */
    pieceAtId(id) {
        let [col, row] = colAndRowFromId(id);
        return this.pieceAt(row, col);
    }


    /** 
    * Returns the piece object kept in the model at the given row and column values.
    * @param {Integer} row - The row coordinate of the position.
    * @param {Integer} col - The column coordinate of the position.
    * @return {Object} The piece that is on the square with the given coordinates.
    */
    pieceAt(row, col) {
        return this.chessboard[8 - row][col - 1];
    }


    /** 
    * Splits the given id into column and row values and calls setPieceAt.
    * @param {String} id - Coordinates for a square's position on the board.
    * @param {Object} value - Instantiation of a piece object.
    */
    setPieceAtId(id, value) {
        let [col, row] = colAndRowFromId(id);
        this.setPieceAt(row, col, value);
    }


    /** 
    * Sets the piece at the row and column values given to be the given value.
    * @param {Integer} row - Row coordinate of posiiton.
    * @param {Integer} col - Column coordinate of position.
    * @param {Object} value - Instantiation of piece object.
    */
    setPieceAt(row, col, value) {
        this.chessboard[8 - row][col - 1] = value;
    }

    

    /** 
    * Sets the html element telling the user whose turn it is and manages playing of the AI against the user. 
    * Also updates the message to say who has won if it is checkmate.
    * @param {Boolean} [checkmate=false] - Optional variable to tell function if it is checkmate.
    * @param {Boolean} [showSolution=false] - Optional variable to tell funciton if showSolution has been called.
    */
    setTurn(checkmate=false, showSolution=false) {
        let turnElement = document.getElementById("turnToMove");
        if (!checkmate) {
            
            // sets the html element to white or black to move
            if (turn == white) {
                turnElement.innerHTML = "White to Move";
            } else {
                turnElement.innerHTML = "Black to Move";
                if (!showSolution) {
                    // if it's black to move then it calls autoPlayMove to make black's move
                    this.autoPlayMove();
                }   
            }
        } else {
            
            // disables the hint and solve buttons
            document.getElementById("hint").style = "pointer-events: none";
            document.getElementById("solve").style = "pointer-events: none";
            
            // removes the moveCounter
            let moveCounter = document.getElementById("moveCounter");
            moveCounter.parentNode.removeChild(moveCounter);
            
            // sets the checkmate message
            if (turn == white) {
                turnElement.innerHTML = "Checkmate! Black Wins!";
            } else {
                turnElement.innerHTML = "Checkmate! White Wins!";
            }
        }
    }
    

    /**
     * Calls the playNextMove function.
     */
    autoPlayMove() {
        (this.playPromise ?? Promise.resolve()).then(() => {
            this.playPromise = playNextMove(this.boardToFEN());
        });
    }

    
    /** 
    * Resets the colour of all squares on the board.
    */
    resetSquares() {
        
        // goes through every position on the board
        for (let i = 0; i < this.chessboard.length; i++) {
            let row = this.chessboard[i];
            for (let j = 0; j < row.length; j++) {

                let id = idFromColAndRow(j + 1, 8 - i);
                let div = document.getElementById(id);

                // checks to see if the square colour has been altered and if so, resets it
                if (div.className != "white1" && div.className != "black2") {
                    this.resetSquareColour(div);
                }
                
                // if the square has children with the class of highlighted, then remove them
                // this removes the green dots for showing where a piece can move
                if (div.lastChild) {
                    if (div.lastChild.className == "highlighted") {
                        div.lastChild.remove();
                    }
                }
            }
        }
    }

    
    /**
     * Sets check for player1 and player2.
     */
    checkCheckCheck() {
        player1.setCheck(board);
        player2.setCheck(board);
    }
    
    
    /** 
    * Checks if the row and column values provided are indeed on the board.
    * @param {Integer} row - The row coordinate of the position.
    * @param {Integer} col - The column coordinate of the position.
    * @return {Boolean} True if in board, false if not.
    */
    checkIfInBoard(row, col){
        // goes through every position on the board
        for (let i = 0; i < this.chessboard.length; i++) {
            let boardRow = this.chessboard[i];
            for (let j = 0; j < boardRow.length; j++) {
                
                // checks if the values match.
                if (8 - row == i && col - 1 == j) {
                    return true
                }
            }
        }
        return false
    }
    
    
    /** 
    * Checks if a piece is takeable or not.
    * @param {String} id - Id of piece to check.
    * @return {Boolean} True if takeable, false if not.
    */
    checkIfTakeable(id) {
        let [col, row] = colAndRowFromId(id);
        // goes through every value in takeableSquares
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

    
    /** 
    * Checks if the the king of a certain colour is in check.
    * @param {String} id - Id for king to check if in check.
    * @param {String} colour - The colour of the piece to check.
    * @return {Boolean} True if in check, false if not.
    */
    checkCheck(id, colour) {
        
        // goes through every position on the board
        for (let i = 0; i < this.chessboard.length; i++) {
            let row = this.chessboard[i];
            for (let j = 0; j < row.length; j++) {
                let coordinates = idFromColAndRow(j + 1, 8 - i);
                
                // checks if any pieces of the opposite colour are attacking the square id argument
                if (row[j].colour != colour) {
                    if (row[j].pieceCode != '') {
                        let [takeable, highlight] = row[j].getSquaresIgnoringCheck(board, coordinates);
                        
                        // checks if the square is under attack
                        if (takeable.includes(id) || highlight.includes(id)) {
                            this.attackingPiece = coordinates;
                            return true;
                        }
                    }
                }
            }
        }
        // resets the attackingPiece variable if neither player is in check
        if (!player1.inCheck && !player2.inCheck) {
            this.attackingPiece = "";
        }
        return false;
    }
    
    
    /** 
    * Checks if the square to be moved to is under attack.
    * @param {String} id - Id of square to move to.
    * @param {Boolean} [mate=false] - Optional variable, to tell function if checking for mate or not.
    * @return {Boolean} True if under attack, false if not.
    */
    checkSquareToMoveTo(id, mate=false) {
        let squareToMoveTo = this.pieceAtId(id);

        // goes through every position on the board
        for (let i = 0; i < this.chessboard.length; i++) {
            let row = this.chessboard[i];
            for (let j = 0; j < row.length; j++) {
                let coordinates = idFromColAndRow(j + 1, 8 - i);
                
                // if not checking for mate, then the attacking piece must be the opposite colour to the turn
                // but if checking for mate, then attacking piece must be opposite colour to defending piece
                if ((row[j].colour != turn && !mate) || (row[j].colour != squareToMoveTo.colour && mate)) {
                    if (row[j].pieceCode != '') {
                        
                        // checks if the square to move to has a piece and whether checking for mate
                        if (squareToMoveTo.pieceCode != '' && !mate) {
                            
                            // if so, check to see if the piece is being defended
                            let controlled = row[j].getControlledSquares(board, coordinates);
                            if (controlled.includes(id)) {
                                return true;
                            }
            
                        } else {
                            
                            // if square is empty, then check if it is being attacked by the piece being looked at
                            let [takeable, highlight] = row[j].getSquaresIgnoringCheck(board, coordinates);
                            if (takeable.includes(id) || highlight.includes(id)) {
                                
                                // if the piece is a king and function is checking for mate, then if king is undefended return true
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

    
    /** 
    * Checks if the piece at given id is being defended.
    * @param {String} id - Coordinates of a square's poition on the board.
    * @return {Boolean} True if defended, false if not
    */
    checkIfDefended(id) {
        let squareToMoveTo = this.pieceAtId(id);
        
        // goes through every position on the board
        for (let i = 0; i < this.chessboard.length; i++) {
            let row = this.chessboard[i];
            for (let j = 0; j < row.length; j++) {
                let coordinates = idFromColAndRow(j + 1, 8 - i);
                
                // checks if the piece colours match
                if (squareToMoveTo.colour == row[j].colour) {
                    if (row[j].pieceCode != '') {
                        let controlled = row[j].getControlledSquares(board, coordinates);
                        
                        // check if defended by friendly piece
                        if (controlled.includes(id)) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    
    /** 
    * Checks if making a move gets the player out of check.
    * @param {String} oldId - Coordinates of current position of piece on board.
    * @param {String} newId - Coordinates of potential new position of piece on board.
    * @return {Boolean} True if out of check and false if not.
    */
    getsOutOfCheck(oldId, newId) { 
        let outOfCheck = true;

        // sets piece to new position (temporarily)
        let piece = this.pieceAtId(oldId);
        let otherPiece = this.pieceAtId(newId);
        this.setPieceAtId(newId, piece);
        this.setPieceAtId(oldId, new Blank());

        // checks if either player in check after the new position
        if (player1.setCheck(this, true) || player2.setCheck(this, true)) {
            outOfCheck = !this.checkIfKingUnderAttack(turn);
        }
        
        // switch back to old position
        piece = this.pieceAtId(newId);
        this.setPieceAtId(oldId, piece);
        this.setPieceAtId(newId, otherPiece);

        // set check for both players
        this.checkCheckCheck()

        return outOfCheck;
    }
    

    /** 
    * Checks if the king for the chosen colour is under attack.
    * @param {String} colour - The colour of the king to check.
    * @return {Boolean} True if under attack, false if not.
    */
    checkIfKingUnderAttack(colour) {
        
        // goes through every position on the board
        for (let i = 0; i < this.chessboard.length; i++) {
            let row = this.chessboard[i];
            for (let j = 0; j < row.length; j++) {
                
                // finds the king of the correct colour
                if (row[j].piece == king && row[j].colour == colour) {
                    let coordinates = idFromColAndRow(j + 1, 8 - i);
                    
                    // if in check return true
                    if (this.checkCheck(coordinates, colour)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    
    /** 
    * Checks to see if the piece that is currently in check is in fact in checkmate.
    */
    checkForCheckmate() {
        if (checked != '') {
            let piece = this.pieceAtId(checked);
            
            // gets the positions which the piece covers
            let [takeable, highlight] = piece.getLegalSquares(this, checked);
            if (takeable.length == 0 && highlight.length == 0) {
                
                // checks if the checked king can move
                if (this.checkSquareToMoveTo(checked, true)) {
                    this.setTurn(true);
                }

            } else {

                // check if the king moving to any of the locations possible would get it out of check
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
    

    /** 
    * Checks if a piece is a pawn on the last row and if it is, calls promotePawn.
    * @param {String} id - the id of the piece to check if able to be promoted.
    */
    checkForPromotion(id) {
        let piece = this.pieceAtId(id);
        let [letter, number] = id.split("");
        
        // checks if piece is a pawn and whether it is on its last row
        if (piece.piece == pawn) {
            if ((piece.colour == white && number == 8) || (piece.colour == black && number == 1)) {
                this.promotePawn(id); 
             }
        }
    }
    
    
    /** 
    * Promotes a pawn into a queen.
    * @param {String} id - Id of the piece to be promoted
    */
    promotePawn(id) {
        let piece = this.pieceAtId(id);

        // promotes to white queen if white pawn or black queen if black pawn
        if (piece.colour == white) {
            this.setPieceAtId(id, new Queen(white, whiteQueenUni, queen)); 
        } else {
            this.setPieceAtId(id, new Queen(black, blackQueenUni, queen)); 
        }
    }


    
    /** 
    *  Function triggered when a square is clicked. Handles the highlighting and moving of pieces when a square is clicked.
    * @param {HTMLElement} div - the HTML element of the square clicked.
    */
    selectPiece(div) {
        if (turn != white) {return};

        // sets check for the players
        this.checkCheckCheck();

        let id = div.id;
        let [col, row] = colAndRowFromId(id);
        let position = this.pieceAtId(id)
        
        // checks if the piece selected is allowed to be selected or if it is a blank square, OR if the square is takeable
        if ((position.colour == turn || position.colour == null) || (this.takeableSquares.length > 0 && this.checkIfTakeable(id))) {

            // checks if a piece is not currently highlighted
            if (this.highlightedPiece == "") {
                
                // checks if non-emtpy square clicked
                if (position.pieceCode != '') {
                    
                    // checks if a piece is currently "selected" and if it is, then un-selects 
                    if (document.getElementsByClassName("selected")[0] !== undefined) {
                        this.unSelectSquare(document.getElementsByClassName("selected")[0]);
                    }
                    

                    this.selectSquare(div, id, true);
                    this.highlightedSquares = this.highlightAvailableSquares(id);
                    
                }
            
            // highlightedPiece is not empty
            } else {

                // checks if a piece is selected
                if (position.pieceCode != '') { 
                    
                    // checks if selected piece is the one currently selected
                    if (div.id == this.highlightedPiece) {
                        this.unSelectSquare(div, col, row);
                        this.unHighlightAvailableSquares(this.highlightedSquares);
                        if (this.takeableSquares.length != 0) {
                            this.makeUnTakeable();
                        }
                        
                    // piece selected is not currently selected    
                    } else {
                        let highlightedDiv = document.getElementById(this.highlightedPiece);
                        
                        // if you clicked on an enemy piece -> take it!!
                        if (position.colour != this.pieceAtId(this.highlightedPiece).colour) { 
                            this.takePiece(id);
                            this.draw();
                            if (this.takeableSquares.length != 0) {
                                this.makeUnTakeable();
                            }
                            this.unHighlightAvailableSquares(this.highlightedSquares);
                            this.unSelectSquare(highlightedDiv);
                        
                        // if clicked piece is not enemy piece (ie friendly piece), then unselect currently selected piece
                        // and select the new piece
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
                    
                    // checks if the square has a green dot (ie is a legal move for the currently highighted piece)
                    if (div.lastChild) {
                        
                        // un-highlights any squares that are moveable to or pieces that are takeable
                        this.unHighlightAvailableSquares(this.highlightedSquares);
                        if (this.takeableSquares.length != 0) {
                            this.makeUnTakeable();
                        }
                        
                        // moves the piece
                        this.movePiece(this.highlightedPiece, id);
                        this.draw();
                    }
                } 
            }
        }
    }

    /** 
    * Highlights a square as selected.
    * @param {HTMLElement} div - the HTML element of the square to become 'selected'.
    * @param {String} id - the id of the square to become 'selected'.
    * @param {Boolean} [clicked=fase] - optional variable to tell the function if the square has been clicked or not.
    */    
    selectSquare(div, id, clicked=false) {
        div.className = "selected";
        if (clicked) {
            this.highlightedPiece = id;
        }
    }

    
    /** 
    * Gives a square a green dot to show that the selected piece can move there.
    * @param {HTMLElementj} div - the HTML element of the square to become 'highlighted'.
    */
    highlightSquare(div) {
        let element = document.createElement("span");
        element.className = "highlighted";
        element.id = "dot";
        
        // adds the new element to the square
        div.appendChild(element);
    }
    
    
    /** 
    * Sets the class of the div to be "checked".
    * @param {String} id - the id of the div to be set as "checked".
    */
    makeChecked(id) {
        let div = document.getElementById(id);
        div.className = "checked"
    }


    /** 
    * Resets the colour of the chosen square unless checked.
    * @param {HTMLElement} highlightedDiv - the HTML element of the square to be de-selected.
    */
    unSelectSquare(highlightedDiv) {
        if (highlightedDiv.id != checked) {
            this.resetSquareColour(highlightedDiv)
        }
        this.highlightedPiece = "";
    }

    
    /** 
    * Resets the colour of the chosen square.
    * @param {HTMLElement} div - the HTML element of the square to have its colour reset
    */
    resetSquareColour(div) {
        let [col, row] = colAndRowFromId(div.id);
        
        // checks if the column is odd and row is even or if column is even and row is odd
        if ((col % 2 == 1 && row % 2 == 0) || (col % 2 == 0 && row % 2 == 1)) {
            div.className = "white1";
        } else {
            div.className = "black2";
        }
    }


    /** 
    * Removes the green dot from a highlighted square.
    * @param {HTMLElement} highlightedDiv - the HTML element of the square to have the green dot taken away
    */
    unHighlightSquare(highlightedDiv) {
        if (highlightedDiv.lastChild) {
            highlightedDiv.removeChild(highlightedDiv.lastChild);
        }
    }

        
    /** 
    * Finds all the possible moves for a piece and checks which ones are legal, calling appropriate methods to highlight
    * them on the board.
    * @param {String} id - the id of the piece to have its available squares to move to highlighted.
    * @return {Array} All the possible squares that can be moved to legally by the selected piece.
    */    
    highlightAvailableSquares(id) {
        let highlighted = [];
        let piece = this.pieceAtId(id);
        
        // checks if either player is in check and if it is their turn
        if ((player1.setCheck(this) && player1.colour == turn) || (player2.setCheck(this) && player2.colour == turn)) {
            let takeable = [];
            let highlight = [];
            
            // pawns are different becuase their getSquaresIgnoringCheck method looks for which squares they control
            // the king is different because it is in check
            if (piece.piece == pawn || piece.piece == king) {
                [takeable, highlight] = piece.getLegalSquares(this, id);
            } else {
                [takeable, highlight] = piece.getSquaresIgnoringCheck(this, id);
            }
            
            if (highlight.length != 0) {
                for (let i = 0; i < highlight.length; i++) {
                    
                    // checking if moving to that square gets the king out of check before displaying it as valid
                    if (this.getsOutOfCheck(this.highlightedPiece, highlight[i])) {
                        let div = document.getElementById(highlight[i]);
                        this.highlightSquare(div);
                        highlighted.push(colAndRowFromId(highlight[i]));
                    }
                }
            }
            if (takeable.length != 0) {
                
                // checks if it is possible to take the attacking piece
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
            let [takeable, highlight] = piece.getLegalSquares(this, id);
            if (highlight.length != 0) {
                for (let i = 0; i < highlight.length; i++) {

                    // needed to stop pieces that are pinned from moving
                    if (this.getsOutOfCheck(id, highlight[i])) { 
                        let div = document.getElementById(highlight[i]);
                        this.highlightSquare(div);
                        highlighted.push(colAndRowFromId(highlight[i]));
                    }
                }
            }
            if (takeable.length != 0) {
                for (let i = 0; i < takeable.length; i++) {

                    // needed to stop pieces that are pinned from moving
                    if (this.getsOutOfCheck(id, takeable[i])) { 
                        let div = document.getElementById(takeable[i]);
                        this.makeTakeable(div);
                    }
                }
            }
        }
        return highlighted;
    }


    /** 
    * Unhighlights all the squares that are currently highlighted.
    * @param {Array} squares - array of squares that are highlighted
    */
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

    
    /** 
    * Moves a piece to a location for when a user plays (not an AI).
    * @param {String} from - the id of the square the piece is travelling from.
    * @param {String} to - the id of the square the piece is travelling to.
    */
    movePiece(from, to) {
        let [col, row] = colAndRowFromId(to);

        for (let i = 0; i < this.highlightedSquares.length; i++) {
            
            // checks that the destination square is in the highlightedSquares array
            if (col == this.highlightedSquares[i][0] && row == this.highlightedSquares[i][1]) {
                
                // stores the current state and counter, and resets the forward stack
                let counter = parseInt(document.getElementById("moveCounter").innerHTML.split(" ")[0]);
                storedFens.push([this.boardToFEN(), counter]);
                loadedFens = [];

                // moves the selected piece to its new location
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
    

    /** 
    * Makes a square have the "takeable" class.
    * @param {HTMLElement} div - the html element to be made takeable.
    */    
    makeTakeable(div) {
        div.className = "takeable";
        this.takeableSquares.push(colAndRowFromId(div.id));
    }

    
    /** 
    * Makes all squares that are takeable un-takeable.
    */
    makeUnTakeable() {
        
        // goes through all squares that are takeable
        for (let i = 0; i < this.takeableSquares.length; i++) {
            let [col, row] = this.takeableSquares[i];

            let colLetter = String.fromCharCode(col + 96);
            let coordinates = colLetter + String(row);
            let div = document.getElementById(coordinates);
            this.resetSquareColour(div);
        }
        this.takeableSquares = [];
    }
    
    
    /** 
    * Takes a piece and moves the piece doing the taking.
    * @param {String} id - position to move to.
    */
    takePiece(id) {
        let piece = this.pieceAtId(this.highlightedPiece);
        
        // checks that position to move to is takeable
        if (document.getElementById(id).className == "takeable") {
            
            // stores state of board and counter and resets forward stack
            let counter = parseInt(document.getElementById("moveCounter").innerHTML.split(" ")[0]);
            storedFens.push([this.boardToFEN(), counter]);
            loadedFens = [];

            // takes piece and moves selected piece to the location of id
            let pieceToTake = this.pieceAtId(id);
            taken.push([pieceToTake.piece, pieceToTake.colour]);
            this.setPieceAtId(id, piece);
            this.setPieceAtId(this.highlightedPiece, new Blank());
            this.highlightedPiece = "";
            
            
            // sets the turn
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


/**
* Parent piece class.
*/
class Piece {
     constructor(colour, pieceCode, piece) {
         
        // pieceCode used to store the unicode character for that piece
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
}


/**
* Blank piece on the board.
* @extends Piece
*/
class Blank extends Piece{
    constructor() {
        this.pieceCode = '';
        this.colour = null
        this.piece = "blank";
    }

    // needs to return null for times when every piece on the board has their getSquaresIgnoringCheck function called
    getSquaresIgnoringCheck(board, id) {
         return null;
    }
}


/**
* Pawn piece class.
* @extends Piece
*/
class Pawn extends Piece {
    constructor(colour, pieceCode, piece) {
        super(colour, pieceCode, piece)
        this.piece = piece;
    }

    
    /** 
    * Finds every possible square for a piece to move to, whether legal or not.
    * @param {String} id - Position of pawn on the board.
    * @return {Array} All possible squares that can be moved to.
    */
    getSquares(id) {
        let squares = [];
        let [col, row] = colAndRowFromId(id);

        if (this.colour == black) {
            squares.push([col, row - 1]);
            
            // if on starting row, can move two squares at a time
            if (row == 7) {
                squares.push([col, row - 2]);
            }

            // diagonal moves
            squares.push([col - 1, row -  1]);
            squares.push([col + 1, row -  1]);
        } else {
            squares.push([col, row + 1]);

            // if on starting row, can move two squares at a time
            if (row == 2) {
                squares.push([col, row + 2]);
            }
            
            // diagonal moves
            squares.push([col - 1, row + 1]);
            squares.push([col + 1, row + 1]);
        }
        return squares;
    }


    
    /** 
    * Turns a list of all possible squares into a list of only the legal squares the pawn can move to.
    * @param {Object} board - Instantiation of board class used for handling model etc.
    * @param {String} id - Position of pawn on the board.
    * @return {Array} Takeable is list of positions to move to take a piece and highlight is list of positions to move to normally
    */
    getLegalSquares(board, id) {
        let squares = this.getSquares(id);
        let takeable = [];
        let highlight = [];
        let [selectedCol, selectedRow] = colAndRowFromId(id);

        // goes through every position in squares
        for (let i = 0; i < squares.length; i++) {
            let [col, row] = squares[i];
            
            // ensures the position is on the board
            if (board.checkIfInBoard(row, col)) {
                let coordinates = idFromColAndRow(col, row);
                let piece = board.pieceAt(row, col);
                
                // checks for being able to take diagonally
                if (col != selectedCol) {
                    if (piece.pieceCode != "" && piece.colour != this.colour) {
                        takeable.push(coordinates);
                    }
                } else {
                    if (piece.pieceCode == "") {
                        highlight.push(coordinates);
                    } else {

                        // stops pawns from hopping over pieces to go behind them when on first rank
                        if (squares[i + 1]) { 
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

    
    /** 
    * Calls getControlledSquares as it needs to get the squares controlled by the pawn.
    * @param {Object} board - Instantiation of the board object.
    * @param {String} id - Position of the pawn.
    * @return {Array} Array with return from function call and empty array to fulfil checks done on the function when called.
    */
    getSquaresIgnoringCheck(board, id) {
        return [this.getControlledSquares(board, id), []];
    }

    
    /** 
    * Returns the squares controlled by the pawn.
    * @param {Object} board - Instantiation of the board object.
    * @param {String} idj - Position of the pawn.
    * @return {Array} Controlled squares.
    */
    getControlledSquares(board, id) {
        let controlled = [];
        let [selectedCol, selectedRow] = colAndRowFromId(id);
        let squares = this.getSquares(id);
        for (let i = 0; i < squares.length; i++) {
            let [col, row] = squares[i];
            
            // checks if square is in board and also is diagonal from the position of the pawn
            if (board.checkIfInBoard(row, col) && col != selectedCol) {
                controlled.push(idFromColAndRow(col, row));
            }
        }
        return controlled;
    }
}



/**
* Rook class
* @extends Piece
*/
class Rook extends Piece {
    constructor(colour, pieceCode, piece) {
        super(colour, pieceCode, piece)
    }

    /** 
    * Gets all squares the rook can move to.
    * @param {String} id - Position of rook.
    * @return {Array} The squares the rook can move to.
    */
    getSquares(id) {
        let squares = [];
        let [col, row] = colAndRowFromId(id);
        
        // rook can move 8 squares up, down, left and right
        for (let i = 1; i < 8; i++) {
            squares.push([col + i, row]);
            squares.push([col - i, row]);
            squares.push([col, row + i]);
            squares.push([col, row - i]);
        }
        return squares
    }

    
    /** 
    * Turns a list of all possible squares to move to, to just legal squares to move to.
    * @param {Object} board - Instantiation of board class.
    * @param {String} id - Position of rook.
    * @param {Boolean} [controlled=false] - Optional variable to tell the function if finding squares that the rook controls.
    * @return {Array} Takeable and highlight arrays for where the rook can move.
    */
    getLegalSquares(board, id, controlled=false) {
        let squares = this.getSquares(id);
        let takeable = [];
        let highlight = [];
        let [selectedCol, selectedRow] = colAndRowFromId(id);
        
        // goes through all squares that can be moved to
        for (let i = 0; i < squares.length; i++) {
            let [col, row] = squares[i];
            
            // checks if square is in board
            if (board.checkIfInBoard(row, col)) {
                let coordinates = idFromColAndRow(col, row);
                let piece = board.pieceAt(row, col);
                
                // checks if there is a piece in that position and if so, checks if it a piece of the opposite colour 
                // if looking for place to move, or checks if its the same colour if looking for pieces the rook controls
                if (piece.pieceCode != "" && ((piece.colour != this.colour && !controlled) || (piece.colour == this.colour && controlled))) {

                    // if so, adds position to takeable array
                    takeable.push(coordinates);
                    
                    // checks where the piece is then removes all positions behind the piece
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
                    
                    // adds free square to highlight array
                    highlight.push(coordinates);
                } else {
                    
                    // checks where the piece is then removes all positions behind the piece
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


    /** 
    * Calls getLegalSquares.
    * @param {Object} board - Instantiation of board class.
    * @param {String} id - Position of rook.
    * @return {Array} The return from getLegalSquares.
    */
    getSquaresIgnoringCheck(board, id) {
        return this.getLegalSquares(board, id);
    }
    
    
    /** 
    * Turns takeable and highlight from getLegalSquares into one array.
    * @param {Object} board - Instantiation of board class.
    * @param {String} id - Position of rook.
    * @return {Array} Takeable and highlight concatenated into one array.
    */
    getControlledSquares(board, id) {
        let [takeable, highlight] = this.getLegalSquares(board, id, true); 
        return takeable.concat(highlight); 
    }

}


/**
* Knight class.
* @extends Piece
*/
class Knight extends Piece {
    constructor(colour, pieceCode, piece) {
        super(colour, pieceCode, piece)
    }

    
    /** 
    * Gets all squares the knight can move to.
    * @param {String} id - Position of knight.
    * @return {Array} The squares the knight can move to.
    */
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

    
    /** 
    * Turns a list of all possible squares to move to, to just legal squares to move to.
    * @param {Object} board - Instantiation of board class.
    * @param {String} id - Position of knight.
    * @param {Boolean} [controlled=false] - Optional variable to tell the function if finding squares that the knight controls.
    * @return {Array} Takeable and highlight arrays for where the knight can move.
    */
    getLegalSquares(board, id, controlled=false) {
        let squares = this.getSquares(id);
        let takeable = [];
        let highlight = [];

        // goes through all squaresj
        for (let i = 0; i < squares.length; i++) {
            let [col, row] = squares[i];
            
            // checks if position is on the board
            if (board.checkIfInBoard(row, col)) {
                let coordinates = idFromColAndRow(col, row);
                let piece = board.pieceAt(row, col);
                
                // checks if there is a piece in that position and if so, checks if it a piece of the opposite colour 
                // if looking for place to move, or checks if its the same colour if looking for pieces the knight controls
                if (piece.pieceCode != "" && ((piece.colour != this.colour && !controlled) || (piece.colour == this.colour && controlled))) { 
                    takeable.push(coordinates);
                } else if (piece.pieceCode == "") {
                    highlight.push(coordinates);
                }
            }
        }

        return [takeable, highlight]
    }

    
    /** 
    * Calls getLegalSquares.
    * @param {Object} board - Instantiation of board class.
    * @param {String} id - Position of knight. 
    * @return {Array} Result from getLegalSquares.
    */
    getSquaresIgnoringCheck(board, id) {
        return this.getLegalSquares(board, id);
    }

    
    /** 
    * Returns result of getLegalSquares as one array.
    * @param {Object} board - Instantiation of board class.
    * @param {String} id - Position of knight. 
    * @return {Array} Result of getLegalSquares as one array.
    */
    getControlledSquares(board, id) {
        let [takeable, highlight] = this.getLegalSquares(board, id, true); 
        return takeable.concat(highlight); 
    }

}
/**
* Bishop class.
* @extends Piece
*/
class Bishop extends Piece {
    constructor(colour, pieceCode, piece) {
        super(colour, pieceCode, piece)
    }

    
    /** 
    * Gets all squares the bishop can move to.
    * @param {String} id - Position of bishop.
    * @return {Array} The squares the bishop can move to.
    */
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

    
    /** 
    * Turns a list of all possible squares to move to, to just legal squares to move to.
    * @param {Object} board - Instantiation of board class.
    * @param {String} id - Position of bishop.
    * @param {Boolean} [controlled=false] - Optional variable to tell the function if finding squares that the bishop controls.
    * @return {Array} Takeable and highlight arrays for where the bishop can move.
    */
    getLegalSquares(board, id, controlled=false) {
        let squares = this.getSquares(id);
        let takeable = [];
        let highlight = [];
        let [selectedCol, selectedRow] = colAndRowFromId(id);
        
        // goes through all squares
        for (let i = 0; i < squares.length; i++) {
            let [col, row] = squares[i];
            
            // checks if position on board
            if (board.checkIfInBoard(row, col)) {
                let coordinates = idFromColAndRow(col, row);
                let piece = board.pieceAt(row, col);

                // checks if there is a piece in that position and if so, checks if it a piece of the opposite colour 
                // if looking for place to move, or checks if its the same colour if looking for pieces the bishop controls
                if (piece.pieceCode != "" && ((piece.colour != this.colour && !controlled) || (piece.colour == this.colour && controlled))) {
                    takeable.push(coordinates);
                } else if (piece.pieceCode == "") {
                    highlight.push(coordinates);
                    continue;
                }

                // checks where the piece is then removes all positions behind the piece
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

    
    /** 
    * Calls getLegalSquares.
    * @param {Object} board - Instantiation of board class.
    * @param {String} id - Position of bishop. 
    * @return {Array} Result from getLegalSquares.
    */
    getSquaresIgnoringCheck(board, id) {
        return this.getLegalSquares(board, id);
    }


    /** 
    * Returns result of getLegalSquares as one array.
    * @param {Object} board - Instantiation of board class.
    * @param {String} id - Position of bishop. 
    * @return {Array} Result of getLegalSquares as one array.
    */
    getControlledSquares(board, id) {
        let [takeable, highlight] = this.getLegalSquares(board, id, true); 
        return takeable.concat(highlight); 
    }
}


/**
* Queen class.
* @extends Piece
*/
class Queen extends Piece {
    constructor(colour, pieceCode, piece) {
        super(colour, pieceCode, piece)
    }

    
    /** 
    * Gets all squares the bishop can move to.
    * @param {String} id - Position of bishop.
    * @return {Array} The squares the bishop can move to.
    */
    getSquares(id) {
        let squares = [];
        let [col, row] = colAndRowFromId(id);

        // queen can move in any direction for max 8 squares
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


    /** 
    * Turns a list of all possible squares to move to, to just legal squares to move to.
    * @param {Object} board - Instantiation of board class.
    * @param {String} id - Position of queen.
    * @param {Boolean} [controlled=false] - Optional variable to tell the function if finding squares that the queen controls.
    * @return {Array} Takeable and highlight arrays for where the queen can move.
    */
    getLegalSquares(board, id, controlled=false) {
        let squares = this.getSquares(id);
        let takeable = [];
        let highlight = [];
        let [selectedCol, selectedRow] = colAndRowFromId(id);

        // goes through all squares
        for (let i = 0; i < squares.length; i++) {
            let [col, row] = squares[i];
            
            // checks if position on the board
            if (board.checkIfInBoard(row, col)) {
                let coordinates = idFromColAndRow(col, row);
                let piece = board.pieceAt(row, col);

                // checks if there is a piece in that position and if so, checks if it a piece of the opposite colour 
                // if looking for place to move, or checks if its the same colour if looking for pieces the queen controls
                if (piece.pieceCode != "" && ((piece.colour != this.colour && !controlled) || (piece.colour == this.colour && controlled))) {
                    takeable.push(coordinates);

                } else if (piece.pieceCode == "") {
                    highlight.push(coordinates);
                    continue;
                }

                // checks where the piece is then removes all positions behind the piece
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

    /** 
    * Calls getLegalSquares.
    * @param {Object} board - Instantiation of board class.
    * @param {String} id - Position of queen. 
    * @return {Array} Result from getLegalSquares.
    */
    getSquaresIgnoringCheck(board, id) {
        return this.getLegalSquares(board, id);
    }


    /** 
    * Returns result of getLegalSquares as one array.
    * @param {Object} board - Instantiation of board class.
    * @param {String} id - Position of queen. 
    * @return {Array} Result of getLegalSquares as one array.
    */
    getControlledSquares(board, id) {
        let [takeable, highlight] = this.getLegalSquares(board, id, true); 
        return takeable.concat(highlight); 
    }
}

/**
* King class.
* @extends Piece
*/
class King extends Piece {
    constructor(colour, pieceCode, piece) {
        super(colour, pieceCode, piece)
    }

    
    /** 
    * Gets all squares the king can move to.
    * @param {String} id - Position of king.
    * @return {Array} The squares the king can move to.
    */
    getSquares(id) {
        let squares = [];
        let [col, row] = colAndRowFromId(id);

        // king can move in any direction but only by one square
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
    

    /** 
    * Turns array of possible squares into array of squares the king can legally move to.
    * @param {Object} board - Instantiation of board class.
    * @param {String} id - Position of king.    
    * @return {Array} Takeable and highlight arrays for where the king can move.
    */
    getLegalSquares(board, id) {
        let squares = this.getSquares(id);
        let takeable = [];
        let highlight = [];

        // goes through all squares
        for (let i = 0; i < squares.length; i++) {
            let [col, row] = squares[i];
            
            // checks if position is on the board
            if (board.checkIfInBoard(row, col)) {
                let piece = board.pieceAt(row, col);
                let coordinates = idFromColAndRow(col, row);
                
                // makes sure the move won't put the king in check
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

    /** 
    * Turns a list of all possible squares to move to, to just legal squares to move to, ignoring check.
    * @param {Object} board - Instantiation of board class.
    * @param {String} id - Position of king.
    * @param {Boolean} [controlled=false] - Optional variable to tell the function if finding squares that the king controls.
    * @return {Array} Takeable and highlight arrays for where the king can move.
    */
    getSquaresIgnoringCheck(board, id, controlled=false) {
        let squares = this.getSquares(id);
        let takeable = [];
        let highlight = [];
        
        // goes through all squares
        for (let i = 0; i < squares.length; i++) {
            let [col, row] = squares[i];
            
            // checks if position is on the board
            if (board.checkIfInBoard(row, col)) {
                let piece = board.pieceAt(row, col);
                let coordinates = idFromColAndRow(col, row);
                
                // checks if there is a piece in that position and if so, checks if it a piece of the opposite colour 
                // if looking for place to move, or checks if its the same colour if looking for pieces the king controls
                if (piece.pieceCode != "" && ((piece.colour != this.colour && !controlled) || (piece.colour == this.colour && controlled))) {
                    takeable.push(coordinates);
                } else if (piece.pieceCode == "") {
                    highlight.push(coordinates);
                }
            }
        }
        return [takeable, highlight]
    }
    

    /** 
    * Returns result of getSquaresIgnoringCheck as one array.
    * @param {Object} board - Instantiation of board class.
    * @param {String} id - Position of king. 
    * @return {Array} Result of getSquaresIgnoringCheck as one array.
    */
    getControlledSquares(board, id) {
        let [takeable, highlight] = this.getSquaresIgnoringCheck(board, id, true); 
        return takeable.concat(highlight); 
    }



}

// Instantiation of players
const player1 = new Player(white);
const player2 = new Player(black);

let chessboard = [];

// generating a chessboard full of blank pieces
for (let i = 0; i < 8; i++) {
    let row = [];
    for (let j = 0; j < 8; j++) {
        row.push(new Blank());
    }
    chessboard.push(row);
}


// instantiating the board class and drawing the board state
const board = new Board(chessboard);
board.draw()
