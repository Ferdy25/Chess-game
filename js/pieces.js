/**
 * PIECES.JS
 * Handles piece movement logic and attack detection
 * Implements raw move generation (without legal move validation)
 *
 * KEGUNAAN: Menghitung gerakan piece dan deteksi serangan
 * TANPA FILE INI: Aplikasi tidak bisa determine kemana piece bisa bergerak
 * KONEKSI: Digunakan oleh moves.js untuk filter legal moves
 */

/**
 * Determines if a piece belongs to white (uppercase) or black (lowercase)
 * @param {string} piece - Chess piece character (e.g., 'K', 'p')
 * @returns {string|null} - 'w' for white, 'b' for black, null if no piece
 *
 * KEGUNAAN: Identify warna piece untuk validasi move (can't capture own piece)
 * TANPA: Tidak bisa determine friendly vs enemy pieces
 * KONEKSI: Digunakan di getRawMoves, isSquareAttacked, untuk color checking
 */
const colorOf = p => p ? (p === p.toUpperCase() ? 'w' : 'b') : null;

/**
 * Check if a position is within the board boundaries
 * @param {number} r - Row (0-7)
 * @param {number} c - Column (0-7)
 * @returns {boolean} - True if position is valid
 *
 * KEGUNAAN: Prevent moves yang keluar dari board (out of bounds)
 * TANPA: Piece bisa bergerak ke koordinat invalid
 */
const inBounds = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;

/**
 * Check if two pieces are the same color (used to detect friendly capture)
 * @param {string} a - First piece
 * @param {string} b - Second piece
 * @returns {boolean} - True if both pieces exist and are same color
 *
 * KEGUNAAN: Detect apakah piece bisa capture target (must be different color)
 * TANPA: Bisa capture piece sendiri (illegal)
 */
const sameColor = (a, b) => a && b && colorOf(a) === colorOf(b);

/**
 * Check if move is from white piece (used for determining direction)
 * @param {string} piece - Chess piece
 * @returns {boolean} - True if white piece
 *
 * KEGUNAAN: Identify color untuk piece movement direction
 */
const isWhite = p => p && p === p.toUpperCase();

/**
 * Deep copy a board state to prevent mutation
 * @param {Array<Array>} board - The board to copy
 * @returns {Array<Array>} - A new deep copy of the board
 *
 * KEGUNAAN: Create independent board copy untuk simulateMove
 * TANPA: Original board bisa ter-mutate saat test move
 */
const deepCopy = b => b.map(r => [...r]);

/**
 * Find the king position on the board
 * @param {Array<Array>} board - Chess board
 * @param {string} color - 'w' for white, 'b' for black
 * @returns {Array|null} - [row, col] of king or null if not found
 *
 * KEGUNAAN: Locate king untuk check/checkmate detection
 * TANPA: Tidak bisa detect kalau king dalam check
 * KONEKSI: Digunakan oleh isInCheck() dan isSquareAttacked()
 */
function findKing(board, color) {
  const kingSymbol = color === 'w' ? 'K' : 'k';
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === kingSymbol) {
        return [r, c];
      }
    }
  }
  return null;
}

/**
 * Generate ALL possible moves for a piece (including illegal moves that leave king in check)
 * This is used as the base for legal move filtering
 *
 * @param {Array<Array>} board - Chess board state
 * @param {number} r - Starting row
 * @param {number} c - Starting column
 * @param {Object} castling - Castling rights {K, Q, k, q} for kingside/queenside
 * @param {Array} enPassant - En passant target square [row, col] or null
 * @returns {Array<Array>} - Array of possible moves, each [toRow, toCol] or [toRow, toCol, 'castle']
 *
 * KEGUNAAN: Generate raw moves sebelum di-filter untuk legal moves
 * TANPA: Tidak bisa calculate gerakan piece
 * KONEKSI: getRawMoves output di-filter oleh getLegalMoves() untuk remove illegal moves
 */
function getRawMoves(board, r, c, castling, enPassant) {
  const piece = board[r][c];
  if (!piece) return [];

  const moves = [];
  const color = colorOf(piece);
  const type = piece.toUpperCase();

  // ──── PAWN MOVES ────
  // Pawns move forward (different direction for white vs black)
  // Can move 1 or 2 squares from starting position, can capture diagonally, en passant
  if (type === 'P') {
    const direction = color === 'w' ? -1 : 1;  // White moves up (-row), Black down (+row)
    const startingRow = color === 'w' ? 6 : 1;

    // Forward move (non-capture)
    if (inBounds(r + direction, c) && !board[r + direction][c]) {
      moves.push([r + direction, c]);

      // Two-square opening move
      if (r === startingRow && !board[r + 2 * direction][c]) {
        moves.push([r + 2 * direction, c]);
      }
    }

    // Diagonal captures
    for (const dc of [-1, 1]) {
      const nr = r + direction;
      const nc = c + dc;
      if (!inBounds(nr, nc)) continue;

      // Normal capture
      if (board[nr][nc] && colorOf(board[nr][nc]) !== color) {
        moves.push([nr, nc]);
      }

      // En passant capture
      if (enPassant && enPassant[0] === nr && enPassant[1] === nc) {
        moves.push([nr, nc]);
      }
    }
  }
  // ──── KNIGHT MOVES ────
  // Knight moves in L-shape: 2 squares in one direction, 1 in perpendicular
  // Can jump over pieces
  else if (type === 'N') {
    const knightMoves = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    for (const [dr, dc] of knightMoves) {
      const nr = r + dr;
      const nc = c + dc;
      if (inBounds(nr, nc) && !sameColor(piece, board[nr][nc])) {
        moves.push([nr, nc]);
      }
    }
  }
  // ──── BISHOP/ROOK/QUEEN MOVES ────
  // Bishop: moves diagonally
  // Rook: moves horizontally/vertically
  // Queen: combines both
  else if (type === 'B' || type === 'R' || type === 'Q') {
    const directions =
      type === 'B' ? [[-1, -1], [-1, 1], [1, -1], [1, 1]] :
      type === 'R' ? [[-1, 0], [1, 0], [0, -1], [0, 1]] :
      [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]];

    for (const [dr, dc] of directions) {
      let nr = r + dr;
      let nc = c + dc;
      while (inBounds(nr, nc)) {
        if (board[nr][nc]) {
          // Stop if we hit a piece (but can capture enemy)
          if (!sameColor(piece, board[nr][nc])) {
            moves.push([nr, nc]);
          }
          break;
        }
        moves.push([nr, nc]);
        nr += dr;
        nc += dc;
      }
    }
  }
  // ──── KING MOVES ────
  // King moves 1 square in any direction, plus castling
  else if (type === 'K') {
    // Normal king moves
    const kingMoves = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];
    for (const [dr, dc] of kingMoves) {
      const nr = r + dr;
      const nc = c + dc;
      if (inBounds(nr, nc) && !sameColor(piece, board[nr][nc])) {
        moves.push([nr, nc]);
      }
    }

    // ──── CASTLING ────
    // Castling: King moves 2 squares, Rook moves to adjacent square
    // Requirements: King/Rook haven't moved, no pieces between, king not in check
    if (castling) {
      const row = color === 'w' ? 7 : 0;
      if (r === row && c === 4) {
        // Kingside castling (O-O): King to g-file, Rook from h-file
        const ksKey = color === 'w' ? 'K' : 'k';
        if (castling[ksKey] && !board[row][5] && !board[row][6] &&
            board[row][7] === (color === 'w' ? 'R' : 'r')) {
          // Check: path is not attacked (validation done in getLegalMoves)
          if (!isSquareAttacked(board, row, 4, color) &&
              !isSquareAttacked(board, row, 5, color) &&
              !isSquareAttacked(board, row, 6, color)) {
            moves.push([row, 6, 'castle']);
          }
        }

        // Queenside castling (O-O-O): King to c-file, Rook from a-file
        const qsKey = color === 'w' ? 'Q' : 'q';
        if (castling[qsKey] && !board[row][3] && !board[row][2] && !board[row][1] &&
            board[row][0] === (color === 'w' ? 'R' : 'r')) {
          if (!isSquareAttacked(board, row, 4, color) &&
              !isSquareAttacked(board, row, 3, color) &&
              !isSquareAttacked(board, row, 2, color)) {
            moves.push([row, 2, 'castle']);
          }
        }
      }
    }
  }

  return moves;
}

/**
 * Check if a specific square is attacked by enemy pieces
 * Used to detect check and validate castling
 *
 * @param {Array<Array>} board - Chess board
 * @param {number} r - Row of target square
 * @param {number} c - Column of target square
 * @param {string} byColor - Color trying to move ('w' or 'b')
 * @returns {boolean} - True if square is attacked by opponent
 *
 * KEGUNAAN: Detect apakah square dalam serangan (untuk check detection & castling validation)
 * TANPA: Tidak bisa detect check atau validate castling legally
 * KONEKSI: Digunakan oleh isInCheck(), getLegalMoves() untuk validasi move legality
 */
function isSquareAttacked(board, r, c, byColor) {
  const enemy = byColor === 'w' ? 'b' : 'w';

  // Check all opponent pieces to see if any can attack this square
  for (let rr = 0; rr < 8; rr++) {
    for (let cc = 0; cc < 8; cc++) {
      const attackingPiece = board[rr][cc];
      if (!attackingPiece || colorOf(attackingPiece) !== enemy) continue;

      const type = attackingPiece.toUpperCase();
      const dr = r - rr;
      const dc = c - cc;
      const absdr = Math.abs(dr);
      const absdc = Math.abs(dc);

      // Pawn attacks: diagonal forward (depends on color)
      if (type === 'P') {
        if (dr === (enemy === 'w' ? -1 : 1) && absdc === 1) return true;
      }
      // Knight attacks: L-shape
      else if (type === 'N') {
        if ((absdr === 2 && absdc === 1) || (absdr === 1 && absdc === 2)) return true;
      }
      // King attacks: 1 square in any direction
      else if (type === 'K') {
        if (absdr <= 1 && absdc <= 1) return true;
      }
      // Bishop/Queen diagonal attacks
      else if (type === 'B' || type === 'Q') {
        if (absdr === absdc && absdr > 0) {
          const stepRow = dr > 0 ? 1 : -1;
          const stepCol = dc > 0 ? 1 : -1;
          let testRow = rr + stepRow;
          let testCol = cc + stepCol;
          let blocked = false;

          while (testRow !== r || testCol !== c) {
            if (board[testRow][testCol]) {
              blocked = true;
              break;
            }
            testRow += stepRow;
            testCol += stepCol;
          }
          if (!blocked) return true;
        }
      }
      // Rook/Queen straight attacks
      if (type === 'R' || type === 'Q') {
        if ((dr === 0 || dc === 0) && (absdr + absdc > 0)) {
          const stepRow = dr === 0 ? 0 : (dr > 0 ? 1 : -1);
          const stepCol = dc === 0 ? 0 : (dc > 0 ? 1 : -1);
          let testRow = rr + stepRow;
          let testCol = cc + stepCol;
          let blocked = false;

          while (testRow !== r || testCol !== c) {
            if (board[testRow][testCol]) {
              blocked = true;
              break;
            }
            testRow += stepRow;
            testCol += stepCol;
          }
          if (!blocked) return true;
        }
      }
    }
  }

  return false;
}

/**
 * Check if a specific color's king is in check
 * @param {Array<Array>} board - Chess board
 * @param {string} color - 'w' for white, 'b' for black
 * @returns {boolean} - True if king is under attack
 *
 * KEGUNAAN: Detect apakah king dalam check (untuk UI status dan move validation)
 * TANPA: Tidak bisa determine status check atau apply check restrictions
 */
const isInCheck = (board, color) => {
  const kingPos = findKing(board, color);
  return kingPos ? isSquareAttacked(board, kingPos[0], kingPos[1], color) : false;
};
