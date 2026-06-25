/**
 * GAME.JS
 * Core game state management, move execution, and game initialization
 * Handles all game state variables and executes moves with full validation
 *
 * KEGUNAAN: Manage game state dan execute moves dengan full rule compliance
 * TANPA FILE INI: Tidak ada game state tracking atau move execution
 * KONEKSI: Uses pieces.js, moves.js; called by handlers.js, main.js, modals.js
 */

// ──── GAME STATE VARIABLES ────
// All variables defined globally to persist across function calls
let board;                    // 8x8 2D array representing board state
let turn;                     // 'w' or 'b' - whose turn is it
let selected;                 // [row, col] of selected piece, null if none
let legalMoves;               // Array of legal moves for selected piece
let moveHistory;              // Array of {notation, isCapture} objects
let stateHistory;             // Array of board states for undo

let castling;                 // {K, Q, k, q} - castling rights for each side
let enPassant;                // [row, col] of en passant target, null if none
let halfmove;                 // Counter for 50-move rule
let fullmove;                 // Full move counter (incremented after black moves)
let lastMove;                 // [fromRow, fromCol, toRow, toCol] of last move

let capturedByWhite;          // Array of pieces captured by white
let capturedByBlack;          // Array of pieces captured by black
let boardFlipped;             // boolean - is board displayed from black's perspective
let pendingPromotion;         // null or {from, to, move} when awaiting promotion choice

let gameOver;                 // boolean - is game finished
let whiteTime;                // Seconds remaining for white (null if no timer)
let blackTime;                // Seconds remaining for black (null if no timer)
let timerInterval;            // setInterval ID for timer
let timerMinutes;             // Selected timer duration in minutes (0 = no timer)
let timerStarted;             // boolean - has timer been started

/**
 * Initialize a new game with standard starting position
 * Resets all game state and renders the board
 *
 * KEGUNAAN: Start fresh game dengan initial position
 * TANPA: Tidak bisa start game
 * KONEKSI: Called oleh main.js on page load, modals.js untuk new game
 */
function initGame() {
  // Initialize board with standard starting position
  board = INIT_BOARD.map(r => [...r]);

  // Reset game state
  turn = 'w';
  selected = null;
  legalMoves = [];
  moveHistory = [];
  stateHistory = [];
  capturedByWhite = [];
  capturedByBlack = [];

  // Reset chess rules state
  castling = { K: true, Q: true, k: true, q: true };  // All sides can castle initially
  enPassant = null;
  halfmove = 0;
  fullmove = 1;
  lastMove = null;

  // Reset board display
  boardFlipped = false;
  pendingPromotion = null;

  // Reset game status
  gameOver = false;
  timerStarted = false;

  // Initialize timers
  if (timerMinutes > 0) {
    whiteTime = timerMinutes * 60;
    blackTime = timerMinutes * 60;
  } else {
    whiteTime = null;
    blackTime = null;
  }

  // Clear any running timer and update UI
  clearInterval(timerInterval);
  renderBoard();
  updateTimers();
  updateStatus();
  updatePanels();
  updateCaptured();

  // Clear move history display
  document.getElementById('history-list').innerHTML = '<div class="history-empty">No moves yet</div>';
  document.getElementById('undo-btn').disabled = false;
}

/**
 * Execute a move: update board state, handle captures, check for game end
 * This is the main game logic function
 *
 * @param {number} fr - From row
 * @param {number} fc - From column
 * @param {number} tr - To row
 * @param {number} tc - To column
 * @param {Array} move - The move object from legalMoves
 *
 * KEGUNAAN: Execute move dengan full validation dan update game state
 * TANPA: Tidak bisa execute moves
 * KONEKSI: Called oleh board.js handleClick(), modals.js promotePawn()
 *
 * Process:
 * 1. Save current state to stateHistory for undo
 * 2. Execute move: remove piece from source, place on destination
 * 3. Handle captures: add captured piece to capturedBy arrays
 * 4. Handle special moves: en passant (remove pawn), castling (move rook)
 * 5. Update castling rights (remove if rook/king moved from initial position)
 * 6. Set en passant target (pawn double-push)
 * 7. Update halfmove and fullmove counters
 * 8. Check for game end: checkmate, stalemate, insufficient material
 * 9. Add move to history with notation
 * 10. Update turn and all UI elements
 */
function executeMove(fromRow, fromCol, toRow, toCol, move) {
  // Save game state for undo functionality
  stateHistory.push({
    board: deepCopy(board),
    turn: turn,
    castling: { ...castling },
    enPassant: enPassant ? [...enPassant] : null,
    halfmove: halfmove,
    fullmove: fullmove,
    lastMove: lastMove ? [...lastMove] : null,
    capturedByWhite: [...capturedByWhite],
    capturedByBlack: [...capturedByBlack],
    whiteTime: whiteTime,
    blackTime: blackTime,
    timerStarted: timerStarted
  });

  const piece = board[fromRow][fromCol];
  const type = piece.toUpperCase();
  const color = colorOf(piece);
  const captured = board[toRow][toCol];
  const special = move ? move[2] : null;

  let isCapture = !!captured;
  let moveNotation = '';

  // ──── TIMER START ----
  // Start timer on first move if timer is enabled
  if (!timerStarted && timerMinutes > 0) {
    timerStarted = true;
    startTimer();
  }

  // ──── EN PASSANT CAPTURE ----
  // En passant: pawn captures opponent's pawn on different square
  if (type === 'P' && enPassant &&
      toRow === enPassant[0] && toCol === enPassant[1]) {
    const capturedPawn = board[fromRow][toCol];
    if (color === 'w') {
      capturedByWhite.push(capturedPawn);
    } else {
      capturedByBlack.push(capturedPawn);
    }
    board[fromRow][toCol] = null;  // Remove enemy pawn
    isCapture = true;
  }

  // ──── NORMAL CAPTURE ----
  if (captured) {
    if (color === 'w') {
      capturedByWhite.push(captured);
    } else {
      capturedByBlack.push(captured);
    }
  }

  // ──── MOVE PIECE ----
  board[toRow][toCol] = piece;
  board[fromRow][fromCol] = null;

  // ──── CASTLING ----
  // When king moves 2 squares, move rook as well
  if (special === 'castle') {
    // Determine rook positions based on king's destination
    const rookFromFile = toCol === 6 ? 7 : 0;  // 7 = h-file (kingside), 0 = a-file (queenside)
    const rookToFile = toCol === 6 ? 5 : 3;    // 5 = f-file (kingside), 3 = d-file (queenside)

    board[toRow][rookToFile] = board[toRow][rookFromFile];
    board[toRow][rookFromFile] = null;

    // Notation
    moveNotation = toCol === 6 ? 'O-O' : 'O-O-O';  // O-O = kingside, O-O-O = queenside
  }

  // ──── UPDATE CASTLING RIGHTS ----
  // Lose castling rights if king or rook moves
  if (type === 'K') {
    if (color === 'w') {
      castling.K = false;
      castling.Q = false;
    } else {
      castling.k = false;
      castling.q = false;
    }
  }

  // Lose castling if rook moves from initial position
  if (type === 'R') {
    if (fromRow === 7 && fromCol === 0) castling.Q = false;  // White queenside rook
    if (fromRow === 7 && fromCol === 7) castling.K = false;  // White kingside rook
    if (fromRow === 0 && fromCol === 0) castling.q = false;  // Black queenside rook
    if (fromRow === 0 && fromCol === 7) castling.k = false;  // Black kingside rook
  }

  // Lose castling if rook is captured from initial position
  if (toRow === 0 && toCol === 0) castling.q = false;  // Black queenside rook captured
  if (toRow === 0 && toCol === 7) castling.k = false;  // Black kingside rook captured
  if (toRow === 7 && toCol === 0) castling.Q = false;  // White queenside rook captured
  if (toRow === 7 && toCol === 7) castling.K = false;  // White kingside rook captured

  // ──── EN PASSANT TARGET ----
  // Set en passant target if pawn moved 2 squares forward
  enPassant = (type === 'P' && Math.abs(toRow - fromRow) === 2) ?
    [(fromRow + toRow) / 2, fromCol] :
    null;

  // ──── HALFMOVE CLOCK ----
  // Reset on pawn move or capture (for 50-move rule)
  if (type === 'P' || isCapture) {
    halfmove = 0;
  } else {
    halfmove++;
  }

  // ──── MOVE NOTATION ----
  // Generate algebraic notation for move history (unless castling)
  if (!moveNotation) {
    const fileChar = String.fromCharCode(97 + toCol);      // a-h
    const rankChar = String(8 - toRow);                    // 1-8
    const fromFile = String.fromCharCode(97 + fromCol);

    if (type === 'P') {
      // Pawn notation: just destination (with 'x' if capture)
      moveNotation = isCapture ? fromFile + 'x' + fileChar + rankChar : fileChar + rankChar;
    } else {
      // Piece notation: piece symbol + destination (with 'x' if capture)
      moveNotation = PIECE_NAMES[type] + (isCapture ? 'x' : '') + fileChar + rankChar;
    }
  }

  // Record last move for highlighting
  lastMove = [fromRow, fromCol, toRow, toCol];

  // ──── TURN SWITCH ----
  turn = turn === 'w' ? 'b' : 'w';
  if (turn === 'w') fullmove++;

  // Clear selected piece after move
  selected = null;
  legalMoves = [];

  // ──── GAME END DETECTION ----
  const inCheck = isInCheck(board, turn);
  const hasLegal = hasLegalMoves(board, turn, castling, enPassant);

  let endReason = null;

  // Checkmate: in check with no legal moves
  if (inCheck && !hasLegal) {
    moveNotation += '#';  // # = checkmate
    gameOver = true;
    endReason = 'checkmate';
    clearInterval(timerInterval);
  }
  // Check (not checkmate): in check but has legal moves
  else if (inCheck) {
    moveNotation += '+';  // + = check
  }
  // Stalemate: not in check but no legal moves
  else if (!hasLegal) {
    gameOver = true;
    endReason = 'stalemate';
    clearInterval(timerInterval);
  }

  // Insufficient material for checkmate (draw)
  if (!gameOver && isInsufficientMaterial()) {
    gameOver = true;
    endReason = 'insufficient';
    clearInterval(timerInterval);
  }

  // Add move to history
  moveHistory.push({ notation: moveNotation, isCapture: isCapture });

  // Update all UI elements
  renderBoard();
  updateStatus();
  updatePanels();
  updateCaptured();
  updateMoveHistory();

  // Show game over modal if game ended
  if (gameOver) {
    setTimeout(() => showGameOverModal(endReason), 500);
  }
}

/**
 * Check if board has insufficient material for checkmate
 * Conditions: only kings, or king + one minor piece
 * This is a draw condition in chess
 *
 * @returns {boolean} - True if insufficient material to checkmate
 *
 * KEGUNAAN: Detect draw condition oleh insufficient material
 * TANPA: Tidak bisa detect draw condition
 * KONEKSI: Called oleh executeMove() setelah move completion
 */
function isInsufficientMaterial() {
  const pieces = [];

  // Collect all pieces on board
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c]) {
        pieces.push(board[r][c]);
      }
    }
  }

  // Only kings left: insufficient
  if (pieces.length === 2) return true;

  // King + one minor piece (Bishop or Knight): insufficient
  if (pieces.length === 3) {
    const nonKing = pieces.find(p => p.toUpperCase() !== 'K');
    if (nonKing && (nonKing.toUpperCase() === 'B' || nonKing.toUpperCase() === 'N')) {
      return true;
    }
  }

  return false;
}
