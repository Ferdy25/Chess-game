/**
 * Build script untuk minify dan obfuscate JavaScript files
 * Jalankan: node build.js
 */

const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

const jsDir = './js';
const outputDir = './js-min';

// Create output directory kalau belum ada
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// File order matters - dependencies harus di-load first
const jsFiles = [
  'constants.js',
  'pieces.js',
  'moves.js',
  'board.js',
  'game.js',
  'timer.js',
  'ui.js',
  'modals.js',
  'handlers.js',
  'main.js'
];

// Process each file
jsFiles.forEach(async (file) => {
  const filePath = path.join(jsDir, file);
  const code = fs.readFileSync(filePath, 'utf8');

  try {
    const result = await minify(code, {
      compress: {
        passes: 3,  // Multiple passes untuk aggressive compression
        unused: true,
        dead_code: true,
        drop_debugger: true,
        drop_console: false  // Keep console for debugging kalau perlu
      },
      mangle: {
        toplevel: true,  // Mangle top-level variables
        properties: false  // Don't mangle object properties
      },
      output: {
        comments: false  // Remove all comments
      }
    });

    const outputPath = path.join(outputDir, file);
    fs.writeFileSync(outputPath, result.code);
    console.log(`✅ Minified: ${file} → ${file} (${code.length} → ${result.code.length} bytes)`);
  } catch (error) {
    console.error(`❌ Error minifying ${file}:`, error);
  }
});

console.log('\n✅ Build complete! Minified files di: js-min/');
console.log('💡 Update index.html untuk link ke js-min/ folder');
