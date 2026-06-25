/**
 * HANDLERS.JS
 * Handles user interactions and game controls
 * Undo move, flip board, and related functionality
 *
 * KEGUNAAN: Handle user actions seperti undo dan flip board
 * TANPA FILE INI: User tidak bisa undo atau flip board
 * KONEKSI: Called oleh button onclick handlers; uses game.js state
 */

/**
 * Undo the last move
 * Restores previous game state including:
 * - Board position
 * - Whose turn it is
 * - Castling rights
 * - En passant target
 * - Captured pieces
 * - Timer state
 *
 * KEGUNAAN: Undo last move dan restore previous game state completely
 * TANPA: User tidak bisa undo moves
 * KONEKSI: Called oleh Undo button onclick
 *          Calls renderBoard(), updateStatus(), updatePanels(), etc. untuk re-render
 *
 * Process:
 * 1. Check if there are any moves to undo (stateHistory not empty)
 * 2. Pop last state from stateHistory
 * 3. Restore all game variables to previous state
 * 4. Remove last move from moveHistory
 * 5. Restart timer if it was running
 * 6. Re-render board and update all UI
 */
function undoMove() {
  // Can't undo if no moves have been made
  if (stateHistory.length === 0) return;

  // Get previous state
  const previousState = stateHistory.pop();

  // Restore all game state variables
  board = previousState.board;
  turn = previousState.turn;
  castling = previousState.castling;
  enPassant = previousState.enPassant;
  halfmove = previousState.halfmove;
  fullmove = previousState.fullmove;
  lastMove = previousState.lastMove;
  capturedByWhite = previousState.capturedByWhite;
  capturedByBlack = previousState.capturedByBlack;
  whiteTime = previousState.whiteTime;
  blackTime = previousState.blackTime;
  timerStarted = previousState.timerStarted;

  // Remove last move from history
  moveHistory.pop();

  // Reset selection
  selected = null;
  legalMoves = [];

  // Game is no longer over (we went back)
  gameOver = false;

  // Stop current timer
  clearInterval(timerInterval);

  // Restart timer if it was running before undo
  if (timerStarted && timerMinutes > 0) {
    startTimer();
  }

  // Re-render everything
  renderBoard();
  updateStatus();
  updatePanels();
  updateCaptured();
  updateMoveHistory();
  updateTimers();
}

/**
 * Flip the board (display from opposite perspective)
 * Useful for viewing game from black's perspective
 *
 * KEGUNAAN: Rotate board view 180 degrees untuk lihat dari black's perspective
 * TANPA: User tidak bisa flip board view
 * KONEKSI: Called oleh Flip button onclick
 *          Just toggles boardFlipped boolean dan calls renderBoard()
 *
 * When flipped:
 * - Row indices are reversed (row 0 becomes row 7, etc.)
 * - Column indices are reversed (col 0 becomes col 7, etc.)
 * - Black pieces appear at bottom (natural for black player)
 */
function flipBoard() {
  boardFlipped = !boardFlipped;
  renderBoard();
}
