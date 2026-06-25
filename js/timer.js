/**
 * TIMER.JS
 * Handles game timer functionality
 * Manages countdown timers and detects timeouts
 *
 * KEGUNAAN: Manage countdown timer untuk each player
 * TANPA FILE INI: Tidak ada timer, permainan tanpa batas waktu
 * KONEKSI: Digunakan oleh game.js, ui.js; dipanggil oleh main.js
 */

/**
 * Start the game timer
 * Decrements whiteTime or blackTime every second based on whose turn it is
 * Detects timeout (time reached 0) and ends game
 *
 * KEGUNAAN: Countdown timer setiap 1 detik untuk current player
 * TANPA: Tidak ada timer functionality
 * KONEKSI: Called oleh game.js executeMove() pada first move
 *          Updates UI via updateTimers() dan updateStatus()
 *          Shows game over modal on timeout via showGameOverModal('timeout')
 *
 * Process each second:
 * 1. Decrement current player's time
 * 2. If time <= 0: set to 0 and trigger game over
 * 3. Update timer display
 * 4. If game ended: clear interval
 */
function startTimer() {
  // Clear any existing timer to prevent multiple timers
  clearInterval(timerInterval);

  // If no timer set, exit early
  if (!timerMinutes) return;

  // Set interval to decrement timer every 1000ms (1 second)
  timerInterval = setInterval(() => {
    // Don't update if game already over
    if (gameOver) {
      clearInterval(timerInterval);
      return;
    }

    if (turn === 'w') {
      // White's turn: decrement white's time
      whiteTime--;

      if (whiteTime <= 0) {
        // White timeout
        whiteTime = 0;
        gameOver = true;
        clearInterval(timerInterval);

        // Update UI
        updateStatus();
        updatePanels();
        updateTimers();

        // Show game over in 500ms for visual effect
        setTimeout(() => showGameOverModal('timeout'), 500);
      }
    } else {
      // Black's turn: decrement black's time
      blackTime--;

      if (blackTime <= 0) {
        // Black timeout
        blackTime = 0;
        gameOver = true;
        clearInterval(timerInterval);

        // Update UI
        updateStatus();
        updatePanels();
        updateTimers();

        // Show game over in 500ms for visual effect
        setTimeout(() => showGameOverModal('timeout'), 500);
      }
    }

    // Update timer display every tick
    updateTimers();
  }, 1000);  // 1000ms = 1 second
}

/**
 * Convert seconds to MM:SS format for display
 * Also handles infinite time display
 *
 * @param {number} seconds - Time in seconds (or null for infinite)
 * @returns {string} - Formatted time string "MM:SS" or "∞"
 *
 * KEGUNAAN: Format seconds menjadi readable time display format
 * TANPA: Timer display menampilkan raw seconds (tidak user-friendly)
 * KONEKSI: Called oleh updateTimers() untuk format time display
 *
 * Example:
 * - null (no timer) → "∞"
 * - 600 (10 min) → "10:00"
 * - 45 → "00:45"
 * - 5 → "00:05"
 */
function formatTime(seconds) {
  if (seconds === null) return '∞';  // Infinity symbol for no timer

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  // Pad with leading zeros: "00:05" not "0:5"
  return minutes.toString().padStart(2, '0') + ':' + secs.toString().padStart(2, '0');
}

/**
 * Update timer display on the UI
 * Shows formatted time for both players
 * Highlights timer in red if low (< 30 seconds)
 *
 * KEGUNAAN: Update UI timer displays dengan current time
 * TANPA: Timer display tidak update
 * KONEKSI: Called dari startTimer() every second, updateTimers() dari handlers
 *          Updates timer-display elements dan applies timer-low class
 */
function updateTimers() {
  const whiteDisplay = document.getElementById('timer-white');
  const blackDisplay = document.getElementById('timer-black');

  // Set formatted time for both players
  whiteDisplay.textContent = formatTime(whiteTime);
  blackDisplay.textContent = formatTime(blackTime);

  // Add red "timer-low" class if time < 30 seconds
  whiteDisplay.classList.toggle('timer-low', whiteTime !== null && whiteTime < TIMER_LOW_THRESHOLD);
  blackDisplay.classList.toggle('timer-low', blackTime !== null && blackTime < TIMER_LOW_THRESHOLD);
}
