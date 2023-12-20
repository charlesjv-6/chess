import { countdownTimer } from './chess-clock.js';
import { playSound } from './sound-manager.js';
import { 
    isValidBishopMove, 
    isValidKingMove, 
    isValidKnightMove,
    isValidPawnMove, 
    isValidQueenMove, 
    isValidRookMove
} from './chess-moves.js';

const canvas = document.getElementById('chess-board');
const canvasContext = canvas.getContext('2d');

const boardSize = 600;
canvas.width = boardSize;
canvas.height = boardSize;

const cellCize = boardSize / 8;
const columns = canvas.width / cellCize;
const rows = canvas.height / cellCize;

let activeSide = '';
let hasStarted = false;
let isNotCapturing = true;

const chessboardCoordinates = {
    'a8': [0, 0], 'b8': [1, 0], 'c8': [2, 0], 'd8': [3, 0], 'e8': [4, 0], 'f8': [5, 0], 'g8': [6, 0], 'h8': [7, 0],
    'a7': [0, 1], 'b7': [1, 1], 'c7': [2, 1], 'd7': [3, 1], 'e7': [4, 1], 'f7': [5, 1], 'g7': [6, 1], 'h7': [7, 1],
    'a6': [0, 2], 'b6': [1, 2], 'c6': [2, 2], 'd6': [3, 2], 'e6': [4, 2], 'f6': [5, 2], 'g6': [6, 2], 'h6': [7, 2],
    'a5': [0, 3], 'b5': [1, 3], 'c5': [2, 3], 'd5': [3, 3], 'e5': [4, 3], 'f5': [5, 3], 'g5': [6, 3], 'h5': [7, 3],
    'a4': [0, 4], 'b4': [1, 4], 'c4': [2, 4], 'd4': [3, 4], 'e4': [4, 4], 'f4': [5, 4], 'g4': [6, 4], 'h4': [7, 4],
    'a3': [0, 5], 'b3': [1, 5], 'c3': [2, 5], 'd3': [3, 5], 'e3': [4, 5], 'f3': [5, 5], 'g3': [6, 5], 'h3': [7, 5],
    'a2': [0, 6], 'b2': [1, 6], 'c2': [2, 6], 'd2': [3, 6], 'e2': [4, 6], 'f2': [5, 6], 'g2': [6, 6], 'h2': [7, 6],
    'a1': [0, 7], 'b1': [1, 7], 'c1': [2, 7], 'd1': [3, 7], 'e1': [4, 7], 'f1': [5, 7], 'g1': [6, 7], 'h1': [7, 7],
};

const pieceSrc = {
    black: {
        pawn: './images/pawn-black.png',
        rook: './images/rook-black.png',
        knight: './images/knight-black.png',
        bishop: './images/bishop-black.png',
        king: './images/king-black.png',
        queen: './images/queen-black.png',
    },
    white: {
        pawn: './images/pawn-white.png',
        rook: './images/rook-white.png',
        knight: './images/knight-white.png',
        bishop: './images/bishop-white.png',
        king: './images/king-white.png',
        queen: './images/queen-white.png',
    }
}
let blackSet = {
    color: 'black',
    black_pawn: {
        a_pawn: [0, 1],
        b_pawn: [1, 1],
        c_pawn: [2, 1],
        d_pawn: [3, 1],
        e_pawn: [4, 1],
        f_pawn: [5, 1],
        g_pawn: [6, 1],
        h_pawn: [7, 1]
    },
    black_rook: {
        a_rook: [0, 0],
        h_rook: [7, 0]
    },
    black_knight: {
        b_knight: [1, 0],
        g_knight: [6, 0]
    },
    black_bishop: {
        f_bishop: [2, 0],
        c_bishop: [5, 0]
    },
    black_king: [4, 0],
    black_queen: [3, 0]
}

let whiteSet = {
    color: 'white',
    white_pawn: {
        a_pawn: [0, 6],
        b_pawn: [1, 6],
        c_pawn: [2, 6],
        d_pawn: [3, 6],
        e_pawn: [4, 6],
        f_pawn: [5, 6],
        g_pawn: [6, 6],
        h_pawn: [7, 6]
    },
    white_rook: {
        h_rook: [7, 7],
        a_rook: [0, 7]
    },
    white_knight: {
        g_knight: [6, 7],
        b_knight: [1, 7]
    },
    white_bishop: {
        c_bishop: [5, 7],
        f_bishop: [2, 7]
    },
    white_king: [4, 7],
    white_queen: [3, 7]
}

// Preload images
const allPieceImages = {};
for (const color in pieceSrc) {
    allPieceImages[color] = {};
    for (const piece in pieceSrc[color]) {
        const img = new Image();
        img.src = pieceSrc[color][piece];
        allPieceImages[color][piece] = img;
    }
}

function start(){
    activeSide = 'white';
    if(!hasStarted) countdownTimer();
    hasStarted = true;
}

function drawBoard(){
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < columns; i++) {
        for (let j = 0; j < rows; j++) {
            canvasContext.fillStyle = (i + j) % 2 === 0 ? '#8a4c2d' : '#461e00';
            canvasContext.fillRect( i * cellCize, j * cellCize, cellCize, cellCize);
        }
    }
    drawPieces(whiteSet);
    drawPieces(blackSet);
}

function drawPiece(col, row, piece) {
    const image = allPieceImages[piece.color][piece.type];
    if(image) canvasContext.drawImage(image, (col + 0.05) * cellCize, (row + 0.05) * cellCize, 65, 65);
}

let selectedPiece = null;

function findPieceInPosition(set, col, row) {
    for (const key in set) {
        if (key === 'color') continue; 
        if (Array.isArray(set[key])) {
            if (set[key][0] === col && set[key][1] === row) {
                return key;
            }
        } else {
            const piece = Object.keys(set[key]).find(pieceKey => set[key][pieceKey][0] === col && set[key][pieceKey][1] === row);
            if (piece) return piece;
        }
    }
}
function pieceAtPosition(pieceSet, col, row) {
    for (const key in pieceSet) {
        if (Array.isArray(pieceSet[key])) {
            if (pieceSet[key][0] === col && pieceSet[key][1] === row) {
                return key;
            }
        } else {
            for (const piece in pieceSet[key]) {
                if (pieceSet[key][piece][0] === col && pieceSet[key][piece][1] === row) {
                    return piece;
                }
            }
        }
    }
    return null;
}
function isPathBlocked(initialPosition, targetPosition) {
    const [initialCol, initialRow] = initialPosition;
    const [targetCol, targetRow] = targetPosition;

    const dx = Math.abs(targetCol - initialCol);
    const dy = Math.abs(targetRow - initialRow);

    const colDirection = targetCol > initialCol ? 1 : targetCol < initialCol ? -1 : 0;
    const rowDirection = targetRow > initialRow ? 1 : targetRow < initialRow ? -1 : 0;

    if (dx === 0 && dy === 0) {
        return false;
    }

    if (dx === 0) {
        for (let i = 1; i < dy; i++) {
            if (pieceAtPosition(whiteSet, initialCol, initialRow + i * rowDirection) || 
                pieceAtPosition(blackSet, initialCol, initialRow + i * rowDirection)) {
                return true;
            }
        }
    } else if (dy === 0) {
        for (let i = 1; i < dx; i++) {
            if (pieceAtPosition(whiteSet, initialCol + i * colDirection, initialRow) || 
                pieceAtPosition(blackSet, initialCol + i * colDirection, initialRow)) {
                return true;
            }
        }
    } else if (dx === dy) {
        for (let i = 1; i < dx; i++) {
            if (pieceAtPosition(whiteSet, initialCol + i * colDirection, initialRow + i * rowDirection) || 
                pieceAtPosition(blackSet, initialCol + i * colDirection, initialRow + i * rowDirection)) {
                return true;
            }
        }
    }
    
    return false;
}

function capturePiece(pieceSet, col, row) {
    for (const key in pieceSet) {
        if (Array.isArray(pieceSet[key])) {
            if (pieceSet[key][0] === col && pieceSet[key][1] === row) {
                isNotCapturing = false;
                playSound(0);
                delete pieceSet[key];
                break;
            }
        } else {
            for (const piece in pieceSet[key]) {
                if (pieceSet[key][piece][0] === col && pieceSet[key][piece][1] === row) {
                    isNotCapturing = false;
                    playSound(0);
                    delete pieceSet[key][piece];
                    break;
                }
            }
        }
    }
}

function movePiece(selectedPiece, col, row, pieceSet) {
    const color = selectedPiece.includes('white') ? 'white' : 'black';
    isNotCapturing = true;

    Object.keys(pieceSet).find(set => {
        if(set === selectedPiece.substring(6)){
            if(selectedPiece.includes('king')){
                if(isValidKingMove(color, pieceSet[set], [col, row])) {
                    if(isNotCapturing) playSound(1);
                    pieceSet[set] = [col, row];
                    if(selectedPiece.includes(activeSide)) activeSide = activeSide === 'white' ? 'black' : 'white';
                }
            }
            if(selectedPiece.includes('queen')) {
                if(isValidQueenMove(color, pieceSet[set], [col, row]) && !isPathBlocked(pieceSet[set], [col, row])){
                    if(isNotCapturing) playSound(1);
                    pieceSet[set] = [col, row];
                    if(selectedPiece.includes(activeSide)) activeSide = activeSide === 'white' ? 'black' : 'white';
                }
            }
            logMove(col, row);
        }
        else{
            Object.keys(pieceSet[set]).find( piece => {
                if(piece === selectedPiece.substring(6)){
                    if (selectedPiece.includes('pawn')) {
                        if(isValidPawnMove(color, pieceSet[set][piece], [col, row]) && !isPathBlocked(pieceSet[set][piece], [col, row])) {
                            if(isNotCapturing) playSound(1);
                            pieceSet[set][piece] = [col, row];
                            if(selectedPiece.includes(activeSide)) activeSide = activeSide === 'white' ? 'black' : 'white';
                        } 
                    }
                    if (selectedPiece.includes('rook')) {
                        if(isValidRookMove(color, pieceSet[set][piece], [col, row]) && !isPathBlocked(pieceSet[set][piece], [col, row])) {
                            if(isNotCapturing) playSound(1);
                            pieceSet[set][piece] = [col, row];
                            if(selectedPiece.includes(activeSide)) activeSide = activeSide === 'white' ? 'black' : 'white';
                        } 
                    }
                    if (selectedPiece.includes('bishop')) {
                        if(isValidBishopMove(color, pieceSet[set][piece], [col, row]) && !isPathBlocked(pieceSet[set][piece], [col, row])) {
                            if(isNotCapturing) playSound(1);
                            pieceSet[set][piece] = [col, row];
                            if(selectedPiece.includes(activeSide)) activeSide = activeSide === 'white' ? 'black' : 'white';
                        } 
                    }
                    if (selectedPiece.includes('knight')) {
                        if(isValidKnightMove(color, pieceSet[set][piece], [col, row]) && !isPathBlocked(pieceSet[set][piece], [col, row])) {
                            if(isNotCapturing) playSound(1);
                            pieceSet[set][piece] = [col, row];
                            if(selectedPiece.includes(activeSide)) activeSide = activeSide === 'white' ? 'black' : 'white';
                        } 
                    }
                    logMove(col, row);
                }
            });
        }
    });
}

function performCastle(castleToSide){
    if(activeSide === 'white'){
        if(castleToSide === 'king'){
            whiteSet.white_rook.h_rook = [5, 7];
        }
        else {
            whiteSet.white_rook.a_rook = [3, 7];
        }
    }
    else {
        if(castleToSide === 'king'){
            blackSet.black_rook.h_rook = [5, 0];
        }
        else {
            blackSet.black_rook.a_rook = [3, 5];
        }
    }
}

function getValidMoves(selectedPiece, pieceSet) {
    const color = selectedPiece.includes('white') ? 'white' : 'black';
    const validMoves = [];

    function getPiecePosition() {
        let piecePosition = null;
    
        Object.keys(pieceSet).find(set => {
            if (set === selectedPiece.substring(6)) {
                piecePosition = pieceSet[set];
                return true; 
            } else {
                Object.keys(pieceSet[set]).find(piece => {
                    if (piece === selectedPiece.substring(6)) {
                        piecePosition = pieceSet[set][piece];
                        return true; 
                    }
                });
            }
        });
    
        return piecePosition;
    }
    
    const position = getPiecePosition();
    if(position){
        if (selectedPiece.includes('king')) {
            for (let col = 0; col < 8; col++) {
                for (let row = 0; row < 8; row++) {
                    const targetPosition = [col, row];
                    if (isValidKingMove(color, position, targetPosition, true) && !isPathBlocked(position, targetPosition)) {
                        validMoves.push(targetPosition);
                    }
                }
            }
        } else if (selectedPiece.includes('queen')) {
            for (let col = 0; col < 8; col++) {
                for (let row = 0; row < 8; row++) {
                    const targetPosition = [col, row];
                    if (isValidQueenMove(color, position, targetPosition, true) && !isPathBlocked(position, targetPosition)) {
                        validMoves.push(targetPosition);
                    }
                }
            }
        } else if (selectedPiece.includes('pawn')) {
            for (let col = 0; col < 8; col++) {
                for (let row = 0; row < 8; row++) {
                    const targetPosition = [col, row];
                    if (isValidPawnMove(color, position, targetPosition, pieceSet, true) && !isPathBlocked(position, targetPosition)) {
                        validMoves.push(targetPosition);
                    }
                }
            }
        } else if (selectedPiece.includes('rook')) {
            for (let col = 0; col < 8; col++) {
                for (let row = 0; row < 8; row++) {
                    const targetPosition = [col, row];
                    if (isValidRookMove(color, position, targetPosition, true) && !isPathBlocked(position, targetPosition)) {
                        validMoves.push(targetPosition);
                    }
                }
            }
        } else if (selectedPiece.includes('bishop')) {
            for (let col = 0; col < 8; col++) {
                for (let row = 0; row < 8; row++) {
                    const targetPosition = [col, row];
                    if (isValidBishopMove(color, position, targetPosition, true)) {
                        validMoves.push(targetPosition);
                    }
                }
            }
        } else if (selectedPiece.includes('knight')) {
            for (let col = 0; col < 8; col++) {
                for (let row = 0; row < 8; row++) {
                    const targetPosition = [col, row];
                    if (isValidKnightMove(color, position, targetPosition, true) && !isPathBlocked(position, targetPosition)) {
                        validMoves.push(targetPosition);
                    }
                }
            }
        }
    }

    return validMoves;
}

function logMove(col, row){
    if(selectedPiece.includes('king') || selectedPiece.includes('queen')){
        console.log(selectedPiece.substring(12), 
            Object.keys(chessboardCoordinates).find(coord => {
                const [x, y] = chessboardCoordinates[coord];
                return x === col && y === row;
            })
        );
        return;
    }
    console.log(selectedPiece.substring(8), 
        Object.keys(chessboardCoordinates).find(coord => {
            const [x, y] = chessboardCoordinates[coord];
            return x === col && y === row;
        })
    );
}

function highlightValidMoves() {
    if (selectedPiece) {
        const pieceSet = selectedPiece.includes('white') ? whiteSet : blackSet;
        const validMoves = getValidMoves(selectedPiece, pieceSet); 
        validMoves.forEach(move => {
            canvasContext.fillStyle = 'rgba(0, 255, 0, 0.25)'; 
            canvasContext.fillRect(move[0] * cellCize, move[1] * cellCize, cellCize, cellCize);
        });
    }
}

canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const col = Math.floor(x / (canvas.width / columns));
    const row = Math.floor(y / (canvas.height / rows));

    const whitePiece = findPieceInPosition(whiteSet, col, row);
    const blackPiece = findPieceInPosition(blackSet, col, row);

    function pieceSet(){
        if(activeSide === 'white'){
            return whiteSet;
        }
        else if(activeSide === 'black'){
            return blackSet;
        }
    };

    if(selectedPiece == null){
        whitePiece ? selectedPiece = "white_" + whitePiece : selectedPiece = "black_" + blackPiece;
    }
    else {
        if(hasStarted) movePiece(selectedPiece, col, row, pieceSet());
        selectedPiece = null;
    }

    drawBoard();
    highlightValidMoves();

    canvasContext.strokeStyle = 'red';
    canvasContext.lineWidth = 3;
    canvasContext.strokeRect(
        col * (canvas.width / columns), 
        row * (canvas.height / rows), 
        canvas.width / columns, 
        canvas.height / rows
    );
});

function getImage(piece, color) {
    const pieceType = [
        'pawn',
        'rook',
        'bishop',
        'knight',
        'king',
        'queen',
    ];
    let src = '';

    pieceType.forEach(type => {
        if (piece.includes(type)) {
            if (color === 'white') {
                src = pieceSrc.white[type];
            } else if (color === 'black') {
                src = pieceSrc.black[type];
            }
        }
    });

    return src;
}

function drawPieces(pieceSet){
    const color = pieceSet == whiteSet ? 'white' : 'black';
    Object.keys(pieceSet).forEach(set => {
        if(typeof pieceSet[set] !== 'number'){
            drawPiece(
                pieceSet[set][0],
                pieceSet[set][1],
                { type: set.slice(6), color }
            );
        }
        Object.keys(pieceSet[set]).forEach(piece => {
            drawPiece(
                pieceSet[set][piece][0], 
                pieceSet[set][piece][1], 
                { type: piece.slice(2), color }
            );
        });
    });
}


// canvas.addEventListener('mousemove', e => {
//     const rect = canvas.getBoundingClientRect();
//     const x = e.clientX - rect.left;
//     const y = e.clientY - rect.top;

//     const cellX = Math.floor(x / (canvas.width / columns));
//     const cellY = Math.floor(y / (canvas.height / rows));

//     drawBoard();
//     canvasContext.strokeStyle = '#43ff2f';
//     canvasContext.lineWidth = 3;
//     canvasContext.strokeRect(
//         cellX * (canvas.width / columns), 
//         cellY * (canvas.height / rows), 
//         canvas.width / columns, 
//         canvas.height / rows
//     );
// });

window.onload = function() {
    drawBoard();
};

document.getElementById('start-btn').addEventListener('click', start);

export {
    activeSide,
    blackSet,
    whiteSet,
    isPathBlocked,
    pieceAtPosition,
    capturePiece,
    performCastle
}