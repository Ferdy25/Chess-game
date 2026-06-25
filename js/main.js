/**
 * MAIN.JS
 * Application entry point
 * Initializes the chess game when page loads
 *
 * KEGUNAAN: Entry point untuk initialize game saat page load
 * TANPA FILE INI: Game tidak start saat page dimuat
 * KONEKSI: Memanggil initGame() dari game.js
 *
 * This file is loaded LAST, after all other modules:
 * 1. constants.js - Defines PIECES, PIECE_VALUES, PIECE_NAMES, INIT_BOARD
 * 2. pieces.js - Defines piece movement logic (getRawMoves, isSquareAttacked, etc.)
 * 3. moves.js - Defines legal move validation (getLegalMoves, simulateMove, etc.)
 * 4. board.js - Defines board rendering (renderBoard, handleClick)
 * 5. game.js - Defines game state (initGame, executeMove, etc.)
 * 6. timer.js - Defines timer logic (startTimer, formatTime, updateTimers)
 * 7. ui.js - Defines UI updates (updateStatus, updatePanels, etc.)
 * 8. modals.js - Defines modal dialogs (showTimerModal, promotePawn, etc.)
 * 9. handlers.js - Defines user input handlers (undoMove, flipBoard)
 * 10. main.js - Calls initGame() to start the application
 */

// Initialize game when document is ready
initGame();
