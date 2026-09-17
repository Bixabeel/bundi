/* ============================================
   ABUNDIA.IO - Main Initialization
   Global Utilities & Module Loader
   ============================================ */

(function() {
  'use strict';

  // Progressive enhancement: remove no-js as soon as JS runs,
  // so CSS-driven .reveal* animations (see css/animations.css)
  // only activate when JavaScript is actually available.
  document.documentElement.classList.remove('no-js');

  // Utility: Debounce
  window.debounce = function(func, wait) {
    let timeout;
    return function(...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  };

  // Utility: Throttle
  window.throttle = function(func, limit) {
    let inThrottle;
    return function(...args) {
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };

  // Utility: Check if element is in viewport
  window.isInViewport = function(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.bottom >= 0
    );
  };

  // DOM Ready
  document.addEventListener('DOMContentLoaded', () => {
    // Add loaded class to body for CSS transitions
    document.body.classList.add('is-loaded');
  });

})();