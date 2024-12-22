/*  
Issues to solve:
//1. Piece resets on next mouse click after move (could be retaining previous value) -- DONE (adding once to mouseup listener)
//2. in switch case, i have harcoded values, need to make them dynamic -- DONE
//3. it loses whos turn it is after a few newTurn functions -- dont think this happens when it is referenced at end of move function
//4. Seems to the mouseup function multiple times on second run -- DONE (adding once to mouseup listener)
//5. when piece moves for second time, putting it back in the same spot changes turn -- DONE (added a line in endTurn that sets available back to 0 for all squares) 
//6. moved = true is not bypassing the pawn 2 spaces check -- DONE 
//7. code for taking a piece -- DONE
8. stop wrapping at edges of board -- Done for pawns -- squareNumber % 8 for columns , Math.floor(squareNumber/8) for rows , cant be greater than 64 or less than 1
9. New Game keeps flashing and allows moving 
10. Queen gets stuck on some spaces -- DONE downleft and downright were < 0 rather than <= 0


Still to Do:
1. add log -- DONE
2. pawn promotion to queen 
3. Knight movement -- DONE
4. check check 
5. checkmate
6. Castling -- DONE but if more than 1 castling available at once then will break
7. timer

*/


let turn;
let turnCount = 0;
let flashInterval;
let flashSquareInterval;
let flashMoves = [];
let flashCurrent;
let castleNum;



function newGame() {
    //Confirm if sure
    let clearGame = confirm("Are you sure?")

    if (!clearGame) {
        return;
    }
    
    //clear Interval
    clearInterval(flashInterval);
    clearInterval(flashSquareInterval);
    clearInterval(flashMoves);


    //reset turnCount
    turnCount = 0;

    //reset timer

    //clear log
    gameLog.innerText = '';


    //reset board

    wPieces = document.querySelectorAll('[id^="w"]')
    for (piece of wPieces) {
        piece.style.position = "relative";
        piece.style.left = "5px";
        piece.style.top = "5px";
        document.getElementById(piece.id).setAttribute('data-available','false')
        document.getElementById(piece.id).setAttribute('data-moved','false')
    };

    bPieces = document.querySelectorAll('[id^="b"]')
    for (piece of bPieces) {
        piece.style.position = "relative";
        piece.style.left = "5px";
        piece.style.top = "5px";
        document.getElementById(piece.id).setAttribute('data-available','false')
        document.getElementById(piece.id).setAttribute('data-moved','false')
    };


    A8.append(bRook1);
    B8.append(bKnight1);
    C8.append(bBishop1);
    D8.append(bQueen);
    E8.append(bKing);
    F8.append(bBishop2);
    G8.append(bKnight2);
    H8.append(bRook2);

    A7.append(bPawn1);
    B7.append(bPawn2);
    C7.append(bPawn3);
    D7.append(bPawn4);
    E7.append(bPawn5);
    F7.append(bPawn6);
    G7.append(bPawn7);
    H7.append(bPawn8);

    A2.append(wPawn1);
    B2.append(wPawn2);
    C2.append(wPawn3);
    D2.append(wPawn4);
    E2.append(wPawn5);
    F2.append(wPawn6);
    G2.append(wPawn7);
    H2.append(wPawn8);

    A1.append(wRook1);
    B1.append(wKnight1);
    C1.append(wBishop1);
    D1.append(wQueen);
    E1.append(wKing);
    F1.append(wBishop2);
    G1.append(wKnight2);
    H1.append(wRook2);

}

function endTurn() {

    //clear everything
    clearInterval(flashInterval);
    clearInterval(flashSquareInterval);
    clearFlashMoves(flashMoves);
    flashMoves = [];

    //put all spaces back to available = no

    let allSquares = [];

    let white = document.getElementsByClassName('whiteSquare');
    let black = document.getElementsByClassName('blackSquare');

    for (let ws of white) {
        allSquares.push(ws)
    };

    for (let bs of black) {
        allSquares.push(bs)
    };
    
    for (let squares of allSquares) {
        
        document.getElementById(squares.id).setAttribute('data-available','false')
    }

    //true = white, false = black 
    if (turn) {
        turn = false;
    } else if (!turn) {
        turn = true;
    };
    checkCastle();
    newTurn();
}

function newTurn() { 


    //add turnCount
    turnCount++

    // Is it turn 1 (white goes first)
    if (turnCount == 1) {
        turn = true;
    };

    //highlight spaces with pieces
    flashTurn(turn)
    flashInterval = setInterval(flashTurn, 3000, turn)

    movingPiece();

}

function flashTurn(turn) {
    // let all selectable pieces flash
    if (turn) {
        let wPieces = document.querySelectorAll('[id^="w"]')
        for (piece of wPieces) {
        piece.style.backgroundColor = "red";
        };

        setTimeout(() => {
            for (piece of wPieces) {
                piece.style.backgroundColor = "white";
            };
        }, 1500)
    } else {
        let bPieces = document.querySelectorAll('[id^="b"]')
        for (piece of bPieces) {
        piece.style.backgroundColor = "red";
        };

        setTimeout(() => {
            for (piece of bPieces) {
                piece.style.backgroundColor = "white";
            };
        }, 1500) 
    };
}


function movingPiece() {
    let safety = false;
    //pick up piece


    function onMouseDown(e) {


        let location = document.elementFromPoint(e.clientX, e.clientY).id
        let pieceToPickUp = document.getElementById(location);
        let startSquareId = pieceToPickUp.parentElement.id;
        let startSquareClass = pieceToPickUp.parentElement.className;

        //only pick up correct color piece
        if (turn && location.startsWith('w') || !turn && location.startsWith('b')) {
            
            clearInterval(flashInterval)

            let shiftX = e.clientX - pieceToPickUp.getBoundingClientRect().left;
            let shiftY = e.clientY - pieceToPickUp.getBoundingClientRect().top;

            pieceToPickUp.style.position = 'absolute';
            pieceToPickUp.style.zIndex = 1000;

            document.body.append(pieceToPickUp);

            moveAt(e.pageX, e.pageY);

            function moveAt(pageX, pageY) {
                pieceToPickUp.style.left = pageX - shiftX + 'px';
                pieceToPickUp.style.top = pageY - shiftY + 'px';
            };
            safety = true;

        } else return;

        //flash current square
        flashSquare(startSquareId, startSquareClass);
        flashCurrent = setInterval(flashSquare, 3000, startSquareId, startSquareClass)
        flashMoves.push(flashCurrent);

        let squareNumber = document.getElementById(startSquareId).getAttribute('data-numbered')

        //switch case to show available squares
        switch(pieceToPickUp.id.slice(0,5)) {

            case 'wPawn':
                
            {
                //check if it can take a piece
                let canTake = +squareNumber + 7;
                let canTake2 = +squareNumber + 9;

                //prevents wrap around at top of board
                if (canTake <= 64) {

                    let takeSquare = document.querySelector(`[data-numbered="${canTake}"]`);
                    let takeSquareId = takeSquare.id;
                    let takeSquareClass = takeSquare.className;

                    if (takeSquare.firstChild != null && (canTake % 8) != 0) {
                        if (takeSquare.firstChild.className === "bPiece") {
                            flashSquare(takeSquareId, takeSquareClass);
                            let flashMoves5 = setInterval(flashSquare, 3000, takeSquareId, takeSquareClass);
                            flashMoves.push(flashMoves5);
                            document.getElementById(takeSquareId).setAttribute('data-available','take')
                        }
                    };
                };

                if (canTake2 <= 64) {
                    
                    let takeSquare2 = document.querySelector(`[data-numbered="${canTake2}"]`);
                    let takeSquareId2 = takeSquare2.id;
                    let takeSquareClass2 = takeSquare2.className;
                    
                    if (takeSquare2.firstChild != null && (canTake2 % 8) != 1) {
                        if (takeSquare2.firstChild.className === "bPiece") {
                            flashSquare(takeSquareId2, takeSquareClass2);
                            let flashMoves6 = setInterval(flashSquare, 3000, takeSquareId2, takeSquareClass2);
                            flashMoves.push(flashMoves6);
                            document.getElementById(takeSquareId2).setAttribute('data-available','take')
                        }
                    };
                };

                //details of movable square
                let otherflash = +squareNumber + 8;
                let n;
                if (otherflash <= 64) {
                    
                    n = document.querySelector(`[data-numbered="${otherflash}"]`);
                    let newSquareID = n.id;
                    let newSquareClass = n.className;

                    if(!(n.firstChild)) {
                        flashSquare(newSquareID, newSquareClass);
                        let flashMoves2 = setInterval(flashSquare, 3000, newSquareID, newSquareClass);
                        flashMoves.push(flashMoves2);

                        //mkae available = true
                        document.getElementById(newSquareID).setAttribute('data-available','true')
                    };
                };

                //Move Pawn 2 squares on first move for Pawn if there isnt a piece in the way
                if (document.getElementById(pieceToPickUp.id).getAttribute('data-moved') == 'false' && !(n.firstChild)) {

                    //details of movable square
                    let newSquare1 = +squareNumber + 16;
                    let n1 = document.querySelector(`[data-numbered="${newSquare1}"]`);
                    let newSquareID1 = n1.id;
                    let newSquareClass1 = n1.className;

                    flashSquare(newSquareID1, newSquareClass1);
                    let flashMoves1 = setInterval(flashSquare, 3000, newSquareID1, newSquareClass1);
                    flashMoves.push(flashMoves1);

                    //make square available = true
                    document.getElementById(newSquareID1).setAttribute("data-available","true")



                };

            };        

                break;
            

            case 'bPawn':

            {

                //check if it can take a piece
                let canTake3 = +squareNumber - 7;
                let canTake4 = +squareNumber - 9;

                if (canTake3 >= 1) {

                    let takeSquare3 = document.querySelector(`[data-numbered="${canTake3}"]`);
                    let takeSquareId3 = takeSquare3.id;
                    let takeSquareClass3 = takeSquare3.className;
                    
                    if (takeSquare3.firstChild != null && (canTake3 % 8) != 1) {
                        if (takeSquare3.firstChild.className === "wPiece") {
                            flashSquare(takeSquareId3, takeSquareClass3);
                            let flashMoves7 = setInterval(flashSquare, 3000, takeSquareId3, takeSquareClass3);
                            flashMoves.push(flashMoves7);
                            document.getElementById(takeSquareId3).setAttribute('data-available','take')
                        }
                    };
                };

                if (canTake4 >= 1) {

                    let takeSquare4 = document.querySelector(`[data-numbered="${canTake4}"]`);
                    let takeSquareId4 = takeSquare4.id;
                    let takeSquareClass4 = takeSquare4.className;

                    if (takeSquare4.firstChild != null && (canTake4 % 8) != 0) {
                        if (takeSquare4.firstChild.className === "wPiece") {
                            flashSquare(takeSquareId4, takeSquareClass4);
                            let flashMoves8 = setInterval(flashSquare, 3000, takeSquareId4, takeSquareClass4);
                            flashMoves.push(flashMoves8);
                            document.getElementById(takeSquareId4).setAttribute('data-available','take')
                        }
                    };
                };

                //details of movable square
                let otherflash3 = +squareNumber - 8;
                let n3;

                if (otherflash3 >= 0) {

                    n3 = document.querySelector(`[data-numbered="${otherflash3}"]`)
                    let newSquareID3 = n3.id;
                    let newSquareClass3 = n3.className;

                    if (!(n3.firstChild)) {

                        flashSquare(newSquareID3, newSquareClass3);
                        let flashMoves3 = setInterval(flashSquare, 3000, newSquareID3, newSquareClass3);
                        flashMoves.push(flashMoves3);

                        //mkae available = true
                        document.getElementById(newSquareID3).setAttribute('data-available','true')
                    };

                };

                //Move Pawn 2 squares on first move for Pawn
                if (document.getElementById(pieceToPickUp.id).getAttribute('data-moved') == 'false' && !(n3.firstChild)) {

                    //details of movable square
                    let newSquare1 = +squareNumber - 16;
                    let n1 = document.querySelector(`[data-numbered="${newSquare1}"]`)
                    let newSquareID1 = n1.id;
                    let newSquareClass1 = n1.className;

                    flashSquare(newSquareID1, newSquareClass1);
                    let flashMoves1 = setInterval(flashSquare, 3000, newSquareID1, newSquareClass1);
                    flashMoves.push(flashMoves1);

                    //make square available = true
                    document.getElementById(newSquareID1).setAttribute("data-available","true")

                };
            
            };

                break;

            case 'wRook':

                //right
                for (let i = 1 ; i < 8 ; i++) {

                    let rookSquare = +squareNumber - +i;
                    let rookColumn = rookSquare % 8 ;
                    if (rookColumn === 0) {break};
                    let rookDiv = document.querySelector(`[data-numbered="${rookSquare}"]`)
                    let rookSquareId = rookDiv.id;
                    let rookSquareClass = rookDiv.className;
 
                    //Break if piece in the way OR edge of board
                    if (rookDiv.firstChild) {

                        //check if piece can be taken
                        if (rookDiv.firstChild != null) {
                            if (rookDiv.firstChild.className === 'bPiece') {
                                flashSquare(rookSquareId, rookSquareClass);
                                let rookFlash = setInterval(flashSquare, 3000, rookSquareId, rookSquareClass);
                                flashMoves.push(rookFlash);
                                document.getElementById(rookSquareId).setAttribute("data-available","take")
                            }
                        }
                        break;
                    }

                    flashSquare(rookSquareId, rookSquareClass);
                    let rookFlash = setInterval(flashSquare, 3000, rookSquareId, rookSquareClass);
                    flashMoves.push(rookFlash);

                    //make square available
                    document.getElementById(rookSquareId).setAttribute("data-available","true")

                }

                //left
                for (let i = 1 ; i < 8 ; i++) {

                    let rookSquare = +squareNumber + +i;
                    let rookColumn = rookSquare % 8 ;
                    if (rookColumn === 1) { break };
                    let rookDiv = document.querySelector(`[data-numbered="${rookSquare}"]`)
                    let rookSquareId = rookDiv.id;
                    let rookSquareClass = rookDiv.className;

                    //Break if piece in the way
                    if (rookDiv.firstChild) {

                        //check if piece can be taken
                        if (rookDiv.firstChild != null) {
                            if (rookDiv.firstChild.className === 'bPiece') {
                                flashSquare(rookSquareId, rookSquareClass);
                                let rookFlash = setInterval(flashSquare, 3000, rookSquareId, rookSquareClass);
                                flashMoves.push(rookFlash);
                                document.getElementById(rookSquareId).setAttribute("data-available","take")
                            }
                        }
                        break;
                    }

                    flashSquare(rookSquareId, rookSquareClass);
                    let rookFlash = setInterval(flashSquare, 3000, rookSquareId, rookSquareClass);
                    flashMoves.push(rookFlash);

                    //make square available
                    document.getElementById(rookSquareId).setAttribute("data-available","true")

                }

                //down
                for (let i = 1 ; i < 8 ; i++) {

                    let rookSquare = +squareNumber - +(i * 8);
                    if (rookSquare < 1) { break };
                    let rookDiv = document.querySelector(`[data-numbered="${rookSquare}"]`)
                    let rookSquareId = rookDiv.id;
                    let rookSquareClass = rookDiv.className;

                    //Break if piece in the way
                    if (rookDiv.firstChild) {

                        //check if piece can be taken
                        if (rookDiv.firstChild != null) {
                            if (rookDiv.firstChild.className === 'bPiece') {
                                flashSquare(rookSquareId, rookSquareClass);
                                let rookFlash = setInterval(flashSquare, 3000, rookSquareId, rookSquareClass);
                                flashMoves.push(rookFlash);
                                document.getElementById(rookSquareId).setAttribute("data-available","take")
                            }
                        }
                        break;
                    }

                    flashSquare(rookSquareId, rookSquareClass);
                    let rookFlash = setInterval(flashSquare, 3000, rookSquareId, rookSquareClass);
                    flashMoves.push(rookFlash);

                    //make square available
                    document.getElementById(rookSquareId).setAttribute("data-available","true")


                };

                //up
                for (let i = 1 ; i < 8 ; i++) {

                    let rookSquare = +squareNumber + +(i * 8);
                    if (rookSquare > 64) { break };
                    let rookDiv = document.querySelector(`[data-numbered="${rookSquare}"]`)
                    let rookSquareId = rookDiv.id;
                    let rookSquareClass = rookDiv.className;

                    //Break if piece in the way
                    if (rookDiv.firstChild) {

                        //check if piece can be taken
                        if (rookDiv.firstChild != null) {
                            if (rookDiv.firstChild.className === 'bPiece') {
                                flashSquare(rookSquareId, rookSquareClass);
                                let rookFlash = setInterval(flashSquare, 3000, rookSquareId, rookSquareClass);
                                flashMoves.push(rookFlash);
                                document.getElementById(rookSquareId).setAttribute("data-available","take")
                            }
                        }
                        break;
                    }

                    flashSquare(rookSquareId, rookSquareClass);
                    let rookFlash = setInterval(flashSquare, 3000, rookSquareId, rookSquareClass);
                    flashMoves.push(rookFlash);

                    //make square available
                    document.getElementById(rookSquareId).setAttribute("data-available","true")


                };

                break;

            case 'bRook':

                //right
                for (let i = 1 ; i < 8 ; i++) {

                    let rookSquare = +squareNumber - +i;
                    let rookColumn = rookSquare % 8 ;
                    if (rookColumn === 0) { break };
                    let rookDiv = document.querySelector(`[data-numbered="${rookSquare}"]`)
                    let rookSquareId = rookDiv.id;
                    let rookSquareClass = rookDiv.className;
 
                    //Break if piece in the way OR edge of board
                    if (rookDiv.firstChild) {

                        //check if piece can be taken
                        if (rookDiv.firstChild != null) {
                            if (rookDiv.firstChild.className === 'wPiece') {
                                flashSquare(rookSquareId, rookSquareClass);
                                let rookFlash = setInterval(flashSquare, 3000, rookSquareId, rookSquareClass);
                                flashMoves.push(rookFlash);
                                document.getElementById(rookSquareId).setAttribute("data-available","take")
                            }
                        }
                        break;
                    }

                    flashSquare(rookSquareId, rookSquareClass);
                    let rookFlash = setInterval(flashSquare, 3000, rookSquareId, rookSquareClass);
                    flashMoves.push(rookFlash);

                    //make square available
                    document.getElementById(rookSquareId).setAttribute("data-available","true")

                }

                //left
                for (let i = 1 ; i < 8 ; i++) {

                    let rookSquare = +squareNumber + +i;
                    let rookColumn = rookSquare % 8 ;
                    if (rookColumn === 1) { break };
                    let rookDiv = document.querySelector(`[data-numbered="${rookSquare}"]`)
                    let rookSquareId = rookDiv.id;
                    let rookSquareClass = rookDiv.className;

                    //Break if piece in the way
                    if (rookDiv.firstChild) {

                        //check if piece can be taken
                        if (rookDiv.firstChild != null) {
                            if (rookDiv.firstChild.className === 'wPiece') {
                                flashSquare(rookSquareId, rookSquareClass);
                                let rookFlash = setInterval(flashSquare, 3000, rookSquareId, rookSquareClass);
                                flashMoves.push(rookFlash);
                                document.getElementById(rookSquareId).setAttribute("data-available","take")
                            }
                        }
                        break;
                    }

                    flashSquare(rookSquareId, rookSquareClass);
                    let rookFlash = setInterval(flashSquare, 3000, rookSquareId, rookSquareClass);
                    flashMoves.push(rookFlash);

                    //make square available
                    document.getElementById(rookSquareId).setAttribute("data-available","true")

                }

                //down
                for (let i = 1 ; i < 8 ; i++) {

                    let rookSquare = +squareNumber - +(i * 8);
                    //exit loop if off the board
                    if (rookSquare < 1){ break };
                    let rookDiv = document.querySelector(`[data-numbered="${rookSquare}"]`)
                    let rookSquareId = rookDiv.id;
                    let rookSquareClass = rookDiv.className;

                    //Break if piece in the way
                    if (rookDiv.firstChild) {

                        //check if piece can be taken
                        if (rookDiv.firstChild != null) {
                            if (rookDiv.firstChild.className === 'wPiece') {
                                flashSquare(rookSquareId, rookSquareClass);
                                let rookFlash = setInterval(flashSquare, 3000, rookSquareId, rookSquareClass);
                                flashMoves.push(rookFlash);
                                document.getElementById(rookSquareId).setAttribute("data-available","take")
                            }
                        }
                        break;
                    }

                    flashSquare(rookSquareId, rookSquareClass);
                    let rookFlash = setInterval(flashSquare, 3000, rookSquareId, rookSquareClass);
                    flashMoves.push(rookFlash);

                    //make square available
                    document.getElementById(rookSquareId).setAttribute("data-available","true")


                };

                //up
                for (let i = 1 ; i < 8 ; i++) {

                    let rookSquare = +squareNumber + +(i * 8);
                    if (rookSquare > 64) { break };
                    let rookDiv = document.querySelector(`[data-numbered="${rookSquare}"]`)
                    let rookSquareId = rookDiv.id;
                    let rookSquareClass = rookDiv.className;

                    //Break if piece in the way
                    if (rookDiv.firstChild) {

                        //check if piece can be taken
                        if (rookDiv.firstChild != null) {
                            if (rookDiv.firstChild.className === 'wPiece') {
                                flashSquare(rookSquareId, rookSquareClass);
                                let rookFlash = setInterval(flashSquare, 3000, rookSquareId, rookSquareClass);
                                flashMoves.push(rookFlash);
                                document.getElementById(rookSquareId).setAttribute("data-available","take")
                            }
                        }
                        break;
                    }

                    flashSquare(rookSquareId, rookSquareClass);
                    let rookFlash = setInterval(flashSquare, 3000, rookSquareId, rookSquareClass);
                    flashMoves.push(rookFlash);

                    //make square available
                    document.getElementById(rookSquareId).setAttribute("data-available","true")


                };

                break;

            case 'wBish':


                //up-right
                function upRightw(squareNumber) {
                    
                    let bishSquare = +squareNumber + 7
                    let bishColumn = bishSquare % 8;
                    if (bishSquare > 64 || bishColumn === 0) {return};

                    let bishDiv = document.querySelector(`[data-numbered="${bishSquare}"]`);
                    let bishSquareId = bishDiv.id;
                    let bishSquareClass = bishDiv.className;

                    if (bishDiv.firstChild) {

                        //check if piece can be taken
                        if (bishDiv.firstChild != null) {
                            if (bishDiv.firstChild.className === 'bPiece') {
                                flashSquare(bishSquareId, bishSquareClass);
                                let bishFlash = setInterval(flashSquare, 3000, bishSquareId, bishSquareClass);
                                flashMoves.push(bishFlash);
                                document.getElementById(bishSquareId).setAttribute("data-available","take")
                            }
                        }
                        return;
                    }

                    flashSquare(bishSquareId, bishSquareClass);
                    let bishFlash = setInterval(flashSquare, 3000, bishSquareId, bishSquareClass);
                    flashMoves.push(bishFlash);

                    //make square available
                    document.getElementById(bishSquareId).setAttribute("data-available","true")

                    upRightw(bishSquare);
                }

                upRightw(squareNumber);

                //down-right
                function downRightw(squareNumber) {
                    
                    let bishSquare = +squareNumber - 9
                    let bishColumn = bishSquare % 8;
                    if (bishSquare <= 0 || bishColumn === 0) {return};

                    let bishDiv = document.querySelector(`[data-numbered="${bishSquare}"]`);
                    let bishSquareId = bishDiv.id;
                    let bishSquareClass = bishDiv.className;

                    if (bishDiv.firstChild) {

                        //check if piece can be taken
                        if (bishDiv.firstChild != null) {
                            if (bishDiv.firstChild.className === 'bPiece') {
                                flashSquare(bishSquareId, bishSquareClass);
                                let bishFlash = setInterval(flashSquare, 3000, bishSquareId, bishSquareClass);
                                flashMoves.push(bishFlash);
                                document.getElementById(bishSquareId).setAttribute("data-available","take")
                            }
                        }
                        return;
                    }

                    flashSquare(bishSquareId, bishSquareClass);
                    let bishFlash = setInterval(flashSquare, 3000, bishSquareId, bishSquareClass);
                    flashMoves.push(bishFlash);

                    //make square available
                    document.getElementById(bishSquareId).setAttribute("data-available","true")

                    downRightw(bishSquare);
                }

                downRightw(squareNumber);

                //down-left
                function downLeftw(squareNumber) {
                    
                    let bishSquare = +squareNumber - 7
                    let bishColumn = bishSquare % 8;
                    if (bishSquare <= 0 || bishColumn === 1) {return};

                    let bishDiv = document.querySelector(`[data-numbered="${bishSquare}"]`);
                    let bishSquareId = bishDiv.id;
                    let bishSquareClass = bishDiv.className;

                    if (bishDiv.firstChild) {

                        //check if piece can be taken
                        if (bishDiv.firstChild != null) {
                            if (bishDiv.firstChild.className === 'bPiece') {
                                flashSquare(bishSquareId, bishSquareClass);
                                let bishFlash = setInterval(flashSquare, 3000, bishSquareId, bishSquareClass);
                                flashMoves.push(bishFlash);
                                document.getElementById(bishSquareId).setAttribute("data-available","take")
                            }
                        }
                        return;
                    }

                    flashSquare(bishSquareId, bishSquareClass);
                    let bishFlash = setInterval(flashSquare, 3000, bishSquareId, bishSquareClass);
                    flashMoves.push(bishFlash);

                    //make square available
                    document.getElementById(bishSquareId).setAttribute("data-available","true")

                    downLeftw(bishSquare);
                }

                downLeftw(squareNumber);

                //Up-left
                function upLeftw(squareNumber) {
                    
                    let bishSquare = +squareNumber + 9
                    let bishColumn = bishSquare % 8;
                    if (bishSquare > 64 || bishColumn === 1) {return};

                    let bishDiv = document.querySelector(`[data-numbered="${bishSquare}"]`);
                    let bishSquareId = bishDiv.id;
                    let bishSquareClass = bishDiv.className;

                    if (bishDiv.firstChild) {

                        //check if piece can be taken
                        if (bishDiv.firstChild != null) {
                            if (bishDiv.firstChild.className === 'bPiece') {
                                flashSquare(bishSquareId, bishSquareClass);
                                let bishFlash = setInterval(flashSquare, 3000, bishSquareId, bishSquareClass);
                                flashMoves.push(bishFlash);
                                document.getElementById(bishSquareId).setAttribute("data-available","take")
                            }
                        }
                        return;
                    }

                    flashSquare(bishSquareId, bishSquareClass);
                    let bishFlash = setInterval(flashSquare, 3000, bishSquareId, bishSquareClass);
                    flashMoves.push(bishFlash);

                    //make square available
                    document.getElementById(bishSquareId).setAttribute("data-available","true")

                    upLeftw(bishSquare);
                }

                upLeftw(squareNumber);

                break;

            case 'bBish':


                //up-right
                function upRight(squareNumber) {
                    
                    let bishSquare = +squareNumber + 7
                    let bishColumn = bishSquare % 8;
                    if (bishSquare > 64 || bishColumn === 0) {return};

                    let bishDiv = document.querySelector(`[data-numbered="${bishSquare}"]`);
                    let bishSquareId = bishDiv.id;
                    let bishSquareClass = bishDiv.className;

                    if (bishDiv.firstChild) {

                        //check if piece can be taken
                        if (bishDiv.firstChild != null) {
                            if (bishDiv.firstChild.className === 'wPiece') {
                                flashSquare(bishSquareId, bishSquareClass);
                                let bishFlash = setInterval(flashSquare, 3000, bishSquareId, bishSquareClass);
                                flashMoves.push(bishFlash);
                                document.getElementById(bishSquareId).setAttribute("data-available","take")
                            }
                        }
                        return;
                    }

                    flashSquare(bishSquareId, bishSquareClass);
                    let bishFlash = setInterval(flashSquare, 3000, bishSquareId, bishSquareClass);
                    flashMoves.push(bishFlash);

                    //make square available
                    document.getElementById(bishSquareId).setAttribute("data-available","true")

                    upRight(bishSquare);
                }

                upRight(squareNumber);

                //down-right
                function downRight(squareNumber) {
                    
                    let bishSquare = +squareNumber - 9
                    let bishColumn = bishSquare % 8;
                    if (bishSquare <= 0 || bishColumn === 0) {return};

                    let bishDiv = document.querySelector(`[data-numbered="${bishSquare}"]`);
                    let bishSquareId = bishDiv.id;
                    let bishSquareClass = bishDiv.className;

                    if (bishDiv.firstChild) {

                        //check if piece can be taken
                        if (bishDiv.firstChild != null) {
                            if (bishDiv.firstChild.className === 'wPiece') {
                                flashSquare(bishSquareId, bishSquareClass);
                                let bishFlash = setInterval(flashSquare, 3000, bishSquareId, bishSquareClass);
                                flashMoves.push(bishFlash);
                                document.getElementById(bishSquareId).setAttribute("data-available","take")
                            }
                        }
                        return;
                    }

                    flashSquare(bishSquareId, bishSquareClass);
                    let bishFlash = setInterval(flashSquare, 3000, bishSquareId, bishSquareClass);
                    flashMoves.push(bishFlash);

                    //make square available
                    document.getElementById(bishSquareId).setAttribute("data-available","true")

                    downRight(bishSquare);
                }

                downRight(squareNumber);

                //down-left
                function downLeft(squareNumber) {
                    
                    let bishSquare = +squareNumber - 7
                    let bishColumn = bishSquare % 8;
                    if (bishSquare <= 0 || bishColumn === 1) {return};

                    let bishDiv = document.querySelector(`[data-numbered="${bishSquare}"]`);
                    let bishSquareId = bishDiv.id;
                    let bishSquareClass = bishDiv.className;

                    if (bishDiv.firstChild) {

                        //check if piece can be taken
                        if (bishDiv.firstChild != null) {
                            if (bishDiv.firstChild.className === 'wPiece') {
                                flashSquare(bishSquareId, bishSquareClass);
                                let bishFlash = setInterval(flashSquare, 3000, bishSquareId, bishSquareClass);
                                flashMoves.push(bishFlash);
                                document.getElementById(bishSquareId).setAttribute("data-available","take")
                            }
                        }
                        return;
                    }

                    flashSquare(bishSquareId, bishSquareClass);
                    let bishFlash = setInterval(flashSquare, 3000, bishSquareId, bishSquareClass);
                    flashMoves.push(bishFlash);

                    //make square available
                    document.getElementById(bishSquareId).setAttribute("data-available","true")

                    downLeft(bishSquare);
                }

                downLeft(squareNumber);

                //Up-left
                function upLeft(squareNumber) {
                    
                    let bishSquare = +squareNumber + 9
                    let bishColumn = bishSquare % 8;
                    if (bishSquare > 64 || bishColumn === 1) {return};

                    let bishDiv = document.querySelector(`[data-numbered="${bishSquare}"]`);
                    let bishSquareId = bishDiv.id;
                    let bishSquareClass = bishDiv.className;

                    if (bishDiv.firstChild) {

                        //check if piece can be taken
                        if (bishDiv.firstChild != null) {
                            if (bishDiv.firstChild.className === 'wPiece') {
                                flashSquare(bishSquareId, bishSquareClass);
                                let bishFlash = setInterval(flashSquare, 3000, bishSquareId, bishSquareClass);
                                flashMoves.push(bishFlash);
                                document.getElementById(bishSquareId).setAttribute("data-available","take")
                            }
                        }
                        return;
                    }

                    flashSquare(bishSquareId, bishSquareClass);
                    let bishFlash = setInterval(flashSquare, 3000, bishSquareId, bishSquareClass);
                    flashMoves.push(bishFlash);

                    //make square available
                    document.getElementById(bishSquareId).setAttribute("data-available","true")

                    upLeft(bishSquare);
                }

                upLeft(squareNumber);

                break;

            case 'bKing':


                {
                //right
                let kingSquare = +squareNumber - 1;
                let kingColumn = kingSquare % 8 ;
                if (kingColumn != 0) {

                    let kingDiv = document.querySelector(`[data-numbered="${kingSquare}"]`)
                    let kingSquareId = kingDiv.id;
                    let kingSquareClass = kingDiv.className;

                    //Break if piece in the way
                    if (kingDiv.firstChild) {

                        //check if piece can be taken

                        if (kingDiv.firstChild.className === 'wPiece') {
                            flashSquare(kingSquareId, kingSquareClass);
                            let kingFlash = setInterval(flashSquare, 3000, kingSquareId, kingSquareClass);
                            flashMoves.push(kingFlash);
                            document.getElementById(kingSquareId).setAttribute("data-available","take")
                        }
                        

                    } else {

                        flashSquare(kingSquareId, kingSquareClass);
                        let kingFlash = setInterval(flashSquare, 3000, kingSquareId, kingSquareClass);
                        flashMoves.push(kingFlash);

                        //make square available
                        document.getElementById(kingSquareId).setAttribute("data-available","true")
                    
                    };
                }
                }

            {
                //up
                let kingSquare = +squareNumber + 8;
                if (kingSquare <= 64) {
                    let kingDiv = document.querySelector(`[data-numbered="${kingSquare}"]`)
                    let kingSquareId = kingDiv.id;
                    let kingSquareClass = kingDiv.className;

                    //Break if piece in the way
                    if (kingDiv.firstChild) {

                        //check if piece can be taken
                        if (kingDiv.firstChild.className === 'wPiece') {
                            flashSquare(kingSquareId, kingSquareClass);
                            let kingFlash = setInterval(flashSquare, 3000, kingSquareId, kingSquareClass);
                            flashMoves.push(kingFlash);
                            document.getElementById(kingSquareId).setAttribute("data-available","take")
                            }
                        
                    
                    } else {

                        flashSquare(kingSquareId, kingSquareClass);
                        let kingFlash = setInterval(flashSquare, 3000, kingSquareId, kingSquareClass);
                        flashMoves.push(kingFlash);

                        //make square available
                        document.getElementById(kingSquareId).setAttribute("data-available","true")
                    };

                }
            };

            {
                //down
                let kingSquare = +squareNumber - 8;
                if (kingSquare > 0) {
                    let kingDiv = document.querySelector(`[data-numbered="${kingSquare}"]`)
                    let kingSquareId = kingDiv.id;
                    let kingSquareClass = kingDiv.className;

                    //Break if piece in the way
                    if (kingDiv.firstChild) {

                        //check if piece can be taken
                        if (kingDiv.firstChild.className === 'wPiece') {
                            flashSquare(kingSquareId, kingSquareClass);
                            let kingFlash = setInterval(flashSquare, 3000, kingSquareId, kingSquareClass);
                            flashMoves.push(kingFlash);
                            document.getElementById(kingSquareId).setAttribute("data-available","take")
                            }
                        
                    
                    } else {

                        flashSquare(kingSquareId, kingSquareClass);
                        let kingFlash = setInterval(flashSquare, 3000, kingSquareId, kingSquareClass);
                        flashMoves.push(kingFlash);

                        //make square available
                        document.getElementById(kingSquareId).setAttribute("data-available","true")
                    };

                }
            };

            {
                //left
                let kingSquare = +squareNumber + 1;
                let kingColumn = kingSquare % 8 ;
                if (kingColumn != 1) {

                    let kingDiv = document.querySelector(`[data-numbered="${kingSquare}"]`)
                    let kingSquareId = kingDiv.id;
                    let kingSquareClass = kingDiv.className;

                    //Break if piece in the way
                    if (kingDiv.firstChild) {

                        //check if piece can be taken

                        if (kingDiv.firstChild.className === 'wPiece') {
                            flashSquare(kingSquareId, kingSquareClass);
                            let kingFlash = setInterval(flashSquare, 3000, kingSquareId, kingSquareClass);
                            flashMoves.push(kingFlash);
                            document.getElementById(kingSquareId).setAttribute("data-available","take")
                        }
                        

                    } else {

                        flashSquare(kingSquareId, kingSquareClass);
                        let kingFlash = setInterval(flashSquare, 3000, kingSquareId, kingSquareClass);
                        flashMoves.push(kingFlash);

                        //make square available
                        document.getElementById(kingSquareId).setAttribute("data-available","true")
                    
                    };
                }
                }

                {
                    //up-right
                    
                let kingSquare = +squareNumber + 7
                let kingColumn = kingSquare % 8;

                if (kingSquare <= 64 && kingColumn != 0) {

                    let kingDiv = document.querySelector(`[data-numbered="${kingSquare}"]`);
                    let kingSquareId = kingDiv.id;
                    let kingSquareClass = kingDiv.className;

                    if (kingDiv.firstChild) {

                        //check if piece can be taken
                        if (kingDiv.firstChild.className === 'wPiece') {
                            flashSquare(kingSquareId, kingSquareClass);
                            let kingFlash = setInterval(flashSquare, 3000, kingSquareId, kingSquareClass);
                            flashMoves.push(kingFlash);
                            document.getElementById(kingSquareId).setAttribute("data-available","take")
                        }
                        
                    } else {

                    flashSquare(kingSquareId, kingSquareClass);
                    let kingFlash = setInterval(flashSquare, 3000, kingSquareId, kingSquareClass);
                    flashMoves.push(kingFlash);

                    //make square available
                    document.getElementById(kingSquareId).setAttribute("data-available","true")
                    
                    };
                }
                
                }

                {
                    //up-left
                    
                let kingSquare = +squareNumber + 9
                let kingColumn = kingSquare % 8;

                if (kingSquare <= 64 && kingColumn != 1) {

                    let kingDiv = document.querySelector(`[data-numbered="${kingSquare}"]`);
                    let kingSquareId = kingDiv.id;
                    let kingSquareClass = kingDiv.className;

                    if (kingDiv.firstChild) {

                        //check if piece can be taken
                        if (kingDiv.firstChild.className === 'wPiece') {
                            flashSquare(kingSquareId, kingSquareClass);
                            let kingFlash = setInterval(flashSquare, 3000, kingSquareId, kingSquareClass);
                            flashMoves.push(kingFlash);
                            document.getElementById(kingSquareId).setAttribute("data-available","take")
                        }
                        
                    } else {

                    flashSquare(kingSquareId, kingSquareClass);
                    let kingFlash = setInterval(flashSquare, 3000, kingSquareId, kingSquareClass);
                    flashMoves.push(kingFlash);

                    //make square available
                    document.getElementById(kingSquareId).setAttribute("data-available","true")
                    
                    };
                }
                
                }

                {
                    //down-right
                    
                let kingSquare = +squareNumber - 9
                let kingColumn = kingSquare % 8;

                if (kingSquare > 0 && kingColumn != 0) {

                    let kingDiv = document.querySelector(`[data-numbered="${kingSquare}"]`);
                    let kingSquareId = kingDiv.id;
                    let kingSquareClass = kingDiv.className;

                    if (kingDiv.firstChild) {

                        //check if piece can be taken
                        if (kingDiv.firstChild.className === 'wPiece') {
                            flashSquare(kingSquareId, kingSquareClass);
                            let kingFlash = setInterval(flashSquare, 3000, kingSquareId, kingSquareClass);
                            flashMoves.push(kingFlash);
                            document.getElementById(kingSquareId).setAttribute("data-available","take")
                        }
                        
                    } else {

                    flashSquare(kingSquareId, kingSquareClass);
                    let kingFlash = setInterval(flashSquare, 3000, kingSquareId, kingSquareClass);
                    flashMoves.push(kingFlash);

                    //make square available
                    document.getElementById(kingSquareId).setAttribute("data-available","true")
                    
                    };
                }
                
                }

                {
                    //down-left
                    
                let kingSquare = +squareNumber - 7
                let kingColumn = kingSquare % 8;

                if (kingSquare > 0 && kingColumn != 1) {

                    let kingDiv = document.querySelector(`[data-numbered="${kingSquare}"]`);
                    let kingSquareId = kingDiv.id;
                    let kingSquareClass = kingDiv.className;

                    if (kingDiv.firstChild) {

                        //check if piece can be taken
                        if (kingDiv.firstChild.className === 'wPiece') {
                            flashSquare(kingSquareId, kingSquareClass);
                            let kingFlash = setInterval(flashSquare, 3000, kingSquareId, kingSquareClass);
                            flashMoves.push(kingFlash);
                            document.getElementById(kingSquareId).setAttribute("data-available","take")
                        }
                        
                    } else {

                    flashSquare(kingSquareId, kingSquareClass);
                    let kingFlash = setInterval(flashSquare, 3000, kingSquareId, kingSquareClass);
                    flashMoves.push(kingFlash);

                    //make square available
                    document.getElementById(kingSquareId).setAttribute("data-available","true")
                    
                    };
                }
                
                }
                break;
            
            case 'wKing':


                {
                //right
                let kingSquare = +squareNumber - 1;
                let kingColumn = kingSquare % 8 ;
                if (kingColumn != 0) {

                    let kingDiv = document.querySelector(`[data-numbered="${kingSquare}"]`)
                    let kingSquareId = kingDiv.id;
                    let kingSquareClass = kingDiv.className;

                    //Break if piece in the way
                    if (kingDiv.firstChild) {

                        //check if piece can be taken

                        if (kingDiv.firstChild.className === 'bPiece') {
                            flashSquare(kingSquareId, kingSquareClass);
                            let kingFlash = setInterval(flashSquare, 3000, kingSquareId, kingSquareClass);
                            flashMoves.push(kingFlash);
                            document.getElementById(kingSquareId).setAttribute("data-available","take")
                        }
                        

                    } else {

                        flashSquare(kingSquareId, kingSquareClass);
                        let kingFlash = setInterval(flashSquare, 3000, kingSquareId, kingSquareClass);
                        flashMoves.push(kingFlash);

                        //make square available
                        document.getElementById(kingSquareId).setAttribute("data-available","true")
                    
                    };
                }
                }

            {
                //up
                let kingSquare = +squareNumber + 8;
                if (kingSquare <= 64) {
                    let kingDiv = document.querySelector(`[data-numbered="${kingSquare}"]`)
                    let kingSquareId = kingDiv.id;
                    let kingSquareClass = kingDiv.className;

                    //Break if piece in the way
                    if (kingDiv.firstChild) {

                        //check if piece can be taken
                        if (kingDiv.firstChild.className === 'bPiece') {
                            flashSquare(kingSquareId, kingSquareClass);
                            let kingFlash = setInterval(flashSquare, 3000, kingSquareId, kingSquareClass);
                            flashMoves.push(kingFlash);
                            document.getElementById(kingSquareId).setAttribute("data-available","take")
                            }
                        
                    
                    } else {

                        flashSquare(kingSquareId, kingSquareClass);
                        let kingFlash = setInterval(flashSquare, 3000, kingSquareId, kingSquareClass);
                        flashMoves.push(kingFlash);

                        //make square available
                        document.getElementById(kingSquareId).setAttribute("data-available","true")
                    };

                }
            };

            {
                //down
                let kingSquare = +squareNumber - 8;
                if (kingSquare > 0) {
                    let kingDiv = document.querySelector(`[data-numbered="${kingSquare}"]`)
                    let kingSquareId = kingDiv.id;
                    let kingSquareClass = kingDiv.className;

                    //Break if piece in the way
                    if (kingDiv.firstChild) {

                        //check if piece can be taken
                        if (kingDiv.firstChild.className === 'bPiece') {
                            flashSquare(kingSquareId, kingSquareClass);
                            let kingFlash = setInterval(flashSquare, 3000, kingSquareId, kingSquareClass);
                            flashMoves.push(kingFlash);
                            document.getElementById(kingSquareId).setAttribute("data-available","take")
                            }
                        
                    
                    } else {

                        flashSquare(kingSquareId, kingSquareClass);
                        let kingFlash = setInterval(flashSquare, 3000, kingSquareId, kingSquareClass);
                        flashMoves.push(kingFlash);

                        //make square available
                        document.getElementById(kingSquareId).setAttribute("data-available","true")
                    };

                }
            };

            {
                //left
                let kingSquare = +squareNumber + 1;
                let kingColumn = kingSquare % 8 ;
                if (kingColumn != 1) {

                    let kingDiv = document.querySelector(`[data-numbered="${kingSquare}"]`)
                    let kingSquareId = kingDiv.id;
                    let kingSquareClass = kingDiv.className;

                    //Break if piece in the way
                    if (kingDiv.firstChild) {

                        //check if piece can be taken

                        if (kingDiv.firstChild.className === 'bPiece') {
                            flashSquare(kingSquareId, kingSquareClass);
                            let kingFlash = setInterval(flashSquare, 3000, kingSquareId, kingSquareClass);
                            flashMoves.push(kingFlash);
                            document.getElementById(kingSquareId).setAttribute("data-available","take")
                        }
                        

                    } else {

                        flashSquare(kingSquareId, kingSquareClass);
                        let kingFlash = setInterval(flashSquare, 3000, kingSquareId, kingSquareClass);
                        flashMoves.push(kingFlash);

                        //make square available
                        document.getElementById(kingSquareId).setAttribute("data-available","true")
                    
                    };
                }
                }

                {
                    //up-right
                    
                let kingSquare = +squareNumber + 7
                let kingColumn = kingSquare % 8;

                if (kingSquare <= 64 && kingColumn != 0) {

                    let kingDiv = document.querySelector(`[data-numbered="${kingSquare}"]`);
                    let kingSquareId = kingDiv.id;
                    let kingSquareClass = kingDiv.className;

                    if (kingDiv.firstChild) {

                        //check if piece can be taken
                        if (kingDiv.firstChild.className === 'bPiece') {
                            flashSquare(kingSquareId, kingSquareClass);
                            let kingFlash = setInterval(flashSquare, 3000, kingSquareId, kingSquareClass);
                            flashMoves.push(kingFlash);
                            document.getElementById(kingSquareId).setAttribute("data-available","take")
                        }
                        
                    } else {

                    flashSquare(kingSquareId, kingSquareClass);
                    let kingFlash = setInterval(flashSquare, 3000, kingSquareId, kingSquareClass);
                    flashMoves.push(kingFlash);

                    //make square available
                    document.getElementById(kingSquareId).setAttribute("data-available","true")
                    
                    };
                }
                
                }

                {
                    //up-left
                    
                let kingSquare = +squareNumber + 9
                let kingColumn = kingSquare % 8;

                if (kingSquare <= 64 && kingColumn != 1) {

                    let kingDiv = document.querySelector(`[data-numbered="${kingSquare}"]`);
                    let kingSquareId = kingDiv.id;
                    let kingSquareClass = kingDiv.className;

                    if (kingDiv.firstChild) {

                        //check if piece can be taken
                        if (kingDiv.firstChild.className === 'bPiece') {
                            flashSquare(kingSquareId, kingSquareClass);
                            let kingFlash = setInterval(flashSquare, 3000, kingSquareId, kingSquareClass);
                            flashMoves.push(kingFlash);
                            document.getElementById(kingSquareId).setAttribute("data-available","take")
                        }
                        
                    } else {

                    flashSquare(kingSquareId, kingSquareClass);
                    let kingFlash = setInterval(flashSquare, 3000, kingSquareId, kingSquareClass);
                    flashMoves.push(kingFlash);

                    //make square available
                    document.getElementById(kingSquareId).setAttribute("data-available","true")
                    
                    };
                }
                
                }

                {
                    //down-right
                    
                let kingSquare = +squareNumber - 9
                let kingColumn = kingSquare % 8;

                if (kingSquare > 0 && kingColumn != 0) {

                    let kingDiv = document.querySelector(`[data-numbered="${kingSquare}"]`);
                    let kingSquareId = kingDiv.id;
                    let kingSquareClass = kingDiv.className;

                    if (kingDiv.firstChild) {

                        //check if piece can be taken
                        if (kingDiv.firstChild.className === 'bPiece') {
                            flashSquare(kingSquareId, kingSquareClass);
                            let kingFlash = setInterval(flashSquare, 3000, kingSquareId, kingSquareClass);
                            flashMoves.push(kingFlash);
                            document.getElementById(kingSquareId).setAttribute("data-available","take")
                        }
                        
                    } else {

                    flashSquare(kingSquareId, kingSquareClass);
                    let kingFlash = setInterval(flashSquare, 3000, kingSquareId, kingSquareClass);
                    flashMoves.push(kingFlash);

                    //make square available
                    document.getElementById(kingSquareId).setAttribute("data-available","true")
                    
                    };
                }
                
                }

                {
                    //down-left
                    
                let kingSquare = +squareNumber - 7
                let kingColumn = kingSquare % 8;

                if (kingSquare > 0 && kingColumn != 1) {

                    let kingDiv = document.querySelector(`[data-numbered="${kingSquare}"]`);
                    let kingSquareId = kingDiv.id;
                    let kingSquareClass = kingDiv.className;

                    if (kingDiv.firstChild) {

                        //check if piece can be taken
                        if (kingDiv.firstChild.className === 'bPiece') {
                            flashSquare(kingSquareId, kingSquareClass);
                            let kingFlash = setInterval(flashSquare, 3000, kingSquareId, kingSquareClass);
                            flashMoves.push(kingFlash);
                            document.getElementById(kingSquareId).setAttribute("data-available","take")
                        }
                        
                    } else {

                    flashSquare(kingSquareId, kingSquareClass);
                    let kingFlash = setInterval(flashSquare, 3000, kingSquareId, kingSquareClass);
                    flashMoves.push(kingFlash);

                    //make square available
                    document.getElementById(kingSquareId).setAttribute("data-available","true")
                    
                    };
                }
                
                }
                break;

            case 'wQuee':

                //right
                for (let i = 1 ; i < 8 ; i++) {

                    let queeSquare = +squareNumber - +i;
                    let queeColumn = queeSquare % 8 ;
                    if (queeColumn === 0) {break};
                    let queeDiv = document.querySelector(`[data-numbered="${queeSquare}"]`)
                    let queeSquareId = queeDiv.id;
                    let queeSquareClass = queeDiv.className;
 
                    //Break if piece in the way OR edge of board
                    if (queeDiv.firstChild) {

                        //check if piece can be taken
                        if (queeDiv.firstChild != null) {
                            if (queeDiv.firstChild.className === 'bPiece') {
                                flashSquare(queeSquareId, queeSquareClass);
                                let queeFlash = setInterval(flashSquare, 3000, queeSquareId, queeSquareClass);
                                flashMoves.push(queeFlash);
                                document.getElementById(queeSquareId).setAttribute("data-available","take")
                            }
                        }
                        break;
                    }

                    flashSquare(queeSquareId, queeSquareClass);
                    let queeFlash = setInterval(flashSquare, 3000, queeSquareId, queeSquareClass);
                    flashMoves.push(queeFlash);

                    //make square available
                    document.getElementById(queeSquareId).setAttribute("data-available","true")

                }

                //left
                for (let i = 1 ; i < 8 ; i++) {

                    let queeSquare = +squareNumber + +i;
                    let queeColumn = queeSquare % 8 ;
                    if (queeColumn === 1) { break };
                    let queeDiv = document.querySelector(`[data-numbered="${queeSquare}"]`)
                    let queeSquareId = queeDiv.id;
                    let queeSquareClass = queeDiv.className;

                    //Break if piece in the way
                    if (queeDiv.firstChild) {

                        //check if piece can be taken
                        if (queeDiv.firstChild != null) {
                            if (queeDiv.firstChild.className === 'bPiece') {
                                flashSquare(queeSquareId, queeSquareClass);
                                let queeFlash = setInterval(flashSquare, 3000, queeSquareId, queeSquareClass);
                                flashMoves.push(queeFlash);
                                document.getElementById(queeSquareId).setAttribute("data-available","take")
                            }
                        }
                        break;
                    }

                    flashSquare(queeSquareId, queeSquareClass);
                    let queeFlash = setInterval(flashSquare, 3000, queeSquareId, queeSquareClass);
                    flashMoves.push(queeFlash);

                    //make square available
                    document.getElementById(queeSquareId).setAttribute("data-available","true")

                }

                //down
                for (let i = 1 ; i < 8 ; i++) {

                    let queeSquare = +squareNumber - +(i * 8);
                    if (queeSquare < 1) { break };
                    let queeDiv = document.querySelector(`[data-numbered="${queeSquare}"]`)
                    let queeSquareId = queeDiv.id;
                    let queeSquareClass = queeDiv.className;

                    //Break if piece in the way
                    if (queeDiv.firstChild) {

                        //check if piece can be taken
                        if (queeDiv.firstChild != null) {
                            if (queeDiv.firstChild.className === 'bPiece') {
                                flashSquare(queeSquareId, queeSquareClass);
                                let queeFlash = setInterval(flashSquare, 3000, queeSquareId, queeSquareClass);
                                flashMoves.push(queeFlash);
                                document.getElementById(queeSquareId).setAttribute("data-available","take")
                            }
                        }
                        break;
                    }

                    flashSquare(queeSquareId, queeSquareClass);
                    let queeFlash = setInterval(flashSquare, 3000, queeSquareId, queeSquareClass);
                    flashMoves.push(queeFlash);

                    //make square available
                    document.getElementById(queeSquareId).setAttribute("data-available","true")


                };

                //up
                for (let i = 1 ; i < 8 ; i++) {

                    let queeSquare = +squareNumber + +(i * 8);
                    if (queeSquare > 64) { break };
                    let queeDiv = document.querySelector(`[data-numbered="${queeSquare}"]`)
                    let queeSquareId = queeDiv.id;
                    let queeSquareClass = queeDiv.className;

                    //Break if piece in the way
                    if (queeDiv.firstChild) {

                        //check if piece can be taken
                        if (queeDiv.firstChild != null) {
                            if (queeDiv.firstChild.className === 'bPiece') {
                                flashSquare(queeSquareId, queeSquareClass);
                                let queeFlash = setInterval(flashSquare, 3000, queeSquareId, queeSquareClass);
                                flashMoves.push(queeFlash);
                                document.getElementById(queeSquareId).setAttribute("data-available","take")
                            }
                        }
                        break;
                    }

                    flashSquare(queeSquareId, queeSquareClass);
                    let queeFlash = setInterval(flashSquare, 3000, queeSquareId, queeSquareClass);
                    flashMoves.push(queeFlash);

                    //make square available
                    document.getElementById(queeSquareId).setAttribute("data-available","true")


                };

                //up-right
                function upRightwQueen(squareNumber) {
                    
                    let queeSquare = +squareNumber + 7
                    let queeColumn = queeSquare % 8;
                    if (queeSquare > 64 || queeColumn === 0) {return};

                    let queeDiv = document.querySelector(`[data-numbered="${queeSquare}"]`);
                    let queeSquareId = queeDiv.id;
                    let queeSquareClass = queeDiv.className;

                    if (queeDiv.firstChild) {

                        //check if piece can be taken
                        if (queeDiv.firstChild != null) {
                            if (queeDiv.firstChild.className === 'bPiece') {
                                flashSquare(queeSquareId, queeSquareClass);
                                let queeFlash = setInterval(flashSquare, 3000, queeSquareId, queeSquareClass);
                                flashMoves.push(queeFlash);
                                document.getElementById(queeSquareId).setAttribute("data-available","take")
                            }
                        }
                        return;
                    }

                    flashSquare(queeSquareId, queeSquareClass);
                    let queeFlash = setInterval(flashSquare, 3000, queeSquareId, queeSquareClass);
                    flashMoves.push(queeFlash);

                    //make square available
                    document.getElementById(queeSquareId).setAttribute("data-available","true")

                    upRightwQueen(queeSquare);
                }

                upRightwQueen(squareNumber);

                //down-right
                function downRightwQueen(squareNumber) {
                    
                    let queeSquare = +squareNumber - 9
                    let queeColumn = queeSquare % 8;
                    if (queeSquare <= 0 || queeColumn === 0) {return};

                    let queeDiv = document.querySelector(`[data-numbered="${queeSquare}"]`);
                    let queeSquareId = queeDiv.id;
                    let queeSquareClass = queeDiv.className;

                    if (queeDiv.firstChild) {

                        //check if piece can be taken
                        if (queeDiv.firstChild != null) {
                            if (queeDiv.firstChild.className === 'bPiece') {
                                flashSquare(queeSquareId, queeSquareClass);
                                let queeFlash = setInterval(flashSquare, 3000, queeSquareId, queeSquareClass);
                                flashMoves.push(queeFlash);
                                document.getElementById(queeSquareId).setAttribute("data-available","take")
                            }
                        }
                        return;
                    }

                    flashSquare(queeSquareId, queeSquareClass);
                    let queeFlash = setInterval(flashSquare, 3000, queeSquareId, queeSquareClass);
                    flashMoves.push(queeFlash);

                    //make square available
                    document.getElementById(queeSquareId).setAttribute("data-available","true")

                    downRightwQueen(queeSquare);
                }

                downRightwQueen(squareNumber);

                //down-left
                function downLeftwQueen(squareNumber) {
                    
                    let queeSquare = +squareNumber - 7
                    let queeColumn = queeSquare % 8;

                    if (queeSquare <= 0 || queeColumn === 1) {return};

                    let queeDiv = document.querySelector(`[data-numbered="${queeSquare}"]`);
                    let queeSquareId = queeDiv.id;
                    let queeSquareClass = queeDiv.className;

                    if (queeDiv.firstChild) {

                        //check if piece can be taken
                        if (queeDiv.firstChild != null) {
                            if (queeDiv.firstChild.className === 'bPiece') {
                                flashSquare(queeSquareId, queeSquareClass);
                                let queeFlash = setInterval(flashSquare, 3000, queeSquareId, queeSquareClass);
                                flashMoves.push(queeFlash);
                                document.getElementById(queeSquareId).setAttribute("data-available","take")
                            }
                        }
                        return;
                    }

                    flashSquare(queeSquareId, queeSquareClass);
                    let queeFlash = setInterval(flashSquare, 3000, queeSquareId, queeSquareClass);
                    flashMoves.push(queeFlash);

                    //make square available
                    document.getElementById(queeSquareId).setAttribute("data-available","true")

                    downLeftwQueen(queeSquare);
                }

                downLeftwQueen(squareNumber);

                //Up-left
                function upLeftwQueen(squareNumber) {
                    
                    let queeSquare = +squareNumber + 9
                    let queeColumn = queeSquare % 8;
                    if (queeSquare > 64 || queeColumn === 1) {return};

                    let queeDiv = document.querySelector(`[data-numbered="${queeSquare}"]`);
                    let queeSquareId = queeDiv.id;
                    let queeSquareClass = queeDiv.className;

                    if (queeDiv.firstChild) {

                        //check if piece can be taken
                        if (queeDiv.firstChild != null) {
                            if (queeDiv.firstChild.className === 'bPiece') {
                                flashSquare(queeSquareId, queeSquareClass);
                                let queeFlash = setInterval(flashSquare, 3000, queeSquareId, queeSquareClass);
                                flashMoves.push(queeFlash);
                                document.getElementById(queeSquareId).setAttribute("data-available","take")
                            }
                        }
                        return;
                    }

                    flashSquare(queeSquareId, queeSquareClass);
                    let queeFlash = setInterval(flashSquare, 3000, queeSquareId, queeSquareClass);
                    flashMoves.push(queeFlash);

                    //make square available
                    document.getElementById(queeSquareId).setAttribute("data-available","true")

                    upLeftwQueen(queeSquare);
                }

                upLeftwQueen(squareNumber);

                break;

            case 'bQuee':

                //right
                for (let i = 1 ; i < 8 ; i++) {

                    let queeSquare = +squareNumber - +i;
                    let queeColumn = queeSquare % 8 ;
                    if (queeColumn === 0) {break};
                    let queeDiv = document.querySelector(`[data-numbered="${queeSquare}"]`)
                    let queeSquareId = queeDiv.id;
                    let queeSquareClass = queeDiv.className;
 
                    //Break if piece in the way OR edge of board
                    if (queeDiv.firstChild) {

                        //check if piece can be taken
                        if (queeDiv.firstChild != null) {
                            if (queeDiv.firstChild.className === 'wPiece') {
                                flashSquare(queeSquareId, queeSquareClass);
                                let queeFlash = setInterval(flashSquare, 3000, queeSquareId, queeSquareClass);
                                flashMoves.push(queeFlash);
                                document.getElementById(queeSquareId).setAttribute("data-available","take")
                            }
                        }
                        break;
                    }

                    flashSquare(queeSquareId, queeSquareClass);
                    let queeFlash = setInterval(flashSquare, 3000, queeSquareId, queeSquareClass);
                    flashMoves.push(queeFlash);

                    //make square available
                    document.getElementById(queeSquareId).setAttribute("data-available","true")

                }

                //left
                for (let i = 1 ; i < 8 ; i++) {

                    let queeSquare = +squareNumber + +i;
                    let queeColumn = queeSquare % 8 ;
                    if (queeColumn === 1) { break };
                    let queeDiv = document.querySelector(`[data-numbered="${queeSquare}"]`)
                    let queeSquareId = queeDiv.id;
                    let queeSquareClass = queeDiv.className;

                    //Break if piece in the way
                    if (queeDiv.firstChild) {

                        //check if piece can be taken
                        if (queeDiv.firstChild != null) {
                            if (queeDiv.firstChild.className === 'wPiece') {
                                flashSquare(queeSquareId, queeSquareClass);
                                let queeFlash = setInterval(flashSquare, 3000, queeSquareId, queeSquareClass);
                                flashMoves.push(queeFlash);
                                document.getElementById(queeSquareId).setAttribute("data-available","take")
                            }
                        }
                        break;
                    }

                    flashSquare(queeSquareId, queeSquareClass);
                    let queeFlash = setInterval(flashSquare, 3000, queeSquareId, queeSquareClass);
                    flashMoves.push(queeFlash);

                    //make square available
                    document.getElementById(queeSquareId).setAttribute("data-available","true")

                }

                //down
                for (let i = 1 ; i < 8 ; i++) {

                    let queeSquare = +squareNumber - +(i * 8);
                    if (queeSquare < 1) { break };
                    let queeDiv = document.querySelector(`[data-numbered="${queeSquare}"]`)
                    let queeSquareId = queeDiv.id;
                    let queeSquareClass = queeDiv.className;

                    //Break if piece in the way
                    if (queeDiv.firstChild) {

                        //check if piece can be taken
                        if (queeDiv.firstChild != null) {
                            if (queeDiv.firstChild.className === 'wPiece') {
                                flashSquare(queeSquareId, queeSquareClass);
                                let queeFlash = setInterval(flashSquare, 3000, queeSquareId, queeSquareClass);
                                flashMoves.push(queeFlash);
                                document.getElementById(queeSquareId).setAttribute("data-available","take")
                            }
                        }
                        break;
                    }

                    flashSquare(queeSquareId, queeSquareClass);
                    let queeFlash = setInterval(flashSquare, 3000, queeSquareId, queeSquareClass);
                    flashMoves.push(queeFlash);

                    //make square available
                    document.getElementById(queeSquareId).setAttribute("data-available","true")


                };

                //up
                for (let i = 1 ; i < 8 ; i++) {

                    let queeSquare = +squareNumber + +(i * 8);
                    if (queeSquare > 64) { break };
                    let queeDiv = document.querySelector(`[data-numbered="${queeSquare}"]`)
                    let queeSquareId = queeDiv.id;
                    let queeSquareClass = queeDiv.className;

                    //Break if piece in the way
                    if (queeDiv.firstChild) {

                        //check if piece can be taken
                        if (queeDiv.firstChild != null) {
                            if (queeDiv.firstChild.className === 'wPiece') {
                                flashSquare(queeSquareId, queeSquareClass);
                                let queeFlash = setInterval(flashSquare, 3000, queeSquareId, queeSquareClass);
                                flashMoves.push(queeFlash);
                                document.getElementById(queeSquareId).setAttribute("data-available","take")
                            }
                        }
                        break;
                    }

                    flashSquare(queeSquareId, queeSquareClass);
                    let queeFlash = setInterval(flashSquare, 3000, queeSquareId, queeSquareClass);
                    flashMoves.push(queeFlash);

                    //make square available
                    document.getElementById(queeSquareId).setAttribute("data-available","true")


                };

                //up-right
                function upRightbQueen(squareNumber) {
                    
                    let queeSquare = +squareNumber + 7
                    let queeColumn = queeSquare % 8;
                    if (queeSquare > 64 || queeColumn === 0) {return};

                    let queeDiv = document.querySelector(`[data-numbered="${queeSquare}"]`);
                    let queeSquareId = queeDiv.id;
                    let queeSquareClass = queeDiv.className;

                    if (queeDiv.firstChild) {

                        //check if piece can be taken
                        if (queeDiv.firstChild != null) {
                            if (queeDiv.firstChild.className === 'wPiece') {
                                flashSquare(queeSquareId, queeSquareClass);
                                let queeFlash = setInterval(flashSquare, 3000, queeSquareId, queeSquareClass);
                                flashMoves.push(queeFlash);
                                document.getElementById(queeSquareId).setAttribute("data-available","take")
                            }
                        }
                        return;
                    }

                    flashSquare(queeSquareId, queeSquareClass);
                    let queeFlash = setInterval(flashSquare, 3000, queeSquareId, queeSquareClass);
                    flashMoves.push(queeFlash);

                    //make square available
                    document.getElementById(queeSquareId).setAttribute("data-available","true")

                    upRightbQueen(queeSquare);
                }

                upRightbQueen(squareNumber);

                //down-right
                function downRightbQueen(squareNumber) {
                    
                    let queeSquare = +squareNumber - 9
                    let queeColumn = queeSquare % 8;
                    if (queeSquare <= 0 || queeColumn === 0) {return};

                    let queeDiv = document.querySelector(`[data-numbered="${queeSquare}"]`);
                    let queeSquareId = queeDiv.id;
                    let queeSquareClass = queeDiv.className;

                    if (queeDiv.firstChild) {

                        //check if piece can be taken
                        if (queeDiv.firstChild != null) {
                            if (queeDiv.firstChild.className === 'wPiece') {
                                flashSquare(queeSquareId, queeSquareClass);
                                let queeFlash = setInterval(flashSquare, 3000, queeSquareId, queeSquareClass);
                                flashMoves.push(queeFlash);
                                document.getElementById(queeSquareId).setAttribute("data-available","take")
                            }
                        }
                        return;
                    }

                    flashSquare(queeSquareId, queeSquareClass);
                    let queeFlash = setInterval(flashSquare, 3000, queeSquareId, queeSquareClass);
                    flashMoves.push(queeFlash);

                    //make square available
                    document.getElementById(queeSquareId).setAttribute("data-available","true")

                    downRightbQueen(queeSquare);
                }

                downRightbQueen(squareNumber);

                //down-left
                function downLeftbQueen(squareNumber) {
                    
                    let queeSquare = +squareNumber - 7
                    let queeColumn = queeSquare % 8;
                    if (queeSquare <= 0 || queeColumn === 1) {return};

                    let queeDiv = document.querySelector(`[data-numbered="${queeSquare}"]`);
                    let queeSquareId = queeDiv.id;
                    let queeSquareClass = queeDiv.className;

                    if (queeDiv.firstChild) {

                        //check if piece can be taken
                        if (queeDiv.firstChild != null) {
                            if (queeDiv.firstChild.className === 'wPiece') {
                                flashSquare(queeSquareId, queeSquareClass);
                                let queeFlash = setInterval(flashSquare, 3000, queeSquareId, queeSquareClass);
                                flashMoves.push(queeFlash);
                                document.getElementById(queeSquareId).setAttribute("data-available","take")
                            }
                        }
                        return;
                    }

                    flashSquare(queeSquareId, queeSquareClass);
                    let queeFlash = setInterval(flashSquare, 3000, queeSquareId, queeSquareClass);
                    flashMoves.push(queeFlash);

                    //make square available
                    document.getElementById(queeSquareId).setAttribute("data-available","true")

                    downLeftbQueen(queeSquare);
                }

                downLeftbQueen(squareNumber);

                //Up-left
                function upLeftbQueen(squareNumber) {
                    
                    let queeSquare = +squareNumber + 9
                    let queeColumn = queeSquare % 8;
                    if (queeSquare > 64 || queeColumn === 1) {return};

                    let queeDiv = document.querySelector(`[data-numbered="${queeSquare}"]`);
                    let queeSquareId = queeDiv.id;
                    let queeSquareClass = queeDiv.className;

                    if (queeDiv.firstChild) {

                        //check if piece can be taken
                        if (queeDiv.firstChild != null) {
                            if (queeDiv.firstChild.className === 'wPiece') {
                                flashSquare(queeSquareId, queeSquareClass);
                                let queeFlash = setInterval(flashSquare, 3000, queeSquareId, queeSquareClass);
                                flashMoves.push(queeFlash);
                                document.getElementById(queeSquareId).setAttribute("data-available","take")
                            }
                        }
                        return;
                    }

                    flashSquare(queeSquareId, queeSquareClass);
                    let queeFlash = setInterval(flashSquare, 3000, queeSquareId, queeSquareClass);
                    flashMoves.push(queeFlash);

                    //make square available
                    document.getElementById(queeSquareId).setAttribute("data-available","true")

                    upLeftbQueen(queeSquare);
                }

                upLeftbQueen(squareNumber);
            
                break;

            case 'wKnig':

                {
                //upper right 1
                let knightSquare = +squareNumber + 15;
                let knightColumn = knightSquare % 8;

                if (knightSquare <= 64 && knightColumn != 0) {

                    let knightDiv = document.querySelector(`[data-numbered="${knightSquare}"]`);
                    let knightSquareId = knightDiv.id;
                    let knightSquareClass = knightDiv.className;

                    if (knightDiv.firstChild) {

                        //check if piece can be taken
                        if (knightDiv.firstChild.className === 'bPiece') {
                            flashSquare(knightSquareId, knightSquareClass);
                            let knightFlash = setInterval(flashSquare, 3000, knightSquareId, knightSquareClass);
                            flashMoves.push(knightFlash);
                            document.getElementById(knightSquareId).setAttribute("data-available","take")
                        };

                    } else {

                        flashSquare(knightSquareId, knightSquareClass);
                        let knightFlash = setInterval(flashSquare, 3000, knightSquareId, knightSquareClass);
                        flashMoves.push(knightFlash);
                        document.getElementById(knightSquareId).setAttribute("data-available","true")
                    };
                };
                };

                {
                    //upper right 2
                    let knightSquare = +squareNumber + 6;
                    let knightColumn = knightSquare % 8;

                    if (knightSquare <= 64 && knightColumn != 0 && knightColumn != 7) {

                        let knightDiv = document.querySelector(`[data-numbered="${knightSquare}"]`);
                        let knightSquareId = knightDiv.id;
                        let knightSquareClass = knightDiv.className;

                        if (knightDiv.firstChild) {

                            //check if piece can be taken
                            if (knightDiv.firstChild.className === 'bPiece') {
                                flashSquare(knightSquareId, knightSquareClass);
                                let knightFlash = setInterval(flashSquare, 3000, knightSquareId, knightSquareClass);
                                flashMoves.push(knightFlash);
                                document.getElementById(knightSquareId).setAttribute("data-available","take")
                            };

                        } else {

                            flashSquare(knightSquareId, knightSquareClass);
                            let knightFlash = setInterval(flashSquare, 3000, knightSquareId, knightSquareClass);
                            flashMoves.push(knightFlash);
                            document.getElementById(knightSquareId).setAttribute("data-available","true")
                        };
                    };
                }

                {
                    //upper left 1
                    let knightSquare = +squareNumber + 17;
                    let knightColumn = knightSquare % 8;

                    if (knightSquare <= 64 && knightColumn != 1) {

                        let knightDiv = document.querySelector(`[data-numbered="${knightSquare}"]`);
                        let knightSquareId = knightDiv.id;
                        let knightSquareClass = knightDiv.className;

                        if (knightDiv.firstChild) {

                            //check if piece can be taken
                            if (knightDiv.firstChild.className === 'bPiece') {
                                flashSquare(knightSquareId, knightSquareClass);
                                let knightFlash = setInterval(flashSquare, 3000, knightSquareId, knightSquareClass);
                                flashMoves.push(knightFlash);
                                document.getElementById(knightSquareId).setAttribute("data-available","take")
                            };
                            
                        } else {

                            flashSquare(knightSquareId, knightSquareClass);
                            let knightFlash = setInterval(flashSquare, 3000, knightSquareId, knightSquareClass);
                            flashMoves.push(knightFlash);
                            document.getElementById(knightSquareId).setAttribute("data-available","true")
                        };
                    };
                }

                {
                    //upper left 2
                    let knightSquare = +squareNumber + 10;
                    let knightColumn = knightSquare % 8;

                    if (knightSquare <= 64 && knightColumn != 1 && knightColumn != 2) {

                        let knightDiv = document.querySelector(`[data-numbered="${knightSquare}"]`);
                        let knightSquareId = knightDiv.id;
                        let knightSquareClass = knightDiv.className;

                        if (knightDiv.firstChild) {

                            //check if piece can be taken
                            if (knightDiv.firstChild.className === 'bPiece') {
                                flashSquare(knightSquareId, knightSquareClass);
                                let knightFlash = setInterval(flashSquare, 3000, knightSquareId, knightSquareClass);
                                flashMoves.push(knightFlash);
                                document.getElementById(knightSquareId).setAttribute("data-available","take")
                            };
                            
                        } else {

                            flashSquare(knightSquareId, knightSquareClass);
                            let knightFlash = setInterval(flashSquare, 3000, knightSquareId, knightSquareClass);
                            flashMoves.push(knightFlash);
                            document.getElementById(knightSquareId).setAttribute("data-available","true")
                        };
                    };
                }

                {
                    //lower left 1
                    let knightSquare = +squareNumber - 6;
                    let knightColumn = knightSquare % 8;

                    if (knightSquare > 0 && knightColumn != 1 && knightColumn != 2) {

                        let knightDiv = document.querySelector(`[data-numbered="${knightSquare}"]`);
                        let knightSquareId = knightDiv.id;
                        let knightSquareClass = knightDiv.className;

                        if (knightDiv.firstChild) {

                            //check if piece can be taken
                            if (knightDiv.firstChild.className === 'bPiece') {
                                flashSquare(knightSquareId, knightSquareClass);
                                let knightFlash = setInterval(flashSquare, 3000, knightSquareId, knightSquareClass);
                                flashMoves.push(knightFlash);
                                document.getElementById(knightSquareId).setAttribute("data-available","take")
                            };
                            
                        } else {

                            flashSquare(knightSquareId, knightSquareClass);
                            let knightFlash = setInterval(flashSquare, 3000, knightSquareId, knightSquareClass);
                            flashMoves.push(knightFlash);
                            document.getElementById(knightSquareId).setAttribute("data-available","true")
                        };
                    };
                }

                {
                    //lower left 2
                    let knightSquare = +squareNumber - 15;
                    let knightColumn = knightSquare % 8;

                    if (knightSquare > 0 && knightColumn != 1 && knightColumn != 2) {

                        let knightDiv = document.querySelector(`[data-numbered="${knightSquare}"]`);
                        let knightSquareId = knightDiv.id;
                        let knightSquareClass = knightDiv.className;

                        if (knightDiv.firstChild) {

                            //check if piece can be taken
                            if (knightDiv.firstChild.className === 'bPiece') {
                                flashSquare(knightSquareId, knightSquareClass);
                                let knightFlash = setInterval(flashSquare, 3000, knightSquareId, knightSquareClass);
                                flashMoves.push(knightFlash);
                                document.getElementById(knightSquareId).setAttribute("data-available","take")
                            };
                            
                        } else {

                            flashSquare(knightSquareId, knightSquareClass);
                            let knightFlash = setInterval(flashSquare, 3000, knightSquareId, knightSquareClass);
                            flashMoves.push(knightFlash);
                            document.getElementById(knightSquareId).setAttribute("data-available","true")
                        };
                    };
                }

                {
                    //lower right 1
                    let knightSquare = +squareNumber - 10;
                    let knightColumn = knightSquare % 8;

                    if (knightSquare > 0 && knightColumn != 0 && knightColumn != 7) {

                        let knightDiv = document.querySelector(`[data-numbered="${knightSquare}"]`);
                        let knightSquareId = knightDiv.id;
                        let knightSquareClass = knightDiv.className;

                        if (knightDiv.firstChild) {

                            //check if piece can be taken
                            if (knightDiv.firstChild.className === 'bPiece') {
                                flashSquare(knightSquareId, knightSquareClass);
                                let knightFlash = setInterval(flashSquare, 3000, knightSquareId, knightSquareClass);
                                flashMoves.push(knightFlash);
                                document.getElementById(knightSquareId).setAttribute("data-available","take")
                            };
                            
                        } else {

                            flashSquare(knightSquareId, knightSquareClass);
                            let knightFlash = setInterval(flashSquare, 3000, knightSquareId, knightSquareClass);
                            flashMoves.push(knightFlash);
                            document.getElementById(knightSquareId).setAttribute("data-available","true")
                        };
                    };
                }

                {
                    //lower right 1
                    let knightSquare = +squareNumber - 17;
                    let knightColumn = knightSquare % 8;

                    if (knightSquare > 0 && knightColumn != 0 && knightColumn != 7) {

                        let knightDiv = document.querySelector(`[data-numbered="${knightSquare}"]`);
                        let knightSquareId = knightDiv.id;
                        let knightSquareClass = knightDiv.className;

                        if (knightDiv.firstChild) {

                            //check if piece can be taken
                            if (knightDiv.firstChild.className === 'bPiece') {
                                flashSquare(knightSquareId, knightSquareClass);
                                let knightFlash = setInterval(flashSquare, 3000, knightSquareId, knightSquareClass);
                                flashMoves.push(knightFlash);
                                document.getElementById(knightSquareId).setAttribute("data-available","take")
                            };
                            
                        } else {

                            flashSquare(knightSquareId, knightSquareClass);
                            let knightFlash = setInterval(flashSquare, 3000, knightSquareId, knightSquareClass);
                            flashMoves.push(knightFlash);
                            document.getElementById(knightSquareId).setAttribute("data-available","true")
                        };
                    };
                }
                break;

                case 'bKnig':

                {
                //upper right 1
                let knightSquare = +squareNumber + 15;
                let knightColumn = knightSquare % 8;

                if (knightSquare <= 64 && knightColumn != 0) {

                    let knightDiv = document.querySelector(`[data-numbered="${knightSquare}"]`);
                    let knightSquareId = knightDiv.id;
                    let knightSquareClass = knightDiv.className;

                    if (knightDiv.firstChild) {

                        //check if piece can be taken
                        if (knightDiv.firstChild.className === 'wPiece') {
                            flashSquare(knightSquareId, knightSquareClass);
                            let knightFlash = setInterval(flashSquare, 3000, knightSquareId, knightSquareClass);
                            flashMoves.push(knightFlash);
                            document.getElementById(knightSquareId).setAttribute("data-available","take")
                        };

                    } else {

                        flashSquare(knightSquareId, knightSquareClass);
                        let knightFlash = setInterval(flashSquare, 3000, knightSquareId, knightSquareClass);
                        flashMoves.push(knightFlash);
                        document.getElementById(knightSquareId).setAttribute("data-available","true")
                    };
                };
                };

                {
                    //upper right 2
                    let knightSquare = +squareNumber + 6;
                    let knightColumn = knightSquare % 8;

                    if (knightSquare <= 64 && knightColumn != 0 && knightColumn != 7) {

                        let knightDiv = document.querySelector(`[data-numbered="${knightSquare}"]`);
                        let knightSquareId = knightDiv.id;
                        let knightSquareClass = knightDiv.className;

                        if (knightDiv.firstChild) {

                            //check if piece can be taken
                            if (knightDiv.firstChild.className === 'wPiece') {
                                flashSquare(knightSquareId, knightSquareClass);
                                let knightFlash = setInterval(flashSquare, 3000, knightSquareId, knightSquareClass);
                                flashMoves.push(knightFlash);
                                document.getElementById(knightSquareId).setAttribute("data-available","take")
                            };

                        } else {

                            flashSquare(knightSquareId, knightSquareClass);
                            let knightFlash = setInterval(flashSquare, 3000, knightSquareId, knightSquareClass);
                            flashMoves.push(knightFlash);
                            document.getElementById(knightSquareId).setAttribute("data-available","true")
                        };
                    };
                }

                {
                    //upper left 1
                    let knightSquare = +squareNumber + 17;
                    let knightColumn = knightSquare % 8;

                    if (knightSquare <= 64 && knightColumn != 1) {

                        let knightDiv = document.querySelector(`[data-numbered="${knightSquare}"]`);
                        let knightSquareId = knightDiv.id;
                        let knightSquareClass = knightDiv.className;

                        if (knightDiv.firstChild) {

                            //check if piece can be taken
                            if (knightDiv.firstChild.className === 'wPiece') {
                                flashSquare(knightSquareId, knightSquareClass);
                                let knightFlash = setInterval(flashSquare, 3000, knightSquareId, knightSquareClass);
                                flashMoves.push(knightFlash);
                                document.getElementById(knightSquareId).setAttribute("data-available","take")
                            };
                            
                        } else {

                            flashSquare(knightSquareId, knightSquareClass);
                            let knightFlash = setInterval(flashSquare, 3000, knightSquareId, knightSquareClass);
                            flashMoves.push(knightFlash);
                            document.getElementById(knightSquareId).setAttribute("data-available","true")
                        };
                    };
                }

                {
                    //upper left 2
                    let knightSquare = +squareNumber + 10;
                    let knightColumn = knightSquare % 8;

                    if (knightSquare <= 64 && knightColumn != 1 && knightColumn != 2) {

                        let knightDiv = document.querySelector(`[data-numbered="${knightSquare}"]`);
                        let knightSquareId = knightDiv.id;
                        let knightSquareClass = knightDiv.className;

                        if (knightDiv.firstChild) {

                            //check if piece can be taken
                            if (knightDiv.firstChild.className === 'wPiece') {
                                flashSquare(knightSquareId, knightSquareClass);
                                let knightFlash = setInterval(flashSquare, 3000, knightSquareId, knightSquareClass);
                                flashMoves.push(knightFlash);
                                document.getElementById(knightSquareId).setAttribute("data-available","take")
                            };
                            
                        } else {

                            flashSquare(knightSquareId, knightSquareClass);
                            let knightFlash = setInterval(flashSquare, 3000, knightSquareId, knightSquareClass);
                            flashMoves.push(knightFlash);
                            document.getElementById(knightSquareId).setAttribute("data-available","true")
                        };
                    };
                }

                {
                    //lower left 1
                    let knightSquare = +squareNumber - 6;
                    let knightColumn = knightSquare % 8;

                    if (knightSquare > 0 && knightColumn != 1 && knightColumn != 2) {

                        let knightDiv = document.querySelector(`[data-numbered="${knightSquare}"]`);
                        let knightSquareId = knightDiv.id;
                        let knightSquareClass = knightDiv.className;

                        if (knightDiv.firstChild) {

                            //check if piece can be taken
                            if (knightDiv.firstChild.className === 'wPiece') {
                                flashSquare(knightSquareId, knightSquareClass);
                                let knightFlash = setInterval(flashSquare, 3000, knightSquareId, knightSquareClass);
                                flashMoves.push(knightFlash);
                                document.getElementById(knightSquareId).setAttribute("data-available","take")
                            };
                            
                        } else {

                            flashSquare(knightSquareId, knightSquareClass);
                            let knightFlash = setInterval(flashSquare, 3000, knightSquareId, knightSquareClass);
                            flashMoves.push(knightFlash);
                            document.getElementById(knightSquareId).setAttribute("data-available","true")
                        };
                    };
                }

                {
                    //lower left 2
                    let knightSquare = +squareNumber - 15;
                    let knightColumn = knightSquare % 8;

                    if (knightSquare > 0 && knightColumn != 1) {

                        let knightDiv = document.querySelector(`[data-numbered="${knightSquare}"]`);
                        let knightSquareId = knightDiv.id;
                        let knightSquareClass = knightDiv.className;

                        if (knightDiv.firstChild) {

                            //check if piece can be taken
                            if (knightDiv.firstChild.className === 'wPiece') {
                                flashSquare(knightSquareId, knightSquareClass);
                                let knightFlash = setInterval(flashSquare, 3000, knightSquareId, knightSquareClass);
                                flashMoves.push(knightFlash);
                                document.getElementById(knightSquareId).setAttribute("data-available","take")
                            };
                            
                        } else {

                            flashSquare(knightSquareId, knightSquareClass);
                            let knightFlash = setInterval(flashSquare, 3000, knightSquareId, knightSquareClass);
                            flashMoves.push(knightFlash);
                            document.getElementById(knightSquareId).setAttribute("data-available","true")
                        };
                    };
                }

                {
                    //lower right 1
                    let knightSquare = +squareNumber - 10;
                    let knightColumn = knightSquare % 8;

                    if (knightSquare > 0 && knightColumn != 0 && knightColumn != 7) {

                        let knightDiv = document.querySelector(`[data-numbered="${knightSquare}"]`);
                        let knightSquareId = knightDiv.id;
                        let knightSquareClass = knightDiv.className;

                        if (knightDiv.firstChild) {

                            //check if piece can be taken
                            if (knightDiv.firstChild.className === 'wPiece') {
                                flashSquare(knightSquareId, knightSquareClass);
                                let knightFlash = setInterval(flashSquare, 3000, knightSquareId, knightSquareClass);
                                flashMoves.push(knightFlash);
                                document.getElementById(knightSquareId).setAttribute("data-available","take")
                            };
                            
                        } else {

                            flashSquare(knightSquareId, knightSquareClass);
                            let knightFlash = setInterval(flashSquare, 3000, knightSquareId, knightSquareClass);
                            flashMoves.push(knightFlash);
                            document.getElementById(knightSquareId).setAttribute("data-available","true")
                        };
                    };
                }

                {
                    //lower right 2
                    let knightSquare = +squareNumber - 17;
                    let knightColumn = knightSquare % 8;

                    if (knightSquare > 0 && knightColumn != 0) {

                        let knightDiv = document.querySelector(`[data-numbered="${knightSquare}"]`);
                        let knightSquareId = knightDiv.id;
                        let knightSquareClass = knightDiv.className;

                        if (knightDiv.firstChild) {

                            //check if piece can be taken
                            if (knightDiv.firstChild.className === 'wPiece') {
                                flashSquare(knightSquareId, knightSquareClass);
                                let knightFlash = setInterval(flashSquare, 3000, knightSquareId, knightSquareClass);
                                flashMoves.push(knightFlash);
                                document.getElementById(knightSquareId).setAttribute("data-available","take")
                            };
                            
                        } else {

                            flashSquare(knightSquareId, knightSquareClass);
                            let knightFlash = setInterval(flashSquare, 3000, knightSquareId, knightSquareClass);
                            flashMoves.push(knightFlash);
                            document.getElementById(knightSquareId).setAttribute("data-available","true")
                        };
                    };
                }
                break;
        };

        //move piece
        function onMouseMove(e) {
            moveAt(e.pageX, e.pageY); 
        }

        document.addEventListener('mousemove', onMouseMove);


        //drop piece
        function onMouseUp(e) {

            //find square ID under drop point
            pieceToPickUp.hidden = true;
            let endLocation = document.elementFromPoint(e.clientX, e.clientY).id
            let takenPiece = document.getElementById(endLocation);
            //get ID of square below if piece is in the way
            if (document.getElementById(endLocation).className.slice(1) === 'Piece' && document.getElementById(endLocation).parentElement.getAttribute('data-available') === "take") {
                endLocation = document.getElementById(endLocation).parentElement.id;
            };
            let dropSquare = document.getElementById(endLocation);
            pieceToPickUp.hidden = false;

            //Can only place on available squares
            if(document.getElementById(dropSquare.id).getAttribute('data-available') === "true") {
                
                //snap to square on drop
                document.removeEventListener('mousemove', onMouseMove);
                pieceToPickUp.onmouseup = null;
                dropSquare.append(pieceToPickUp);
                pieceToPickUp.style.position = "relative";
                pieceToPickUp.style.left = "5px";
                pieceToPickUp.style.top = "5px";
                document.getElementById(pieceToPickUp.id).setAttribute("data-moved","true")
                clearFlashMoves(flashMoves);
                addToLog(startSquareId, dropSquare.id, pieceToPickUp.id, turnCount)
                endTurn();
            
            //take piece
            } else if (document.getElementById(dropSquare.id).getAttribute('data-available') === "take"){

                // TO ADD - remove other piece to graveyard
                //snap to square on drop
                document.removeEventListener('mousemove', onMouseMove);
                pieceToPickUp.onmouseup = null;
                graveyard.append(dropSquare.firstChild);
                dropSquare.append(pieceToPickUp);
                pieceToPickUp.style.position = "relative";
                pieceToPickUp.style.left = "5px";
                pieceToPickUp.style.top = "5px";
                document.getElementById(pieceToPickUp.id).setAttribute("data-moved","true")
                clearFlashMoves(flashMoves);
                addToLog(startSquareId, dropSquare.id, pieceToPickUp.id, turnCount, takenPiece.id);
                endTurn();

            } else {

                //snap to square on drop
                document.removeEventListener('mousemove', onMouseMove);
                pieceToPickUp.onmouseup = null;
                document.getElementById(startSquareId).append(pieceToPickUp);
                pieceToPickUp.style.position = "relative";
                pieceToPickUp.style.left = "5px";
                pieceToPickUp.style.top = "5px";
                clearFlashMoves(flashMoves);
                flashTurn(turn)
                flashInterval = setInterval(flashTurn, 3000, turn)

                //put all spaces back to available = no

                let allSquares = [];

                let white = document.getElementsByClassName('whiteSquare');
                let black = document.getElementsByClassName('blackSquare');

                for (let ws of white) {
                    allSquares.push(ws)
                };

                for (let bs of black) {
                    allSquares.push(bs)
                };
    
                for (let squares of allSquares) {
        
                    document.getElementById(squares.id).setAttribute('data-available','false')
                };
                
            };

        };


        document.addEventListener('mouseup', onMouseUp, {once:true})

        
        
    };

    if (turn) {
        let whitePieces = document.getElementsByClassName("wPiece");
        for (var i = 0; i < whitePieces.length; i++) {
            whitePieces[i].addEventListener('mousedown', onMouseDown);
        };
    } else if (!turn) {
        let blackPieces = document.getElementsByClassName("bPiece");
        for (var i = 0; i < blackPieces.length; i++) {
            blackPieces[i].addEventListener('mousedown', onMouseDown);
        };
    };


    
    document.ondragstart = function() {
        return false;
    };

}

//flash a square
function flashSquare(squareId, squareClass) {

    let squareThisOne = document.getElementById(squareId)

    squareThisOne.style.backgroundColor = "red"

    if (squareClass.includes("white")) {
        setTimeout(() => {
            squareThisOne.style.backgroundColor = "white";
        }, 1500)
    } else if (squareClass.includes("black")) {
        setTimeout(() => {
            squareThisOne.style.backgroundColor = "black";
        }, 1500)
    };

};

function clearFlashMoves(flashMoves) {
    for (moves of flashMoves) {
        clearInterval(moves);
    };
};

/*function continuousFlashSquare(squareId, squareClass) {
    flashSquare(squareId, squareClass);
    flashMoves = setInterval(flashSquare, 3000, squareId, squareClass)
};*/

function addToLog(startSquare, dropSquare, piece, turnCount, pieceTaken = null) {

    if (pieceTaken == null) {
        gameLog.innerText += `${turnCount}. ${piece}: ${startSquare} -> ${dropSquare}. \r\n`
    } else {
        gameLog.innerText += `${turnCount}. ${piece}: ${startSquare} -> ${dropSquare} takes ${pieceTaken}. \r\n`   
    };

}

function checkCastle() {

    if (turn) {
        if (document.getElementById('wKing').getAttribute('data-moved') === "false" && document.getElementById('wRook2').getAttribute('data-moved') === "false") {

            if (!(document.getElementById('G1').firstChild) && !(document.getElementById('F1').firstChild)) {
                document.getElementById('castle').style.display = 'block';
                castleNum = 1;
                return castleNum;
            };
        };
        if (document.getElementById('wKing').getAttribute('data-moved') === "false" && document.getElementById('wRook1').getAttribute('data-moved') === "false") {

            if (!(document.getElementById('B1').firstChild) && !(document.getElementById('C1').firstChild) && !(document.getElementById('D1').firstChild)) {
                document.getElementById('castle').style.display = 'block';
                castleNum = 2;
                return castleNum;
            };
        };
    } else if (!turn) {
        if (document.getElementById('bKing').getAttribute('data-moved') === "false" && document.getElementById('bRook1').getAttribute('data-moved') === "false") {

            if (!(document.getElementById('G8').firstChild) && !(document.getElementById('F8').firstChild)) {
                document.getElementById('castle').style.display = 'block';
                castleNum = 3;
                return castleNum;
            };
        };
        if (document.getElementById('bKing').getAttribute('data-moved') === "false" && document.getElementById('bRook2').getAttribute('data-moved') === "false") {

            if (!(document.getElementById('B8').firstChild) && !(document.getElementById('C8').firstChild) && !(document.getElementById('D8').firstChild)) {
                document.getElementById('castle').style.display = 'block';
                castleNum = 4;
                return castleNum;
            };
        };
    };
    
}

function castle() {

    if (turn) {
        switch (castleNum) {

            case 1:

                document.getElementById('G1').append(document.getElementById('wKing'));
                document.getElementById('F1').append(document.getElementById('wRook2'));

            break;

            case 2:

                document.getElementById('C1').append(document.getElementById('wKing'));
                document.getElementById('D1').append(document.getElementById('wRook1'));

            break;
        }
    } else if (!turn) {
        switch (castleNum){
            case 3:

                document.getElementById('G8').append(document.getElementById('bKing'));
                document.getElementById('F8').append(document.getElementById('bRook2'));

            break;

            case 4:

                document.getElementById('C8').append(document.getElementById('bKing'));
                document.getElementById('D8').append(document.getElementById('bRook1'));

            break;
        };
    };
}

function moveCheck(turn) {

    if (turn) {
        let color = 'b';
    } else if (!turn) {
        let color = 'w';
    }

    //search up


}

function endCheck() {

    

}