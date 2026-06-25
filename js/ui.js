/**
 * UI.JS
 * Handles all UI element updates
 * Updates status bar, player panels, captured pieces, and move history
 *
 * KEGUNAAN: Update semua UI elements sesuai game state
 * TANPA FILE INI: UI tidak update, user tidak lihat game status
 * KONEKSI: Called oleh game.js setelah executeMove(), handlers
 */

/**
 * Update game status message and styling
 * Shows whose turn it is, check status, checkmate, stalemate, draws, timeout
 *
 * KEGUNAAN: Display game status (whose turn, check, game over reason)
 * TANPA: User tidak tahu game state atau status
 * KONEKSI: Called oleh game.js executeMove(), timer.js timeout handler
 *
 * Updates:
 * - Status message (White/Black to move, check, checkmate, draw, timeout)
 * - Status bar styling (white-turn, black-turn, check-status, mate-status)
 * - Status indicator dot (color and glow based on game state)
 */
function updateStatus() {
  const statusEl = document.getElementById('status');
  const messageEl = document.getElementById('status-msg');

  // Reset classes for fresh styling
  statusEl.className = 'status-text';

  // ──── GAME OVER STATUS ────
  if (gameOver) {
    // Determine why game ended and show appropriate message
    const inCheck = isInCheck(board, turn);

    if (whiteTime === 0) {
      messageEl.textContent = 'Black wins on time';
    } else if (blackTime === 0) {
      messageEl.textContent = 'White wins on time';
    } else if (inCheck) {
      // Current player in check with no moves = checkmate
      messageEl.textContent = `Checkmate — ${turn === 'w' ? 'Black' : 'White'} wins`;
    } else if (isInsufficientMaterial()) {
      messageEl.textContent = 'Draw — Insufficient material';
    } else {
      // No check + no legal moves = stalemate
      messageEl.textContent = 'Stalemate — Draw';
    }

    statusEl.classList.add('mate-status');  // Gold styling for game end
    return;
  }

  // ──── ACTIVE GAME STATUS ----
  // Show whose turn it is
  statusEl.classList.add(turn === 'w' ? 'white-turn' : 'black-turn');

  // Check status
  const inCheck = isInCheck(board, turn);
  if (inCheck) {
    messageEl.textContent = (turn === 'w' ? 'White' : 'Black') + ' is in check';
    statusEl.classList.add('check-status');  // Red styling for check
  } else {
    messageEl.textContent = (turn === 'w' ? 'White' : 'Black') + ' to move';
  }
}

/**
 * Update player panel highlighting
 * Shows which player's turn it is and displays "Thinking..." status
 *
 * KEGUNAAN: Highlight active player panel dan show thinking status
 * TANPA: User tidak tahu whose turn is it
 * KONEKSI: Called oleh game.js executeMove(), renderBoard()
 *
 * Updates:
 * - 'active' class on panel (border, glow, elevation)
 * - Player status text ("Thinking..." during opponent's turn)
 */
function updatePanels() {
  const whitePanelEl = document.getElementById('panel-white');
  const blackPanelEl = document.getElementById('panel-black');

  // Add 'active' class to current player's panel (only if game not over)
  whitePanelEl.classList.toggle('active', turn === 'w' && !gameOver);
  blackPanelEl.classList.toggle('active', turn === 'b' && !gameOver);

  // Show "Thinking..." when it's opponent's turn
  document.getElementById('status-white').textContent = (turn === 'w' && !gameOver) ? 'Thinking…' : '';
  document.getElementById('status-black').textContent = (turn === 'b' && !gameOver) ? 'Thinking…' : '';
}

/**
 * Update captured pieces display for both players
 * Shows pieces captured and calculates material advantage
 *
 * KEGUNAAN: Display captured pieces dan material advantage (score difference)
 * TANPA: User tidak tahu pieces captured atau material advantage
 * KONEKSI: Called oleh game.js executeMove() saat ada capture
 *
 * Features:
 * - Display pieces in order (Q, R, B, N, P)
 * - Show material advantage (+3 for extra bishop, etc.)
 * - Different colors for white pieces captured by black and vice versa
 */
function updateCaptured() {
  const whiteCapturedEl = document.getElementById('captured-white');
  const blackCapturedEl = document.getElementById('captured-black');

  // Sort captured pieces in standard order: Q, R, B, N, P
  const sortOrder = ['q', 'r', 'b', 'n', 'p'];
  const sortCaptured = arr =>
    [...arr].sort((a, b) => sortOrder.indexOf(a.toLowerCase()) - sortOrder.indexOf(b.toLowerCase()));

  // Display white's captured pieces (black pieces)
  whiteCapturedEl.innerHTML = sortCaptured(capturedByWhite)
    .map(p => `<span class="cap-b">${PIECES[p]}</span>`)
    .join('');

  // Display black's captured pieces (white pieces)
  blackCapturedEl.innerHTML = sortCaptured(capturedByBlack)
    .map(p => `<span class="cap-w">${PIECES[p]}</span>`)
    .join('');

  // ──── MATERIAL ADVANTAGE ----
  // Calculate total material value for each side
  const whiteScore = capturedByWhite.reduce((sum, p) => sum + PIECE_VALUES[p], 0);
  const blackScore = capturedByBlack.reduce((sum, p) => sum + PIECE_VALUES[p], 0);
  const difference = whiteScore - blackScore;

  // Show advantage next to captured pieces (only if there's a difference)
  if (difference > 0) {
    whiteCapturedEl.innerHTML += `<span class="score-advantage">+${difference}</span>`;
  }
  if (difference < 0) {
    blackCapturedEl.innerHTML += `<span class="score-advantage">+${-difference}</span>`;
  }
}

/**
 * Update move history display
 * Shows all moves in algebraic notation in 2-column format (white, black)
 *
 * KEGUNAAN: Display game history dalam algebraic notation
 * TANPA: User tidak bisa lihat moves played
 * KONEKSI: Called oleh game.js executeMove() setelah setiap move
 *
 * Format:
 * 1. e4 e5
 * 2. Nf3 Nc6
 * 3. ...
 *
 * Captures highlighted in gold color
 */
function updateMoveHistory() {
  const historyEl = document.getElementById('history-list');

  // Show empty message if no moves yet
  if (moveHistory.length === 0) {
    historyEl.innerHTML = '<div class="history-empty">No moves yet</div>';
    return;
  }

  // Generate HTML for move pairs (white move, black move)
  let html = '';
  for (let i = 0; i < moveHistory.length; i += 2) {
    const moveNumber = Math.floor(i / 2) + 1;
    html += `<div class="move-row">`;
    html += `<span class="move-number">${moveNumber}.</span>`;

    // White move
    const whiteMove = moveHistory[i];
    html += `<span class="move-entry${whiteMove.isCapture ? ' capture-move' : ''}">`;
    html += whiteMove.notation;
    html += '</span>';

    // Black move (if exists)
    if (i + 1 < moveHistory.length) {
      const blackMove = moveHistory[i + 1];
      html += `<span class="move-entry${blackMove.isCapture ? ' capture-move' : ''}">`;
      html += blackMove.notation;
      html += '</span>';
    } else {
      html += '<span></span>';  // Empty column if black hasn't moved yet
    }

    html += '</div>';
  }

  historyEl.innerHTML = html;

  // Auto-scroll to bottom to show latest moves
  historyEl.scrollTop = historyEl.scrollHeight;
}

/**
 * Toggle move history panel open/closed
 *
 * KEGUNAAN: Show/hide move history panel
 * TANPA: User tidak bisa toggle history view
 * KONEKSI: Called oleh toggleHistory() onclick handler
 *
 * Toggles:
 * - .open class on history-list (expands/collapses)
 * - .open class on history-toggle (rotates chevron)
 */
function toggleHistory() {
  document.getElementById('history-list').classList.toggle('open');
  document.getElementById('history-toggle').classList.toggle('open');
}
