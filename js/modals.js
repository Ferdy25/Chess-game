/**
 * MODALS.JS
 * Handles all modal dialog functionality
 * Timer selection, game over, and pawn promotion modals
 *
 * KEGUNAAN: Manage modal dialogs untuk game setup, game end, pawn promotion
 * TANPA FILE INI: Tidak bisa select timer, promote pawns, atau lihat game result
 * KONEKSI: Called oleh handlers, game.js; calls game.js executeMove()
 */

// Track selected timer duration
let selectedTimerMinutes = 10;

/**
 * Show timer selection modal
 * Allows player to choose time control for new game
 *
 * KEGUNAAN: Display modal untuk choose time control
 * TANPA: User tidak bisa select timer
 * KONEKSI: Called oleh New Game button onclick handler
 *
 * Time options:
 * - Bullet: 1 min (fast blitz)
 * - Blitz: 3, 5 min (fast games)
 * - Rapid: 10, 15 min (medium games)
 * - Classical: 30 min (long games)
 * - No Timer: infinite (casual games)
 */
function showTimerModal() {
  document.getElementById('timer-modal').classList.add('show');
  selectTime(selectedTimerMinutes);  // Highlight previously selected option
}

/**
 * Close timer selection modal
 *
 * KEGUNAAN: Hide timer modal tanpa start game
 * TANPA: User tidak bisa close modal
 */
function closeTimerModal() {
  document.getElementById('timer-modal').classList.remove('show');
}

/**
 * Select time control option in timer modal
 *
 * @param {number} minutes - Minutes for selected time control
 *
 * KEGUNAAN: Update selected timer option dan highlight UI
 * TANPA: User tidak bisa select timer option
 * KONEKSI: Called oleh timer-option buttons onclick
 *
 * Updates:
 * - Remembers selected option (selectedTimerMinutes)
 * - Highlights selected option with 'selected' class
 */
function selectTime(minutes) {
  selectedTimerMinutes = minutes;

  // Remove 'selected' class from all options
  document.querySelectorAll('.timer-option').forEach(option => {
    option.classList.toggle('selected', parseInt(option.dataset.time) === minutes);
  });
}

/**
 * Start new game with selected timer
 * Called when user clicks "Begin" button in timer modal
 *
 * KEGUNAAN: Initialize new game dengan selected timer
 * TANPA: Game tidak start dengan timer
 * KONEKSI: Called oleh Begin button onclick
 *          Calls closeTimerModal() dan initGame()
 */
function startNewGame() {
  timerMinutes = selectedTimerMinutes;
  closeTimerModal();
  initGame();
}

/**
 * Show pawn promotion modal
 * Allows player to choose piece to promote to (Q, R, B, N)
 *
 * @param {string} color - 'w' for white pawn, 'b' for black pawn
 *
 * KEGUNAAN: Display modal untuk choose promotion piece
 * TANPA: Tidak bisa promote pawns
 * KONEKSI: Called oleh board.js handleClick() saat pawn reach last rank
 *
 * Promotion choices:
 * - Queen (Q): strongest, most valuable
 * - Rook (R): good attacking power
 * - Bishop (B): good control of diagonals
 * - Knight (N): useful in endgames
 */
function showPromotionModal(color) {
  const modal = document.getElementById('promo-modal');
  const container = document.getElementById('promo-pieces');

  // Clear previous promotion pieces
  container.innerHTML = '';

  // Create promotion piece options
  const pieces = color === 'w' ? ['Q', 'R', 'B', 'N'] : ['q', 'r', 'b', 'n'];

  for (const piece of pieces) {
    const pieceEl = document.createElement('div');
    pieceEl.className = 'promo-piece ' + (color === 'w' ? 'white-promo' : 'black-promo');
    pieceEl.textContent = PIECES[piece];

    // When clicked, promote pawn to this piece
    pieceEl.addEventListener('click', () => promotePawn(piece));

    container.appendChild(pieceEl);
  }

  // Show modal
  modal.classList.add('show');
}

/**
 * Promote pawn to selected piece
 * Updates board and move history with promotion notation
 *
 * @param {string} promoteTo - Piece to promote to (Q, R, B, N)
 *
 * KEGUNAAN: Complete pawn promotion dan update game state
 * TANPA: Pawns tidak bisa promote (stuck at last rank)
 * KONEKSI: Called oleh promotion piece buttons
 *          Uses pending promotion data from board.js handleClick()
 *
 * Process:
 * 1. Execute the move (which already moved piece to last rank)
 * 2. Replace pawn with promoted piece on destination square
 * 3. Add promotion notation to move history (e.g., "e8=Q")
 * 4. Close modal and re-render
 */
function promotePawn(promoteTo) {
  if (!pendingPromotion) return;

  const { from, to, move } = pendingPromotion;
  const color = colorOf(board[from[0]][from[1]]);

  // Convert promotion piece to correct case (uppercase for white, lowercase for black)
  const promotedPiece = color === 'w' ? promoteTo.toUpperCase() : promoteTo.toLowerCase();

  // Execute the move (this updates board, history, game state)
  executeMove(from[0], from[1], to[0], to[1], move);

  // Replace pawn with promoted piece on destination
  board[to[0]][to[1]] = promotedPiece;

  // Add promotion notation to last move in history
  // e.g., "e8=Q" means moved to e8 and promoted to Queen
  if (moveHistory.length > 0) {
    moveHistory[moveHistory.length - 1].notation += '=' + promoteTo.toUpperCase();
  }

  // Clear promotion modal
  pendingPromotion = null;
  document.getElementById('promo-modal').classList.remove('show');

  // Re-render and update UI
  renderBoard();
  updateStatus();
  updateMoveHistory();
}

/**
 * Show game over modal with result and reason
 *
 * @param {string} reason - Reason for game end:
 *                          'checkmate', 'timeout', 'stalemate', 'insufficient'
 *
 * KEGUNAAN: Display game result modal dengan reason dan winner
 * TANPA: User tidak tahu game result
 * KONEKSI: Called oleh game.js executeMove() saat gameOver detected
 *          Also called by timer.js on timeout
 *
 * Updates modal with:
 * - Title (who won, or "Draw")
 * - Result description (how game ended)
 * - Icon (thematic emoji based on outcome)
 */
function showGameOverModal(reason) {
  const modal = document.getElementById('gameover-modal');
  const titleEl = document.getElementById('go-title');
  const resultEl = document.getElementById('go-result');
  const iconEl = document.getElementById('go-icon');

  let titleText = '';
  let resultText = '';

  // Determine title, result text, and icon based on reason
  if (reason === 'checkmate') {
    titleText = `${turn === 'w' ? 'Black' : 'White'} Wins!`;
    resultText = `${turn === 'w' ? 'Black' : 'White'} wins by checkmate`;
    iconEl.textContent = '♛';  // Queen icon
  } else if (reason === 'timeout') {
    titleText = `${whiteTime === 0 ? 'Black' : 'White'} Wins!`;
    resultText = `${whiteTime === 0 ? 'Black' : 'White'} wins on time`;
    iconEl.textContent = '⏱';  // Clock icon
  } else if (reason === 'stalemate') {
    titleText = 'Draw';
    resultText = 'Game drawn by stalemate';
    iconEl.textContent = '♞';  // Knight icon
  } else if (reason === 'insufficient') {
    titleText = 'Draw';
    resultText = 'Game drawn — insufficient material';
    iconEl.textContent = '♝';  // Bishop icon
  }

  // Update modal content
  titleEl.textContent = titleText;
  resultEl.textContent = resultText;

  // Show modal
  modal.classList.add('show');
}

/**
 * New game from game over modal
 * Closes game over modal and shows timer selection modal
 *
 * KEGUNAAN: Restart game setelah game over
 * TANPA: User tidak bisa restart game
 * KONEKSI: Called oleh "Play Again" button in game over modal
 *          Shows timer modal untuk select new game time control
 */
function goNewGame() {
  document.getElementById('gameover-modal').classList.remove('show');
  showTimerModal();
}
