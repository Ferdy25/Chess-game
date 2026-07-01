# ♟Chaos Chess - Refactored Code

A beautiful, fully-featured chess game built with vanilla HTML, CSS, and JavaScript.

## ✨ Features

- ♔ Full chess rules implementation
- ⏱ Multiple time controls (Bullet, Blitz, Rapid, Classical)
- ↶ Undo move functionality
- ⇅ Board flip view
- 📊 Move history with algebraic notation
- 🎨 Elegant dark theme with gold accents
- 📱 Responsive design (desktop, tablet, mobile)
- ♟ Pawn promotion modal
- ⚠️ Check/checkmate detection
- 🤐 Stalemate and draw conditions

## 📁 Project Structure

```
chess/
├── index.html              # Main HTML entry point
├── css/style.css           # All styling (well-organized & commented)
├── js/                     # JavaScript modules
│   ├── constants.js        # Game constants and initial board
│   ├── pieces.js           # Piece movement & attack detection
│   ├── moves.js            # Legal move validation
│   ├── board.js            # Board rendering & interaction
│   ├── game.js             # Game state & move execution
│   ├── timer.js            # Timer countdown
│   ├── ui.js               # UI updates
│   ├── modals.js           # Modal dialogs
│   ├── handlers.js         # User input handlers
│   └── main.js             # App entry point
├── STRUCTURE.md            # Detailed architecture docs
└── README.md               # This file
```

## 🎮 How to Play

1. **Open `index.html`** in a web browser
2. **Click "New Game"** and select time control
3. **Click a piece** to select it (shows legal moves)
4. **Click a square** to move the piece
5. **Promote pawns** when reaching the opposite end
6. **Use buttons**:
   - **New Game**: Start a fresh game
   - **Undo**: Take back the last move
   - **Flip**: View from black's perspective

## 🏗️ Code Organization

Each JavaScript file has **one clear responsibility**:

| File | Purpose |
|------|---------|
| `constants.js` | Game constants (pieces, values, initial board) |
| `pieces.js` | Piece movement and attack calculations |
| `moves.js` | Legal move validation and move simulation |
| `board.js` | Board rendering and square click handling |
| `game.js` | Core game logic and state management |
| `timer.js` | Timer countdown and timeout detection |
| `ui.js` | Status updates, panels, captured pieces, history |
| `modals.js` | Timer selection, game over, promotion modals |
| `handlers.js` | Undo move and flip board functionality |
| `main.js` | Application entry point |

## 📝 Code Comments

Every function includes detailed comments explaining:

```javascript
/**
 * KEGUNAAN: What this function does and why it's needed
 * TANPA: What breaks if this function is missing
 * KONEKSI: How this connects with other functions/modules
 */
```

Example:
```javascript
/**
 * Execute a move with full chess rule validation
 * 
 * KEGUNAAN: Apply move to board, handle captures, detect game end
 * TANPA: Cannot execute moves or track game state
 * KONEKSI: Called by board.js; updates game.js state variables
 */
function executeMove(fromRow, fromCol, toRow, toCol, move) {
  // ... function implementation
}
```

## 🎯 Key Implementation Details

### Chess Rules
- ♟ Pawn: Forward movement, diagonal captures, en passant, promotion
- ♞ Knight: L-shaped jumps (2-1 squares)
- ♗ Bishop: Diagonal movement any distance
- ♖ Rook: Horizontal/vertical movement any distance
- ♕ Queen: Combines rook + bishop movement
- ♔ King: One square any direction, castling with rook

### Special Moves
- **Castling**: King moves 2 squares, rook moves adjacent
- **En Passant**: Pawn captures horizontally on opponent's advance
- **Promotion**: Pawn becomes Q, R, B, or N at 8th/1st rank

### Game End Conditions
- **Checkmate**: King in check with no legal moves
- **Stalemate**: Not in check but no legal moves
- **Timeout**: Time runs out
- **Insufficient Material**: Only kings or king + 1 minor piece

## 🎨 Design

- **Color Scheme**: Dark background (#060607) with gold accents (#c9a25d)
- **Typography**: Cormorant Garamond (headers), Plus Jakarta Sans (body), JetBrains Mono (code)
- **Animations**: Smooth transitions, spring physics, fade effects
- **Responsive**: Mobile-first design with media queries

## 🔧 Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6 JavaScript (arrow functions, template literals, etc.)
- CSS Grid and Flexbox layouts
- CSS custom properties (variables)

## 🚀 Performance

- Minimal dependencies (vanilla JS, no frameworks)
- Efficient board representation (8x8 2D array)
- Optimized rendering (only re-render on changes)
- Lightweight CSS (~2000 lines, fully commented)
- Modular JavaScript (easy to maintain and extend)

## 📦 File Sizes

- `index.html`: ~8 KB
- `css/style.css`: ~12 KB (with comments)
- `js/`: ~25 KB total (all modules with detailed comments)

## 🎓 Learning Value

This project demonstrates:
- Clean code organization with modular functions
- Chess algorithm implementation (move generation, validation)
- DOM manipulation and event handling
- CSS styling and responsive design
- Game state management
- Comment documentation best practices

## 📄 Old Files

- `home.html` - Original single-file version (kept for reference, can be deleted)

You can now delete `home.html` since `index.html` is the new entry point with organized CSS and JS files.

## 🔄 Maintenance Notes

### When adding features:
1. Identify which module it belongs to
2. Add function with proper comments
3. Update related modules as needed
4. Test with existing features

### Module dependencies:
```
constants.js
    ↓
pieces.js, moves.js
    ↓
board.js, game.js
    ↓
timer.js, ui.js, modals.js, handlers.js
    ↓
main.js
```

### To extend the game:
- Add AI opponent → create `js/ai.js`
- Add multiplayer → create `js/network.js`
- Add analysis → create `js/analysis.js`
- Add statistics → create `js/stats.js`

---

**Happy playing!** ♟️


