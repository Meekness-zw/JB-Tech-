/**
 * Patch to expose screen navigator and ensure it initializes on mobile
 * This runs after scripts.js to hook into the initialization
 */
(function() {
  'use strict';
  
  function log() {
    try { console.log.apply(console, arguments); } catch (e) {}
  }
  
  function exposeScreenNavigator() {
    // Wait for scripts.js to initialize
    if (!window.app || typeof window.jQuery === 'undefined') {
      setTimeout(exposeScreenNavigator, 100);
      return;
    }
    
    var $ = window.jQuery || window.$;
    
    // Try to find the screen navigator by hooking into jQuery
    // The page instance might be accessible through events or data
    var homePage = $('#home-page');
    
    if (homePage.length === 0) {
      log('[EXPOSE] Home page not found yet, retrying...');
      setTimeout(exposeScreenNavigator, 200);
      return;
    }
    
    log('[EXPOSE] Attempting to expose screen navigator...');
    
    // Method 1: Try to access through jQuery's internal event system
    // jQuery stores event handlers on elements, we can try to find the screenNavigator
    var pageElement = homePage[0];
    
    // Method 2: Patch the screen navigator creation by intercepting
    // Since we can't modify scripts.js directly, we'll try to access it after creation
    
    // Method 3: Create a custom event that the screen navigator might listen to
    var customEvent = new CustomEvent('forceInitScreenNavigator', {
      bubbles: true,
      cancelable: true,
      detail: { source: 'expose-patch' }
    });
    pageElement.dispatchEvent(customEvent);
    
    // Method 4: Try to find it by looking at all properties on the page element
    var foundNavigator = false;
    try {
      // Check jQuery data
      var allData = $._data ? $._data(pageElement) : ($.data ? $.data(pageElement) : null);
      if (allData) {
        log('[EXPOSE] jQuery internal data found');
        for (var key in allData) {
          var val = allData[key];
          if (val && typeof val === 'object') {
            if (val.screenNavigator) {
              log('[EXPOSE] Found screenNavigator in jQuery data!');
              window.app.screenNavigator = val.screenNavigator;
              window.app.currentPage = val;
              foundNavigator = true;
              break;
            }
          }
        }
      }
    } catch (e) {
      log('[EXPOSE] Could not access jQuery internal data:', e.message);
    }
    
    // Method 5: Try accessing through the page element's prototype chain
    if (!foundNavigator) {
      try {
        var proto = Object.getPrototypeOf(pageElement);
        while (proto && proto !== Object.prototype) {
          var props = Object.getOwnPropertyNames(proto);
          for (var i = 0; i < props.length; i++) {
            var prop = props[i];
            try {
              var val = pageElement[prop];
              if (val && typeof val === 'object' && val.screenNavigator) {
                log('[EXPOSE] Found screenNavigator via prototype:', prop);
                window.app.screenNavigator = val.screenNavigator;
                window.app.currentPage = val;
                foundNavigator = true;
                break;
              }
            } catch (e) {
              // Skip properties we can't access
            }
          }
          if (foundNavigator) break;
          proto = Object.getPrototypeOf(proto);
        }
      } catch (e) {
        log('[EXPOSE] Error checking prototype:', e.message);
      }
    }
    
    if (foundNavigator && window.app.screenNavigator) {
      log('[EXPOSE] Successfully exposed screenNavigator to window.app');
      
      // Try to initialize or activate it
      var sn = window.app.screenNavigator;
      if (typeof sn.showScreen === 'function') {
        log('[EXPOSE] Attempting to show landing screen...');
        try {
          sn.showScreen('landing');
          log('[EXPOSE] Successfully activated landing screen');
        } catch (e) {
          log('[EXPOSE] ERROR activating screen:', e.message);
        }
      }
    } else {
      log('[EXPOSE] Could not find screenNavigator. The page may not be fully initialized yet.');
      log('[EXPOSE] This is normal if the preloader or asset loading is still in progress.');
    }
  }
  
  // Try immediately and also on various events
  if (document.readyState === 'complete') {
    setTimeout(exposeScreenNavigator, 500);
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(exposeScreenNavigator, 500);
    });
  }
  
  window.addEventListener('load', function() {
    setTimeout(exposeScreenNavigator, 1000);
  });
  
  document.addEventListener('preloaderComplete', function() {
    setTimeout(exposeScreenNavigator, 300);
  });
  
})();

