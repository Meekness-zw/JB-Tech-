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
      log('[FIX] jQuery not available');
      return;
    }
    
    var $ = window.jQuery || window.$;
    var homePage = $('#home-page');
    
    if (homePage.length === 0) {
      log('[FIX] Home page element not found');
      return;
    }
    
    log('[FIX] Attempting to access and initialize home screen navigator...');
    
    // Try to find the page instance through jQuery data
    // The page instance might be stored on the element
    var pageInstance = null;
    var pageData = homePage.data();
    
    // Try common data keys where the instance might be stored
    for (var key in pageData) {
      var value = pageData[key];
      if (value && typeof value === 'object') {
        // Check if it has screenNavigator property
        if (value.screenNavigator) {
          log('[FIX] Found screenNavigator via jQuery data key:', key);
          pageInstance = value;
          break;
        }
        // Check if it's the page instance itself
        if (typeof value.initScreenNavigator === 'function' || 
            typeof value.initPage === 'function') {
          log('[FIX] Found page instance via jQuery data key:', key);
          pageInstance = value;
          break;
        }
      }
    }
    
    // If we found the page instance, try to initialize screen navigator
    if (pageInstance) {
      if (typeof pageInstance.initScreenNavigator === 'function') {
        log('[FIX] Calling initScreenNavigator on page instance...');
        try {
          pageInstance.initScreenNavigator();
          log('[FIX] Successfully called initScreenNavigator');
        } catch (e) {
          log('[FIX] ERROR calling initScreenNavigator:', e.message);
        }
      }
      
      if (pageInstance.screenNavigator) {
        log('[FIX] Found screenNavigator on page instance');
        var sn = pageInstance.screenNavigator;
        
        // Try to show the landing screen to activate it
        if (typeof sn.showScreen === 'function') {
          log('[FIX] Attempting to show landing screen...');
          try {
            sn.showScreen('landing');
            log('[FIX] Successfully called showScreen("landing")');
          } catch (e) {
            log('[FIX] ERROR calling showScreen:', e.message);
          }
        }
      }
    } else {
      log('[FIX] Could not find page instance. Trying alternative methods...');
      
      // Try to access through the page element's properties
      var pageElement = homePage[0];
      if (pageElement) {
        // Check if screenNavigator is directly on the element
        for (var prop in pageElement) {
          if (prop === 'screenNavigator' || prop === 'page' || prop === 'screen') {
            log('[FIX] Found property on element:', prop);
            var val = pageElement[prop];
            if (val && typeof val.showScreen === 'function') {
              log('[FIX] Found screenNavigator on element property');
              try {
                val.showScreen('landing');
                log('[FIX] Successfully called showScreen via element property');
              } catch (e) {
                log('[FIX] ERROR:', e.message);
              }
            }
          }
        }
      }
    }
    
    // Trigger resize which might cause initialization
    log('[FIX] Triggering resize event...');
    $(window).trigger('resize');
    
    // Check if screen navigator exists by looking for home-screen elements
    var homeScreens = $('.home-screen');
    if (homeScreens.length > 0) {
      log('[FIX] Found', homeScreens.length, 'home-screen elements');
      
      // NOTE:
      // Previously this block tried to auto-click the hero scroll button
      // (`#home-landing__scroll` / `#home-scroll-cta__btn`) after a delay.
      // That caused the page to auto-scroll from the hero to the next step
      // as soon as the site loaded.
      //
      // To allow users to scroll manually from the hero, the auto-click
      // behaviour has been removed intentionally.
    }
  }
  
  // Fix touch detection as soon as DOM is ready (no need to wait for full load)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      fixTouchDetection();
      setTimeout(tryInitHomeScreenNavigator, 500);
    });
  } else {
    fixTouchDetection();
    setTimeout(tryInitHomeScreenNavigator, 500);
  }
  
  // Listen for preloader completion
  document.addEventListener('preloaderComplete', function() {
    log('[FIX] Preloader complete event received');
    fixTouchDetection();
    setTimeout(tryInitHomeScreenNavigator, 200);
  });
  
})();

