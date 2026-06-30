/**
 * ANTI-TAMPER.JS
 * Disable browser DevTools dan prevent code modification
 *
 * KEGUNAAN: Protect game dari inspection dan tampering via browser DevTools
 * TANPA: Player bisa easily modify game logic via console
 * KONEKSI: Load di HTML PERTAMA sebelum JS lain
 */

(function() {
  'use strict';

  // ═══ DISABLE DEVTOOLS ═══

  // Disable F12 key
  document.onkeydown = function(e) {
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      return false;
    }
    // Ctrl+Shift+I (DevTools)
    if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
      e.preventDefault();
      return false;
    }
    // Ctrl+Shift+J (Console)
    if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
      e.preventDefault();
      return false;
    }
    // Ctrl+Shift+C (Inspect)
    if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
      e.preventDefault();
      return false;
    }
  };

  // Disable right-click context menu
  document.oncontextmenu = function(e) {
    e.preventDefault();
    return false;
  };

  // Detect kalau DevTools sudah dibuka
  let devtools = { open: false, orientation: null };
  const threshold = 160; // pixel threshold

  setInterval(() => {
    // Check kalau console dibuka (window height berubah drastis)
    if (window.outerHeight - window.innerHeight > threshold ||
        window.outerWidth - window.innerWidth > threshold) {
      if (!devtools.open) {
        devtools.open = true;
        // DevTools terdeteksi - bisa add custom action
        console.clear();
        console.log('%cWarning!', 'color:red;font-size:20px;font-weight:bold');
        console.log('%cDo not modify game logic!', 'color:orange;font-size:14px');
      }
    } else {
      devtools.open = false;
    }
  }, 500);

  // ═══ ANTI-TAMPER CHECKS ═══

  // Store hash dari critical functions saat load
  const originalFunctions = {
    getLegalMoves: typeof getLegalMoves !== 'undefined' ? getLegalMoves.toString() : null,
    executeMove: typeof executeMove !== 'undefined' ? executeMove.toString() : null,
    handleClick: typeof handleClick !== 'undefined' ? handleClick.toString() : null
  };

  // Simple hash function
  function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }

  // Periodic check kalau critical functions berubah
  setInterval(() => {
    if (typeof getLegalMoves !== 'undefined' && originalFunctions.getLegalMoves) {
      const currentHash = simpleHash(getLegalMoves.toString());
      const originalHash = simpleHash(originalFunctions.getLegalMoves);

      if (currentHash !== originalHash) {
        console.warn('⚠️ TAMPERING DETECTED: getLegalMoves has been modified!');
        // Reset game atau trigger alert
        if (confirm('Cheating detected! Game akan di-reset. OK?')) {
          location.reload();
        }
      }
    }
  }, 1000);

  // ═══ OBFUSCATE GLOBAL SCOPE ═══

  // Hide sensitive function names dari window object inspection
  const sensitiveVars = [
    'getLegalMoves', 'executeMove', 'handleClick', 'addChaosticMoves'
  ];

  sensitiveVars.forEach(varName => {
    if (typeof window[varName] !== 'undefined') {
      Object.defineProperty(window, varName, {
        value: window[varName],
        writable: false,
        configurable: false
      });
    }
  });

  console.log('%c🔒 Anti-tamper protection ACTIVE', 'color:green;font-weight:bold');
})();
