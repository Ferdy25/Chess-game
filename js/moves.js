/**
 * MOVES.JS
 * Handles legal move validation and move simulation
 * Filters raw moves to ensure they don't leave the king in check
 * Handles special moves like en passant and castling
 *
 * KEGUNAAN: Validate moves legally sesuai chess rules
 * TANPA FILE INI: Game bisa ter-move dan leave king dalam check (illegal)
 * KONEKSI: Menggunakan pieces.js untuk raw moves, digunakan oleh game.js untuk move execution
 */

/**
 * Simulate a move on a board copy without modifying the original
 * Used to test if a move would leave the king in check
 *
 * @param {Array<Array>} board - Chess board
 * @param {number} fromRow - Starting row
 * @param {number} fromCol - Starting column
 * @param {number} toRow - Target row
 * @param {number} toCol - Target column
 * @param {Array} enPassant - En passant square [row, col] if applicable
 * @returns {Array<Array>} - New board state after move
 *
 * KEGUNAAN: Create simulated board state untuk check legality tanpa mutate original
 * TANPA: Tidak bisa test apakah move legal (would leave king in check)
 * KONEKSI: Digunakan oleh getLegalMoves() untuk test each raw move
 *
 * NOTE: Handles en passant capture (removing enemy pawn from starting file)
 *       but NOT castling (handled in getLegalMoves)
 */
function simulateMove(board, fromRow, fromCol, toRow, toCol, enPassant) {
  const newBoard = deepCopy(board);
  const piece = newBoard[fromRow][fromCol];

  // Move piece to target square
  newBoard[toRow][toCol] = piece;
  newBoard[fromRow][fromCol] = null;

  // En passant: remove enemy pawn from starting rank (not target rank)
  if (piece.toUpperCase() === 'P' && enPassant &&
      toRow === enPassant[0] && toCol === enPassant[1]) {
    newBoard[fromRow][toCol] = null;  // Remove pawn from where it came from (file)
  }

  return newBoard;
}

/**
 * Get all LEGAL moves for a piece (moves that don't leave king in check)
 * Includes special moves: castling, en passant, pawn promotion
 *
 * @param {Array<Array>} board - Chess board
 * @param {number} r - Piece row
 * @param {number} c - Piece column
 * @param {Object} castling - Castling rights {K, Q, k, q}
 * @param {Array} enPassant - En passant target [row, col] or null
 * @returns {Array<Array>} - Array of legal moves
 *
 * KEGUNAAN: Filter raw moves untuk hanya legal moves (king tidak dalam check setelahnya)
 * TANPA: Game akan allow illegal moves
 * KONEKSI: Input dari getRawMoves(), output untuk board.js dan handlers.js untuk rendering/execution
 *
 * Process:
 * 1. Get all raw possible moves via getRawMoves()
 * 2. For each move: simulate on temporary board
 * 3. Check if king is in check on simulated board
 * 4. Only keep moves where king is NOT in check
 * 5. Special handling for castling (king move, different board modification)
 */
function getLegalMoves(board, r, c, castling, enPassant) {
  const piece = board[r][c];
  if (!piece) return [];

  const color = colorOf(piece);
  const rawMoves = getRawMoves(board, r, c, castling, enPassant);
  const legalMoves = [];

  for (const move of rawMoves) {
    const [toRow, toCol, special] = move;
    let simulatedBoard;

    // Special handling for castling: king and rook both move
    if (special === 'castle') {
      simulatedBoard = deepCopy(board);
      // Move king
      simulatedBoard[toRow][toCol] = piece;
      simulatedBoard[r][c] = null;

      // Move rook: kingside castle rook moves from h-file to f-file
      //            queenside castle rook moves from a-file to d-file
      const rookFromFile = toCol === 6 ? 7 : 0;        // 7=h-file, 0=a-file
      const rookToFile = toCol === 6 ? 5 : 3;          // 5=f-file, 3=d-file
      simulatedBoard[toRow][rookToFile] = simulatedBoard[toRow][rookFromFile];
      simulatedBoard[toRow][rookFromFile] = null;
    } else {
      // Normal move or en passant
      simulatedBoard = simulateMove(board, r, c, toRow, toCol, enPassant);
    }

    // Move is legal only if king is NOT in check after the move
    if (!isInCheck(simulatedBoard, color)) {
      legalMoves.push(move);
    }
  }

  return legalMoves;
}

/**
 * Check if a color has any legal moves available
 * Used to detect checkmate and stalemate
 *
 * @param {Array<Array>} board - Chess board
 * @param {string} color - 'w' for white, 'b' for black
 * @param {Object} castling - Castling rights
 * @param {Array} enPassant - En passant target
 * @returns {boolean} - True if player has at least one legal move
 *
 * KEGUNAAN: Detect checkmate/stalemate oleh cek apakah ada legal move
 * TANPA: Tidak bisa determine end of game conditions
 * KONEKSI: Digunakan oleh game.js dalam executeMove() untuk detect game end
 *
 * Algorithm: For each piece of the given color, get legal moves
 *            If any piece has legal moves, return true (player has move)
 */
function hasLegalMoves(board, color, castling, enPassant) {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] && colorOf(board[r][c]) === color) {
        if (getLegalMoves(board, r, c, castling, enPassant).length > 0) {
          return true;
        }
      }
    }
  }
  return false;
}
