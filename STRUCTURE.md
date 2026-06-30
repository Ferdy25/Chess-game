# Chess Game - Project Structure

## 📁 Folder Organization

```
chess/
├── index.html              # Main HTML file (clean structure)
├── css/
│   └── style.css           # All CSS styles (well-commented)
├── js/
│   ├── constants.js        # Game constants and board initialization
│   ├── pieces.js           # Piece movement and attack detection
│   ├── moves.js            # Legal move validation
│   ├── board.js            # Board rendering and interaction
│   ├── game.js             # Game state and move execution
│   ├── timer.js            # Timer functionality
│   ├── ui.js               # UI updates (status, panels, history)
│   ├── modals.js           # Modal dialogs (timer, game over, promotion)
│   ├── handlers.js         # User input handlers (undo, flip)
│   └── main.js             # Application entry point
├── home.html               # OLD file (can be deleted)
├── STRUCTURE.md            # This file
└── .git/                   # Git repository
```

## 📄 File Descriptions

### HTML & CSS

**index.html**
- Clean HTML structure with semantic markup
- All inline styles and scripts removed
- Links to external CSS and JS files
- Well-commented HTML with section markers

**css/style.css**
- All styling in one organized file
- Well-commented sections (Reset, Variables, Components, Responsive)
- CSS variables for colors, animations, and spacing
- Mobile-responsive design (@media queries)

### JavaScript Modules

**js/constants.js**
- Game constants (PIECES, PIECE_VALUES, PIECE_NAMES)
- Initial board setup (INIT_BOARD)
- Default settings (DEFAULT_TIMER_MINUTES, BOARD_SIZE, etc.)
- Detailed comments about usage and purpose

**js/pieces.js**
- Piece movement logic (getRawMoves for all piece types)
- Attack detection (isSquareAttacked)
- King detection (findKing)
- Helper functions (colorOf, inBounds, sameColor, isWhite)
- Detailed comments about piece mechanics

**js/moves.js**
- Legal move validation (getLegalMoves)
- Move simulation (simulateMove)
- Check detection (isInCheck)
- Game ending detection (hasLegalMoves, insufficient material)
- Filters raw moves to remove illegal moves

**js/board.js**
- Board rendering (renderBoard)
- Square highlighting (selected, last move, check, legal moves)
- Piece rendering and display
- Click handler for piece selection and move execution
- Coordinate labels display

**js/game.js**
- Game state variables (board, turn, castling, etc.)
- Game initialization (initGame)
- Move execution (executeMove) - main game logic
- Special moves handling (castling, en passant, pawn promotion)
- Game end detection (checkmate, stalemate, timeout, insufficient material)

**js/timer.js**
- Timer countdown logic (startTimer)
- Time formatting (formatTime - MM:SS format)
- Timer display updates (updateTimers)
- Timeout detection and game over handling

**js/ui.js**
- Status bar updates (updateStatus - whose turn, check, game end)
- Player panel highlighting (updatePanels)
- Captured pieces display (updateCaptured - with material advantage)
- Move history display (updateMoveHistory - algebraic notation)
- History panel toggle (toggleHistory)

**js/modals.js**
- Timer selection modal (showTimerModal, selectTime, startNewGame)
- Game over modal (showGameOverModal - with result reason)
- Pawn promotion modal (showPromotionModal, promotePawn)
- Modal controls (closeTimerModal, goNewGame)

**js/handlers.js**
- Undo move functionality (undoMove - restores full game state)
- Board flip functionality (flipBoard - view from black's perspective)

**js/main.js**
- Application entry point
- Calls initGame() to start the application
- Executed after all other modules are loaded

## 🔄 Module Dependencies & Execution Flow

```
HTML (index.html)
    ↓
Load CSS (css/style.css)
    ↓
Load JavaScript modules in order:
    constants.js → pieces.js → moves.js → board.js → game.js → 
    timer.js → ui.js → modals.js → handlers.js → main.js
    ↓
main.js calls initGame()
    ↓
Game starts!
```

### Data Flow

1. **User clicks square** → board.js handleClick()
2. **handleClick checks if move is legal** → moves.js getLegalMoves()
3. **getLegalMoves validates moves** → pieces.js getRawMoves() + isInCheck()
4. **User confirms move** → game.js executeMove()
5. **executeMove updates state** → game.js stores in stateHistory
6. **Update all UI** → ui.js updateStatus(), updatePanels(), etc.
7. **Render changes** → board.js renderBoard()

## 💡 Key Features

### Comments Structure
Every function has detailed comments explaining:
- **KEGUNAAN**: What the function does
- **TANPA**: What happens if not used
- **KONEKSI**: How it connects with other code

### Code Organization
- **One responsibility per file** (Single Responsibility Principle)
- **Clear module boundaries** (no circular dependencies)
- **Reusable functions** (DRY principle)
- **Meaningful variable names** (self-documenting code)

### Features Implemented
- ♟ Full chess rules (piece movement, captures, special moves)
- ♖ Castling with proper validation
- ♗ En passant captures
- ♘ Pawn promotion with modal selection
- ⏱ Configurable timers (Bullet, Blitz, Rapid, Classical, No Timer)
- ⌛ Timeout detection
- ↶ Undo move with full state restoration
- ⇅ Board flip (view from black's perspective)
- 📊 Move history with algebraic notation
- 🎯 Captured pieces display with material advantage
- ⚠ Check and checkmate detection
- 🤐 Stalemate and draw conditions

## 🎨 Styling

### Design System
- **Color Variables**: Gold accents, dark background, light text
- **Animation Functions**: smooth, spring, ease-out for natural motion
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Accessibility**: High contrast, clear visual feedback

### CSS Sections
1. **Reset & Base** - Global styles reset
2. **Variables** - Color scheme and animations
3. **Global Styles** - Body and background
4. **App Container** - Main layout
5. **Header** - Title and branding
6. **Game Container** - Board and panels layout
7. **Player Panels** - Player info and timers
8. **Timer Display** - Time formatting
9. **Captured Pieces** - Material tracking
10. **Board & Squares** - Chessboard rendering
11. **Move Indicators** - Legal move visualization
12. **Pieces** - Piece styling and animations
13. **Status Bar** - Game state display
14. **Controls** - Buttons
15. **Move History** - Game history display
16. **Modals** - Dialog styling
17. **Animations** - Keyframe animations
18. **Responsive** - Mobile optimizations

## 🚀 How to Use

1. **Open index.html** in a web browser
2. **Click "New Game"** button to select time control
3. **Click pieces** to select them and see legal moves
4. **Click target square** to move
5. **Use controls**:
   - New Game: Start fresh game with timer selection
   - Undo: Take back last move
   - Flip: View from black's perspective
6. **View move history**: Click "Move History" to expand/collapse

## 🔧 Maintenance

### Adding New Features
1. Identify which module it belongs to
2. Add function with detailed comments
3. Update related modules if needed
4. Test interaction with existing features

### Debugging
- Check browser console for errors
- Verify module load order in HTML
- Ensure all dependencies are loaded before dependent modules
- Use browser DevTools to inspect game state variables

### Future Enhancements
- Engine AI opponent
- Online multiplayer via WebSocket
- Game analysis and review
- Save/load games
- Player ratings and statistics
- Move evaluation (check strength)
- Opening book
