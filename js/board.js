/**
 * BOARD.JS
 * Handles board rendering and square interaction
 * Displays pieces, move indicators, coordinate labels, and highlights
 *
 * KEGUNAAN: Render chess board dengan piece, highlight, dan indicators
 * TANPA FILE INI: User tidak bisa lihat board dan tidak bisa interact
 * KONEKSI: Menggunakan constants.js, pieces.js; dipanggil oleh handlers.js dan game.js
 */

/**
 * Render the entire chessboard with all pieces, highlights, and indicators
 * Handles board flipping (from black's perspective)
 *
 * KEGUNAAN: Display board state visually dengan pieces dan UI indicators
 * TANPA: User tidak bisa lihat chessboard atau interact dengan pieces
 * KONEKSI: Called oleh game.js setelah executeMove(), undoMove(), initGame()
 *
 * Features rendered:
 * - All 64 squares with light/dark coloring
 * - All pieces with correct symbols
 * - Move indicators (dots for empty, rings for captures)
 * - Selected square highlight
 * - Last move highlight
 * - Check highlight (king in check)
 * - Coordinate labels (a-h files, 1-8 ranks)
 * - Board flip support (view from black's perspective)
 */
function renderBoard() {
  const boardEl = document.getElementById('board');
  boardEl.innerHTML = '';

  // Create all 64 squares
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      // Apply board flip: if flipped, reverse row and column indices
      const displayRow = boardFlipped ? 7 - r : r;
      const displayCol = boardFlipped ? 7 - c : c;

      const square = document.createElement('div');
      // Light squares at (row + col) % 2 === 0, dark otherwise
      square.className = 'square ' + ((displayRow + displayCol) % 2 === 0 ? 'light' : 'dark');
      square.dataset.row = displayRow;
      square.dataset.col = displayCol;

      // ──── SQUARE HIGHLIGHTS ────

      // Last move highlight: highlight both source and destination squares
      if (lastMove &&
          ((displayRow === lastMove[0] && displayCol === lastMove[1]) ||
           (displayRow === lastMove[2] && displayCol === lastMove[3]))) {
        square.classList.add('last-move');
      }

      // Selected square highlight: the piece user clicked on
      if (selected && selected[0] === displayRow && selected[1] === displayCol) {
        square.classList.add('selected');
      }

      // Check highlight: king square flashes when in check
      if (!gameOver) {
        const kingPos = findKing(board, turn);
        if (kingPos && isInCheck(board, turn) &&
            displayRow === kingPos[0] && displayCol === kingPos[1]) {
          square.classList.add('check');
        }
      }

      // ──── COORDINATE LABELS ────
      // File label (a-h) on bottom-right of bottom row
      const isBottomRow = (r === 7);
      if (isBottomRow) {
        const fileLabel = document.createElement('span');
        fileLabel.className = 'sq-coord file';
        fileLabel.textContent = String.fromCharCode(97 + displayCol);  // 97='a'
        square.appendChild(fileLabel);
      }

      // Rank label (8-1) on top-left of left column
      const isLeftCol = (c === 0);
      if (isLeftCol) {
        const rankLabel = document.createElement('span');
        rankLabel.className = 'sq-coord rank';
        rankLabel.textContent = 8 - displayRow;  // Row 0 = rank 8, row 7 = rank 1
        square.appendChild(rankLabel);
      }

      // ──── MOVE INDICATORS ────
      // Show where the selected piece can move
      const isLegalMove = legalMoves.some(m => m[0] === displayRow && m[1] === displayCol);
      if (isLegalMove) {
        if (board[displayRow][displayCol]) {
          // Capture move: show ring around enemy piece
          const ring = document.createElement('div');
          ring.className = 'capture-ring';
          square.appendChild(ring);
        } else {
          // Empty square move: show dot indicator
          const dot = document.createElement('div');
          dot.className = 'move-dot';
          square.appendChild(dot);
        }
      }

      // ──── PIECE RENDERING ----
      const piece = board[displayRow][displayCol];
      if (piece) {
        const pieceEl = document.createElement('span');
        pieceEl.className = 'piece ' + (isWhite(piece) ? 'white-piece' : 'black-piece');

        // Highlight selected piece
        if (selected && selected[0] === displayRow && selected[1] === displayCol) {
          pieceEl.classList.add('selected-piece');
        }

        // Animate piece that just moved
        if (lastMove && displayRow === lastMove[2] && displayCol === lastMove[3]) {
          pieceEl.classList.add('just-moved');
        }

        pieceEl.textContent = PIECES[piece];
        square.appendChild(pieceEl);
      }

      // ──── SQUARE CLICK HANDLER ----
      square.addEventListener('click', () => handleClick(displayRow, displayCol));
      boardEl.appendChild(square);
    }
  }
}

/**
 * Handle square click events: piece selection and move execution
 * Called when user clicks on a board square
 *
 * @param {number} r - Row of clicked square
 * @param {number} c - Column of clicked square
 *
 * KEGUNAAN: Process user input untuk select piece atau execute move
 * TANPA: User tidak bisa interact dengan board
 * KONEKSI: Calls executeMove() atau updates selected/legalMoves dan re-renders
 *
 * Logic:
 * 1. If legal move is selected: execute the move
 * 2. Else if clicked piece belongs to current player: select it and show legal moves
 * 3. Else: deselect current piece
 */
function handleClick(r, c) {
  // Don't allow moves during promotion or after game over
  if (gameOver || pendingPromotion) return;

  const clickedPiece = board[r][c];

  // ──── MOVE EXECUTION ----
  if (selected && legalMoves.some(m => m[0] === r && m[1] === c)) {
    const move = legalMoves.find(m => m[0] === r && m[1] === c);
    const selectedPiece = board[selected[0]][selected[1]];

    // Check for pawn promotion (pawn reaches last rank)
    if (selectedPiece.toUpperCase() === 'P' && (r === 0 || r === 7)) {
      // Store move info and show promotion modal instead of executing
      pendingPromotion = {
        from: selected,
        to: [r, c],
        move: move
      };
      showPromotionModal(colorOf(selectedPiece));
      return;
    }

    // Execute normal move
    executeMove(selected[0], selected[1], r, c, move);
    return;
  }

  // ──── PIECE SELECTION ----
  if (clickedPiece && colorOf(clickedPiece) === turn) {
    // User clicked their own piece: select it
    selected = [r, c];
    legalMoves = getLegalMoves(board, r, c, castling, enPassant);
  } else {
    // User clicked empty square or opponent's piece: deselect
    selected = null;
    legalMoves = [];
  }

  renderBoard();
}
