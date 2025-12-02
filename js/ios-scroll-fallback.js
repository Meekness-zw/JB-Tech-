(function () {
  'use strict';

  // Basic touch / iOS detection
  var ua = navigator.userAgent || navigator.vendor || window.opera || '';
  var isTouch =
    ('ontouchstart' in window) ||
    (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) ||
    /iP(ad|hone|od)/i.test(ua);

  if (!isTouch) {
    return;
  }

  function hasCustomScrollEngine() {
    try {
      // Heuristic: if the home page screenNavigator exists, the custom engine is running
      if (
        window.app &&
        window.app.screenNavigator &&
        typeof window.app.screenNavigator.showScreen === 'function'
      ) {
        return true;
      }

      // Some builds might hang the navigator off currentPage
      if (
        window.app &&
        window.app.currentPage &&
        window.app.currentPage.screenNavigator &&
        typeof window.app.currentPage.screenNavigator.showScreen === 'function'
      ) {
        return true;
      }
    } catch (e) {
      // If anything errors, assume engine is not safely initialized
    }
    return false;
  }

  function enableNativeScroll() {
    var docEl = document.documentElement;
    var body = document.body;
    if (docEl) {
      docEl.style.overflow = '';
    }
    if (body) {
      body.style.overflow = '';
      body.style.webkitOverflowScrolling = 'touch';
    }

    var homePage = document.getElementById('home-page');
    if (homePage) {
      homePage.style.overflowY = 'auto';
      homePage.style.overflowX = 'hidden';
      homePage.style.webkitOverflowScrolling = 'touch';
    }

    var screens = document.querySelectorAll('.home-screen');
    screens.forEach(function (el) {
      el.style.overflowY = 'auto';
      el.style.overflowX = 'hidden';
      el.style.webkitOverflowScrolling = 'touch';
    });
  }

  function tryEnsureScroll() {
    // If custom engine is running, do nothing – it controls scroll.
    if (hasCustomScrollEngine()) {
      return;
    }

    // Otherwise, fall back to native scrolling by clearing locks.
    enableNativeScroll();
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(tryEnsureScroll, 150);
    });
  } else {
    setTimeout(tryEnsureScroll, 150);
  }

  // Also re-check after preloader completes, if that event is fired
  document.addEventListener('preloaderComplete', function () {
    setTimeout(tryEnsureScroll, 150);
  });
})();


