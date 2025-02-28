let chess;
let selectedSquare = null;
let currentTurn = "WHITE";

function initChess() {
    Module().then((Module) => {
        chess = new Module.ChessWASM();
        chess.resetBoard();
        updateTurnDisplay();
        renderBoard();
    });
}

function updateTurnDisplay() {
    document.getElementById("turnDisplay").textContent = `Turn: ${currentTurn}`;
}

function switchTurn() {
    currentTurn = currentTurn === "WHITE" ? "BLACK" : "WHITE";
    updateTurnDisplay();
}

function renderBoard() {
    const board = document.getElementById("chessboard");
    board.innerHTML = "";

    const boardState = chess.getBoardState().split("\n");

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            let square = document.createElement("div");
            square.classList.add("square", (i + j) % 2 === 0 ? "light" : "dark");
            square.dataset.row = i;
            square.dataset.col = j;

            const pieceChar = boardState[i][j];

            if (pieceChar !== '.') {
                const pieceImage = document.createElement("img");
                pieceImage.src = `images/${getPieceImage(pieceChar)}`;
                pieceImage.alt = pieceChar;
                square.appendChild(pieceImage);
            }

            square.addEventListener("click", () => handleSquareClick(i, j));
            board.appendChild(square);
        }
    }
}

function getPieceImage(pieceChar) {
    const pieceImages = {
        'P': 'pawn_white.png', 'p': 'pawn_black.png',
        'N': 'knight_white.png', 'n': 'knight_black.png',
        'B': 'bishop_white.png', 'b': 'bishop_black.png',
        'R': 'rook_white.png', 'r': 'rook_black.png',
        'Q': 'queen_white.png', 'q': 'queen_black.png',
        'K': 'king_white.png', 'k': 'king_black.png',
    };
    return pieceImages[pieceChar] || '';
}

function handleSquareClick(row, col) { // and turn handle btw
    clearHighlights();
    if (selectedSquare) {
        let fromRow = parseInt(selectedSquare.dataset.row);
        let fromCol = parseInt(selectedSquare.dataset.col); 
        let toRow = parseInt(row);
        let toCol = parseInt(col);

        const boardState = chess.getBoardState().split("\n");
        const selectedPiece = boardState[fromRow][fromCol];

        if ((currentTurn === "WHITE" && selectedPiece === selectedPiece.toLowerCase()) ||
            (currentTurn === "BLACK" && selectedPiece === selectedPiece.toUpperCase())) {
            selectedSquare.classList.remove("selected");
            selectedSquare = null;
            return; 
        }

        if (chess.movePiece(fromRow, fromCol, toRow, toCol)) {
            renderBoard();
            switchTurn();
        }

        selectedSquare.classList.remove("selected");
        selectedSquare = null;
    } else {
        selectedSquare = document.querySelector(`[data-row='${row}'][data-col='${col}']`);
        selectedSquare.classList.add("selected");

        highlightValidMoves(row, col);
    }
}

function highlightValidMoves(row, col) {
    const validMoves = chess.getValidMoves(row, col).split(";");

    validMoves.forEach(move => {
        if (move) {
            let [r, c] = move.split(",").map(Number);
            let square = document.querySelector(`[data-row='${r}'][data-col='${c}']`);
            if (square) {
                square.classList.add("highlight");
            }
        }
    });
}

function checkGameStatus() {
    if (chess.checkGameOver()) {
        const winner = currentTurn === WHITE ? "Black" : "White";
        alert(`${winner} wins by Checkmate!`);
        resetBoard();
    }
}


function clearHighlights() {
    document.querySelectorAll(".highlight").forEach(square => {
        square.classList.remove("highlight");
    });
}

document.getElementById("resetButton").addEventListener("click", () => {
    chess.resetBoard();
    currentTurn = "WHITE";
    updateTurnDisplay();
    renderBoard();
});

window.onload = initChess;

