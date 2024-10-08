window.onload = function() {
    const board = document.getElementById('chessboard');
    const pieces = {
        'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'p': '♟',
        'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔', 'P': '♙'
    };

    let initialBoardState = [
        ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
        ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
        ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
    ];

    let boardState = JSON.parse(JSON.stringify(initialBoardState));
    let whiteWins = 0;
    let blackWins = 0;
    let selectedPiece = null;
    let selectedSquare = null;
    let currentTurn = 'white'; // White starts

    function createBoard() {
        board.innerHTML = ''; // Clear the board
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.classList.add('square');
                square.dataset.row = row;
                square.dataset.col = col;
                if ((row + col) % 2 === 0) {
                    square.style.backgroundColor = '#769656';
                } else {
                    square.style.backgroundColor = '#eeeed2';
                }
                const piece = boardState[row][col];
                if (piece !== ' ') {
                    square.textContent = pieces[piece];
                }
                square.addEventListener('click', onSquareClick);
                board.appendChild(square);
            }
        }
    }
    function onSquareClick(event) {
        const square = event.target;
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
    
        clearHighlights();
    
        if (selectedPiece) {
            if (isValidMove(selectedPiece, selectedSquare, row, col)) {
                movePiece(selectedPiece, selectedSquare, row, col);
                selectedPiece = null;
                selectedSquare = null;
                currentTurn = currentTurn === 'white' ? 'black' : 'white'; // Switch turns
                const turnText = currentTurn === 'white' ? 'Fehér köre' : 'Fekete köre';
                document.getElementById('turnDisplay').textContent = `Jelenlegi kör: ${turnText}`;
            } else {
                alert("Érvénytelen lépés!");
                selectedPiece = null;
                selectedSquare = null;
            }
        } else if (square.textContent !== '') {
            const piece = boardState[row][col];
            if ((currentTurn === 'white' && piece === piece.toUpperCase()) || (currentTurn === 'black' && piece === piece.toLowerCase())) {
                selectedPiece = piece;
                selectedSquare = { row, col };
                highlightMoves(selectedPiece, selectedSquare);
            } else {
                alert(`Most ${currentTurn === 'white' ? 'fehér' : 'fekete'} köre van!`);
            }
        }
    }
    function isValidMove(piece, from, toRow, toCol) {
        const rowDiff = toRow - from.row;
        const colDiff = toCol - from.col;
        const targetPiece = boardState[toRow][toCol];
    
        // Check if the target square contains a piece of the same color
        if (targetPiece !== ' ' && ((piece === piece.toUpperCase() && targetPiece === targetPiece.toUpperCase()) || (piece === piece.toLowerCase() && targetPiece === targetPiece.toLowerCase()))) {
            return false;
        }
    
        // Function to check if there are obstacles in the path
        function isPathClear(from, toRow, toCol) {
            const rowStep = Math.sign(toRow - from.row);
            const colStep = Math.sign(toCol - from.col);
            let currentRow = from.row + rowStep;
            let currentCol = from.col + colStep;
    
            while (currentRow !== toRow || currentCol !== toCol) {
                if (boardState[currentRow][currentCol] !== ' ') {
                    return false;
                }
                currentRow += rowStep;
                currentCol += colStep;
            }
            return true;
        }
    
        switch (piece.toLowerCase()) {
            case 'p': // Pawn
                if (piece === 'P') { // White pawn
                    if (from.row === 6 && toRow === 4 && colDiff === 0 && targetPiece === ' ' && isPathClear(from, toRow, toCol)) return true; // Initial double move
                    if (rowDiff === -1 && colDiff === 0 && targetPiece === ' ') return true; // Single move
                    if (rowDiff === -1 && Math.abs(colDiff) === 1 && targetPiece !== ' ' && targetPiece === targetPiece.toLowerCase()) return true; // Capture
                } else { // Black pawn
                    if (from.row === 1 && toRow === 3 && colDiff === 0 && targetPiece === ' ' && isPathClear(from, toRow, toCol)) return true; // Initial double move
                    if (rowDiff === 1 && colDiff === 0 && targetPiece === ' ') return true; // Single move
                    if (rowDiff === 1 && Math.abs(colDiff) === 1 && targetPiece !== ' ' && targetPiece === targetPiece.toUpperCase()) return true; // Capture
                }
                break;
            case 'r': // Rook
                if ((rowDiff === 0 || colDiff === 0) && isPathClear(from, toRow, toCol)) return true;
                break;
            case 'n': // Knight
                if ((Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 1) || (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 2)) return true;
                break;
            case 'b': // Bishop
                if (Math.abs(rowDiff) === Math.abs(colDiff) && isPathClear(from, toRow, toCol)) return true;
                break;
            case 'q': // Queen
                if ((rowDiff === 0 || colDiff === 0 || Math.abs(rowDiff) === Math.abs(colDiff)) && isPathClear(from, toRow, toCol)) return true;
                break;
            case 'k': // King
                if (Math.abs(rowDiff) <= 1 && Math.abs(colDiff) <= 1) return true;
                break;
        }
        return false;
    }
    function movePiece(piece, from, toRow, toCol) {
        boardState[toRow][toCol] = piece;
        boardState[from.row][from.col] = ' ';
        createBoard();
        checkWinner();
    }
    function updateScoreboard() {
        document.getElementById('whiteWins').textContent = whiteWins;
        document.getElementById('blackWins').textContent = blackWins;
    }
    function checkWinner() {
        const whiteKing = boardState.flat().includes('K');
        const blackKing = boardState.flat().includes('k');
        if (!whiteKing) {
            blackWins++;
            updateScoreboard();
            alert("fekete nyert!");
            resetBoard();
        } else if (!blackKing) {
            whiteWins++;
            updateScoreboard();
            alert("Fehér nyert!");
            resetBoard();
        }
    }
    function resetBoard() {
        boardState = JSON.parse(JSON.stringify(initialBoardState));
        createBoard();
    }
    function resetScores() {
        console.log("Resetting scores...");
        blackWins = 0;
        whiteWins = 0;
        console.log("White Wins:", whiteWins, "Black Wins:", blackWins);
        updateScoreboard();
    }
    function delee() {
        resetScores();
        resetBoard();
    }
    function highlightMoves(piece, from) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (isValidMove(piece, from, row, col)) {
                    const square = document.querySelector(`.square[data-row='${row}'][data-col='${col}']`);
                    square.classList.add('highlight');
                }
            }
        }
    }
    function clearHighlights() {
        const highlightedSquares = document.querySelectorAll('.highlight');
        highlightedSquares.forEach(square => {
            square.classList.remove('highlight');
        });
    }

    createBoard();
    updateScoreboard();
};