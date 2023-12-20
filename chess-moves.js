import { whiteSet, blackSet, pieceAtPosition, capturePiece, isPathBlocked, activeSide, performCastle } from "./script.js";

function isValidCastle(initialPosition, targetPosition) {
    const dx = Math.abs(targetPosition[0] - initialPosition[0]);
    const dy = Math.abs(targetPosition[1] - initialPosition[1]);

    if (dx === 2 && dy === 0 && initialPosition[1] === targetPosition[1]) {
        if (targetPosition[0] === initialPosition[0] + 2) {
            const hasKingMoved = activeSide === 'white' ? initialPosition[0] === 4 && initialPosition[1] === 7 : initialPosition[0] === 4 && initialPosition[1] === 0;

            function hasRightRookMoved() {
                if (activeSide === 'white') {
                    return whiteSet.white_rook.h_rook[0] !== 7 || whiteSet.white_rook.h_rook[1] !== 7;
                } else {
                    return blackSet.black_rook.h_rook[0] !== 0 || blackSet.black_rook.h_rook[1] !== 7;
                }
            }

            function isPathClearForRightCastle() {
                if (activeSide === 'white') {
                    return !pieceAtPosition(whiteSet, 5, 7) && !pieceAtPosition(whiteSet, 6, 7);
                } else {
                    return !pieceAtPosition(blackSet, 5, 0) && !pieceAtPosition(blackSet, 6, 0);
                }
            }

            if (!hasKingMoved && !hasRightRookMoved() && isPathClearForRightCastle()) {
                performCastle('king');
                return true;
            }
        } else if (targetPosition[0] === initialPosition[0] - 2) {
            const hasKingMoved = activeSide === 'white' ? initialPosition[0] === 4 && initialPosition[1] === 7 : initialPosition[0] === 4 && initialPosition[1] === 0;

            function hasLeftRookMoved() {
                if (activeSide === 'white') {
                    return whiteSet.white_rook.a_rook[0] !== 0 || whiteSet.white_rook.a_rook[1] !== 7;
                } else {
                    return blackSet.black_rook.a_rook[0] !== 0 || blackSet.black_rook.a_rook[1] !== 0;
                }
            }

            function isPathClearForLeftCastle() {
                if (activeSide === 'white') {
                    return !pieceAtPosition(whiteSet, 3, 7) && !pieceAtPosition(whiteSet, 2, 7) && !pieceAtPosition(whiteSet, 1, 7);
                } else {
                    return !pieceAtPosition(blackSet, 3, 0) && !pieceAtPosition(blackSet, 2, 0) && !pieceAtPosition(blackSet, 1, 0);
                }
            }

            if (!hasKingMoved && !hasLeftRookMoved() && isPathClearForLeftCastle()) {
                performCastle('queen');
                return true;
            }
        }
    }
    return false;
}

function isValidKingMove(color, initialPosition, targetPosition, isChecking) {
    const dx = Math.abs(targetPosition[0] - initialPosition[0]);
    const dy = Math.abs(targetPosition[1] - initialPosition[1]);
    const direction = color === 'white' ? -1 : 1;
    const forwardOne = initialPosition[1] + direction;
    const ownPieceSet = color === 'white' ? whiteSet : blackSet;
    const opposingPieceSet = color === 'white' ? blackSet : whiteSet;

    if (dx <= 1 && dy <= 1) {
        const capturedPiece = pieceAtPosition(opposingPieceSet, targetPosition[0], targetPosition[1]);
        if (capturedPiece && !capturedPiece.startsWith(color)) {
            if(!isChecking) capturePiece(opposingPieceSet, targetPosition[0], targetPosition[1]);
            return true;
        } else if (!pieceAtPosition(ownPieceSet, targetPosition[0], targetPosition[1])) {
            return true; 
        }
    } else if (!pieceAtPosition(opposingPieceSet, targetPosition[0], targetPosition[1]) && targetPosition[1] === forwardOne && targetPosition[0] === initialPosition[0]) {
        return true; 
    } else if(isValidCastle(initialPosition, targetPosition)){
        return true;
    }

    return false; 
}

function isValidQueenMove(color, initialPosition, targetPosition, isChecking) {
    const ownPieceSet = color === 'white' ? whiteSet : blackSet;
    const opposingPieceSet = color === 'white' ? blackSet : whiteSet;

    const dx = Math.abs(targetPosition[0] - initialPosition[0]);
    const dy = Math.abs(targetPosition[1] - initialPosition[1]);

    const dxValid = dx === dy || initialPosition[0] === targetPosition[0] || initialPosition[1] === targetPosition[1];

    if (dxValid && !isPathBlocked(initialPosition, targetPosition)) {
        const capturedPiece = pieceAtPosition(opposingPieceSet, targetPosition[0], targetPosition[1]);
        if (capturedPiece && !capturedPiece.startsWith(color)) {
            if(!isChecking) capturePiece(opposingPieceSet, targetPosition[0], targetPosition[1]);
            return true;
        } else if (!pieceAtPosition(ownPieceSet, targetPosition[0], targetPosition[1])) {
            return true; 
        }
    }

    return false; 
}

function isValidPawnMove(color, initialPosition, targetPosition, pieceSet, isChecking) {
    const direction = color === 'white' ? -1 : 1;
    const forwardOne = initialPosition[1] + direction;
    const forwardTwo = initialPosition[1] + 2 * direction;
    const opposingPieceSet = color === 'white' ? blackSet : whiteSet;

    function isFirstPawnMove() {
        return (color === 'white' && initialPosition[1] === 6) || (color === 'black' && initialPosition[1] === 1);
    }

    function isPawnCapture() {
        return (
            Math.abs(targetPosition[0] - initialPosition[0]) === 1 &&
            targetPosition[1] - initialPosition[1] === direction
        );
    }

    if (isPawnCapture()) {
        const capturedPiece = pieceAtPosition(opposingPieceSet, targetPosition[0], targetPosition[1]);
        if (capturedPiece) {
            if(!isChecking) capturePiece(opposingPieceSet, targetPosition[0], targetPosition[1]);
            return true;
        }
    } else {
        if (!pieceAtPosition(opposingPieceSet, targetPosition[0], targetPosition[1])) {
            if (targetPosition[0] === initialPosition[0]) {
                if (isFirstPawnMove()) {
                    if (targetPosition[1] === forwardTwo && !pieceAtPosition(pieceSet, initialPosition[0], forwardOne)) {
                        return true;
                    }
                }
                if (targetPosition[1] === forwardOne) {
                    return true;
                }
            }
        }
    }

    return false;
}

function isValidRookMove(color, initialPosition, targetPosition, isChecking) {
    const ownPieceSet = color === 'white' ? whiteSet : blackSet;
    const opposingPieceSet = color === 'white' ? blackSet : whiteSet;

    const validMove = initialPosition[0] === targetPosition[0] || initialPosition[1] === targetPosition[1];

    if (validMove && !isPathBlocked(initialPosition, targetPosition)) {
        const capturedPiece = pieceAtPosition(opposingPieceSet, targetPosition[0], targetPosition[1]);
        if (capturedPiece && !capturedPiece.startsWith(color)) {
            if(!isChecking) capturePiece(opposingPieceSet, targetPosition[0], targetPosition[1]);
            return true;
        } else if (!pieceAtPosition(ownPieceSet, targetPosition[0], targetPosition[1])) {
            return true;
        }
    }
    return false;
}

function isValidBishopMove(color, initialPosition, targetPosition, isChecking) {
    const ownPieceSet = color === 'white' ? whiteSet : blackSet;
    const opposingPieceSet = color === 'white' ? blackSet : whiteSet;

    const dx = Math.abs(targetPosition[0] - initialPosition[0]);
    const dy = Math.abs(targetPosition[1] - initialPosition[1]);

    const validMove = dx === dy;

    if (validMove && !isPathBlocked(initialPosition, targetPosition)) {
        const capturedPiece = pieceAtPosition(opposingPieceSet, targetPosition[0], targetPosition[1]);
        if (capturedPiece && !capturedPiece.startsWith(color)) {
            if(!isChecking) capturePiece(opposingPieceSet, targetPosition[0], targetPosition[1]);
            return true;
        } else if (!pieceAtPosition(ownPieceSet, targetPosition[0], targetPosition[1])) {
            return true;
        }
    }

    return false;
}

function isValidKnightMove(color, initialPosition, targetPosition, isChecking) {
    const ownPieceSet = color === 'white' ? whiteSet : blackSet;
    const opposingPieceSet = color === 'white' ? blackSet : whiteSet;

    const dx = Math.abs(targetPosition[0] - initialPosition[0]);
    const dy = Math.abs(targetPosition[1] - initialPosition[1]);

    const validMove = (dx === 1 && dy === 2) || (dx === 2 && dy === 1);

    if (validMove) {
        const capturedPiece = pieceAtPosition(opposingPieceSet, targetPosition[0], targetPosition[1]);
        if (capturedPiece && !capturedPiece.startsWith(color)) {
            if(!isChecking) capturePiece(opposingPieceSet, targetPosition[0], targetPosition[1]);
            return true;
        } else if (!pieceAtPosition(ownPieceSet, targetPosition[0], targetPosition[1])) {
            return true;
        }
    }

    return false;
}

export { 
    isValidBishopMove, 
    isValidKingMove, 
    isValidKnightMove,
    isValidPawnMove, 
    isValidQueenMove, 
    isValidRookMove,
    isValidCastle
}