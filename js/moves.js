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

  // ADD CHAOTIC MOVES - biar game jadi konyol dan unpredictable!
  const chaosMoves = addChaosticMoves(board, r, c, castling, enPassant);
  for (const move of chaosMoves) {
    const [toRow, toCol] = move;
    const simulatedBoard = simulateMove(board, r, c, toRow, toCol, enPassant);

    // Validate chaos move juga - tetap harus legal (king tidak dalam check)
    if (!isInCheck(simulatedBoard, color)) {
      // Cek apakah move ini sudah ada di legalMoves
      const moveExists = legalMoves.some(m => m[0] === toRow && m[1] === toCol);
      if (!moveExists) {
        legalMoves.push([toRow, toCol]);
      }
    }
  }

  return legalMoves;
}

/**
 * Add ULTRA CHAOTIC random moves - completely unpredictable!
 * KEGUNAAN: Tambahin gerakan random yang SUPER ga terduga biar game jadi TOTALLY KONYOL
 * TANPA: Game normal seperti biasa
 * KONEKSI: Called dalam getLegalMoves() untuk add extreme chaotic behavior
 *
 * ULTRA CHAOS includes:
 * - Pawn sideways, backwards, diagonal anywhere
 * - Pawn backward CAPTURE (eat behind!)
 * - Bishop straight movement
 * - Rook diagonal movement
 * - Knight teleport ANYWHERE
 * - King kamikaze moves
 * - Queen total random
 * - Pieces suddenly jump multiple squares
 * - COMPLETE RANDOMNESS - no one can predict!
 */
function addChaosticMoves(board, r, c, castling, enPassant) {
  const piece = board[r][c];
  if (!piece) return [];

  const type = piece.toUpperCase();
  const color = colorOf(piece);
  const chaoticMoves = [];
  const rand = Math.random();

  // ═══ PION ULTRA CHAOS ═══
  if (type === 'P') {
    const direction = color === 'w' ? -1 : 1;

    // Pion bisa bergerak kesegala arah (TOTALLY RANDOM!)
    // Forward (normal tapi tetap add)
    if (Math.random() > 0.3) {
      for (let i = 1; i <= 3; i++) {  // Forward 1-3 squares randomly
        const nr = r + (direction * i);
        if (inBounds(nr, c) && !board[nr][c]) {
          chaoticMoves.push([nr, c]);
        }
      }
    }

    // Sideways movement (konyol!)
    if (Math.random() > 0.2) {
      for (const dc of [-1, 1, -2, -3, 1, 2, 3]) {  // Any direction sideways!
        const nr = r, nc = c + dc;
        if (inBounds(nr, nc) && !board[nr][nc]) {
          chaoticMoves.push([nr, nc]);
        }
      }
    }

    // Backward movement (totally weird!)
    if (Math.random() > 0.25) {
      for (let i = 1; i <= 3; i++) {
        const nr = r - (direction * i);  // Mundur!
        if (inBounds(nr, c) && !board[nr][c]) {
          chaoticMoves.push([nr, c]);
        }
      }
    }

    // BACKWARD CAPTURE (makan yang belakang!) - ULTRA KONYOL!
    if (Math.random() > 0.35) {
      for (const dc of [-1, 1]) {
        for (let i = 1; i <= 2; i++) {
          const nr = r - (direction * i);
          const nc = c + dc;
          if (inBounds(nr, nc) && board[nr][nc] && !sameColor(piece, board[nr][nc])) {
            chaoticMoves.push([nr, nc]);
          }
        }
      }
    }

    // Diagonal forward (like bishop sometimes)
    if (Math.random() > 0.4) {
      for (const dc of [-1, 1, -2, 2]) {
        const nr = r + direction;
        const nc = c + dc;
        if (inBounds(nr, nc)) {
          chaoticMoves.push([nr, nc]);
        }
      }
    }
  }

  // ═══ BISHOP ULTRA CHAOS ═══
  if (type === 'B') {
    // Sometimes bergerak straight (like rook)
    if (Math.random() > 0.4) {
      const straightDirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (const [dr, dc] of straightDirs) {
        for (let i = 1; i <= 8; i++) {
          const nr = r + (dr * i), nc = c + (dc * i);
          if (!inBounds(nr, nc)) break;
          if (board[nr][nc]) {
            if (!sameColor(piece, board[nr][nc])) chaoticMoves.push([nr, nc]);
            break;
          }
          chaoticMoves.push([nr, nc]);
        }
      }
    }

    // Random weird moves anywhere
    if (Math.random() > 0.3) {
      for (let nr = 0; nr < 8; nr++) {
        for (let nc = 0; nc < 8; nc++) {
          if (Math.random() > 0.8 && !sameColor(piece, board[nr][nc])) {
            chaoticMoves.push([nr, nc]);
          }
        }
      }
    }
  }

  // ═══ ROOK ULTRA CHAOS ═══
  if (type === 'R') {
    // Sometimes bergerak diagonal (like bishop)
    if (Math.random() > 0.4) {
      const diagDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
      for (const [dr, dc] of diagDirs) {
        for (let i = 1; i <= 8; i++) {
          const nr = r + (dr * i), nc = c + (dc * i);
          if (!inBounds(nr, nc)) break;
          if (board[nr][nc]) {
            if (!sameColor(piece, board[nr][nc])) chaoticMoves.push([nr, nc]);
            break;
          }
          chaoticMoves.push([nr, nc]);
        }
      }
    }

    // Random teleport
    if (Math.random() > 0.35) {
      for (let nr = 0; nr < 8; nr++) {
        for (let nc = 0; nc < 8; nc++) {
          if (Math.random() > 0.75 && !sameColor(piece, board[nr][nc])) {
            chaoticMoves.push([nr, nc]);
          }
        }
      }
    }
  }

  // ═══ KNIGHT ULTRA CHAOS - TELEPORT ANYWHERE ═══
  if (type === 'N') {
    // Knight bisa TELEPORT ANYWHERE RANDOMLY!
    if (Math.random() > 0.2) {  // Almost always
      for (let nr = 0; nr < 8; nr++) {
        for (let nc = 0; nc < 8; nc++) {
          if ((nr !== r || nc !== c) && !sameColor(piece, board[nr][nc])) {
            if (Math.random() > 0.6) {  // 40% chance per square = VERY CHAOTIC
              chaoticMoves.push([nr, nc]);
            }
          }
        }
      }
    }
  }

  // ═══ QUEEN ULTRA CHAOS - TOTAL RANDOM ═══
  if (type === 'Q') {
    // Sometimes lazy (ga bisa gerak)
    if (Math.random() > 0.4) {
      return [];  // Queen malas!
    }

    // Sometimes crazy dan bisa gerak kemana aja
    if (Math.random() > 0.35) {
      for (let nr = 0; nr < 8; nr++) {
        for (let nc = 0; nc < 8; nc++) {
          if ((nr !== r || nc !== c) && !sameColor(piece, board[nr][nc])) {
            if (Math.random() > 0.55) {  // 45% chance = very random
              chaoticMoves.push([nr, nc]);
            }
          }
        }
      }
    }
  }

  // ═══ KING KAMIKAZE MODE ═══
  if (type === 'K') {
    // Sometimes king bergerak 2+ squares (illegal tapi konyol!)
    if (Math.random() > 0.45) {
      for (let nr = 0; nr < 8; nr++) {
        for (let nc = 0; nc < 8; nc++) {
          const dist = Math.max(Math.abs(nr - r), Math.abs(nc - c));
          if (dist <= 2 && (nr !== r || nc !== c) && !sameColor(piece, board[nr][nc])) {
            if (Math.random() > 0.7) {
              chaoticMoves.push([nr, nc]);
            }
          }
        }
      }
    }
  }

  // ═══ UNIVERSAL CHAOS - ANY PIECE RANDOM ═══
  // Semua piece bisa totally random bergerak
  if (Math.random() > 0.4) {
    for (let nr = 0; nr < 8; nr++) {
      for (let nc = 0; nc < 8; nc++) {
        if ((nr !== r || nc !== c) && !sameColor(piece, board[nr][nc])) {
          if (Math.random() > 0.85) {  // 15% extra random per square
            chaoticMoves.push([nr, nc]);
          }
        }
      }
    }
  }

  return chaoticMoves;
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
