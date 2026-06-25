/**
 * CONSTANTS.JS
 * Defines all constant values used throughout the chess application
 * including piece symbols, board state, and piece values
 *
 * KEGUNAAN: Menyimpan semua konstanta agar mudah diubah dan diakses
 * TANPA FILE INI: Aplikasi tidak punya referensi untuk simbol piece dan nilai piece
 * KONEKSI: Digunakan oleh board.js, ui.js, dan game.js
 */

// Mapping piece type to Unicode symbol for rendering
// K=King, Q=Queen, R=Rook, B=Bishop, N=Knight, P=Pawn
// Uppercase = White pieces, Lowercase = Black pieces
const PIECES = {
  'K': '♚', // White King
  'Q': '♛', // White Queen
  'R': '♜', // White Rook
  'B': '♝', // White Bishop
  'N': '♞', // White Knight
  'P': '♟', // White Pawn
  'k': '♚', // Black King
  'q': '♛', // Black Queen
  'r': '♜', // Black Rook
  'b': '♝', // Black Bishop
  'n': '♞', // Black Knight
  'p': '♟'  // Black Pawn
};

// Relative value of each piece type (material count)
// Used to calculate material advantage after captures
// KEGUNAAN: Mengevaluasi keuntungan material saat ada capture
// Pawn=1, Knight=3, Bishop=3, Rook=5, Queen=9, King=0 (cannot be captured)
const PIECE_VALUES = {
  'P': 1, 'p': 1,  // Pawn
  'N': 3, 'n': 3,  // Knight
  'B': 3, 'b': 3,  // Bishop
  'R': 5, 'r': 5,  // Rook
  'Q': 9, 'q': 9,  // Queen
  'K': 0, 'k': 0   // King (cannot be valued)
};

// Algebraic notation for pieces (used in move history display)
// Empty string for pawns because pawn moves don't include the piece symbol
// e.g., "e4" not "Pe4", but "Nf3" for knight move
const PIECE_NAMES = {
  'K': 'K', 'k': 'K',  // King
  'Q': 'Q', 'q': 'Q',  // Queen
  'R': 'R', 'r': 'R',  // Rook
  'B': 'B', 'b': 'B',  // Bishop
  'N': 'N', 'n': 'N',  // Knight
  'P': '', 'p': ''     // Pawn (no symbol in notation)
};

// Initial board state in FEN-like 2D array format
// Row 0 = Black's back rank, Row 7 = White's back rank
// Columns 0-7 represent a-h files
// null = empty square
// KEGUNAAN: Setup papan catur dalam posisi awal standar
// STRUKTUR: [rank] [file] dimana rank 0 adalah baris Black, rank 7 adalah White
const INIT_BOARD = [
  ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],  // Black back rank
  ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],  // Black pawns
  [null, null, null, null, null, null, null, null],  // Empty
  [null, null, null, null, null, null, null, null],  // Empty
  [null, null, null, null, null, null, null, null],  // Empty
  [null, null, null, null, null, null, null, null],  // Empty
  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],  // White pawns
  ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']   // White back rank
];

// Default game settings
const DEFAULT_TIMER_MINUTES = 10;
const BOARD_SIZE = 8;
const TIMER_LOW_THRESHOLD = 30; // Seconds - timer turns red below this
