/**
 * Fix for scroll transition not working on mobile devices
 * This script patches touch detection and ensures screen navigator initializes
 */
(function() {
  'use strict';
  
  var isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
  
  function log() {
    try { console.log.apply(console, arguments); } catch (e) {}
  }
  
  function fixTouchDetection() {
    if (isTouch && window.app && window.app.hasTouch === false) {
      log('[FIX] Correcting app.hasTouch from false to true');
      window.app.hasTouch = true;
      
      // Also update Modernizr if it exists
      if (window.Modernizr && window.Modernizr.touchevents !== undefined) {
        if (!window.Modernizr.touchevents) {
          log('[FIX] Modernizr.touchevents is false, but device is touch-enabled');
        }
      }
    }
  }
  
  function tryInitHomeScreenNavigator() {
    if (typeof window.jQuery === 'undefined' && typeof window.$ === 'undefined') {
      return;
    }
    
    var $ = window.jQuery || window.$;
    var homePage = $('#home-page');
    
    if (homePage.length === 0) {
      log('[FIX] Home page element not found');
      return;
    }
    
    // The home page screen navigator is created in initScreenNavigator()
    // which is called from initPage(). We need to ensure it's initialized.
    // Since we can't directly access the page instance, we'll trigger
    // events that should cause initialization
    
    log('[FIX] Attempting to initialize home screen navigator...');
    
    // Trigger resize which might cause initialization
    $(window).trigger('resize');
    
    // Check if screen navigator exists by looking for home-screen elements
    var homeScreens = $('.home-screen');
    if (homeScreens.length > 0) {
      log('[FIX] Found', homeScreens.length, 'home-screen elements');
      
      // Try to trigger touch/swipe events that might initialize the navigator
      if (isTouch) {
        // Simulate a small touch event to wake up touch handlers
        var firstScreen = homeScreens.first()[0];
        if (firstScreen) {
          try {
            var touchEvent = new TouchEvent('touchstart', {
              bubbles: true,
              cancelable: true,
              touches: [{
                clientX: 0,
                clientY: 0,
                identifier: 0,
                target: firstScreen
              }]
            });
            firstScreen.dispatchEvent(touchEvent);
            log('[FIX] Dispatched touchstart event');
          } catch (e) {
            // TouchEvent might not be available, use Touch instead
            try {
              var touch = document.createTouch ? document.createTouch(
                window, firstScreen, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
              ) : { clientX: 0, clientY: 0, target: firstScreen };
              var touchList = document.createTouchList ? document.createTouchList(touch) : [touch];
              var touchStartEvent = document.createEvent('TouchEvent');
              touchStartEvent.initTouchEvent('touchstart', true, true, window, 0, 0, 0, 0, false, false, false, false, touchList, touchList, touchList, 0);
              firstScreen.dispatchEvent(touchStartEvent);
              log('[FIX] Dispatched touchstart event (fallback)');
            } catch (e2) {
              log('[FIX] Could not dispatch touch event:', e2.message);
            }
          }
        }
      }
    }
  }
  
  // Fix touch detection immediately
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    fixTouchDetection();
    setTimeout(tryInitHomeScreenNavigator, 500);
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      fixTouchDetection();
      setTimeout(tryInitHomeScreenNavigator, 500);
    });
  }
  
  // Also fix on window load
  window.addEventListener('load', function() {
    fixTouchDetection();
    setTimeout(tryInitHomeScreenNavigator, 1000);
  });
  
  // Listen for preloader completion
  document.addEventListener('preloaderComplete', function() {
    log('[FIX] Preloader complete event received');
    fixTouchDetection();
    setTimeout(tryInitHomeScreenNavigator, 200);
  });
  
})();

