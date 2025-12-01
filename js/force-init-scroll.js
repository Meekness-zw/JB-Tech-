(function () {
  // Lightweight touch detection
  var isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);

  // Show logs on screen for mobile debugging (disabled)
  var showOnScreen = false; // Set to true to enable on-screen logs
  
  // Remove any existing on-screen log viewer
  (function() {
    try {
      var existingLog = document.getElementById('mobile-debug-logs');
      if (existingLog) {
        existingLog.remove();
      }
    } catch (e) {}
  })();
  
  function log() {
    try { 
      console.log.apply(console, arguments);
      // On-screen logging disabled - logs only go to console
    } catch (e) {}
  }

  function debugLog(msg, data) {
    var prefix = '[DEBUG: force-init-scroll]';
    if (data !== undefined) {
      log(prefix, msg, data);
    } else {
      log(prefix, msg);
    }
  }

  function tryInitScroll() {
    debugLog('=== Starting scroll initialization attempt ===');
    debugLog('Touch device:', isTouch);
    debugLog('Preloader active class:', document.body.classList.contains('preloader-active'));
    debugLog('Document ready state:', document.readyState);

    // Try multiple possible global object names
    var candidates = ['App', 'app', 'Site', 'site', 'window'];
    var found = null;
    var initMethod = null;

    for (var i = 0; i < candidates.length; i++) {
      var name = candidates[i];
      var obj = name === 'window' ? window : window[name];
      
      if (obj && typeof obj === 'object') {
        debugLog('Found global object:', name, obj);
        
        // Check for initScroll
        if (typeof obj.initScroll === 'function') {
          found = obj;
          initMethod = 'initScroll';
          debugLog('Found initScroll on', name);
          break;
        }
        
        // Check for init
        if (typeof obj.init === 'function') {
          found = obj;
          initMethod = 'init';
          debugLog('Found init on', name);
          break;
        }
        
        // Check for renderScroll
        if (typeof obj.renderScroll === 'function') {
          debugLog('Found renderScroll on', name, '(but no initScroll)');
        }
      }
    }

    // If we found a candidate, try to call it
    if (found && initMethod) {
      try {
        debugLog('Attempting to call', initMethod, 'on', found);
        found[initMethod]();
        debugLog('Successfully called', initMethod);
      } catch (e) {
        debugLog('ERROR calling', initMethod + ':', e.message, e.stack);
      }
    } else {
      debugLog('No initScroll or init method found. Dumping window globals...');
      
      // Dump first ~50 window properties to help identify the app object
      var count = 0;
      var globals = [];
      for (var key in window) {
        if (count++ > 50) break;
        try {
          var val = window[key];
          var type = typeof val;
          if (type === 'object' || type === 'function') {
            globals.push(key + ' (' + type + ')');
          }
        } catch (e) {
          globals.push(key + ' (error accessing)');
        }
      }
      debugLog('Window globals (first 50):', globals.join(', '));
    }

    // Check for window.app (the actual global from scripts.js)
    if (window.app) {
      debugLog('Found window.app object:', window.app);
      debugLog('window.app properties:', Object.keys(window.app).slice(0, 20).join(', '));
      
      // Check for screenNavigator system
      if (window.app.currentScreen) {
        debugLog('Found window.app.currentScreen:', window.app.currentScreen);
        debugLog('Current screen ID:', window.app.currentScreen.id);
        
        // Check for screenNavigator methods
        if (typeof window.app.currentScreen.initScreenNavigator === 'function') {
          debugLog('Found initScreenNavigator on currentScreen');
          try {
            window.app.currentScreen.initScreenNavigator();
            debugLog('Successfully called initScreenNavigator');
          } catch (e) {
            debugLog('ERROR calling initScreenNavigator:', e.message, e.stack);
          }
        }
        
        // Check for renderScroll on currentScreen
        if (typeof window.app.currentScreen.renderScroll === 'function') {
          debugLog('Found renderScroll on currentScreen');
          try {
            window.app.currentScreen.renderScroll();
            debugLog('Successfully called renderScroll');
          } catch (e) {
            debugLog('ERROR calling renderScroll:', e.message);
          }
        }
      }
      
      // Check for direct initScroll on app
      if (typeof window.app.initScroll === 'function') {
        debugLog('Found window.app.initScroll');
        try {
          window.app.initScroll();
          debugLog('Successfully called window.app.initScroll');
        } catch (e) {
          debugLog('ERROR calling window.app.initScroll:', e.message);
        }
      }
    }
    
    // Try to access home page through jQuery and DOM
    if (typeof window.jQuery === 'function' || typeof window.$ === 'function') {
      try {
        var $ = window.jQuery || window.$;
        var homePage = $('#home-page');
        if (homePage.length > 0) {
          debugLog('Found #home-page element via jQuery');
          
          // Try to access data or events on the element
          var pageData = homePage.data();
          debugLog('Home page data:', Object.keys(pageData).join(', '));
          
          // The home page instance might be stored in jQuery data
          // Try common jQuery data keys
          var possibleKeys = ['page', 'screen', 'screenNavigator', 'instance', 'homePage'];
          for (var i = 0; i < possibleKeys.length; i++) {
            var key = possibleKeys[i];
            var value = homePage.data(key);
            if (value) {
              debugLog('Found jQuery data key:', key, value);
              if (value.screenNavigator && typeof value.screenNavigator.showScreen === 'function') {
                debugLog('Found screenNavigator via jQuery data!');
                try {
                  // Try to show the landing screen to initialize scroll
                  value.screenNavigator.showScreen('landing');
                  debugLog('Successfully called screenNavigator.showScreen("landing")');
                } catch (e) {
                  debugLog('ERROR calling screenNavigator.showScreen:', e.message);
                }
              }
              if (typeof value.initScreenNavigator === 'function') {
                debugLog('Found initScreenNavigator on page instance!');
                try {
                  value.initScreenNavigator();
                  debugLog('Successfully called initScreenNavigator');
                } catch (e) {
                  debugLog('ERROR calling initScreenNavigator:', e.message);
                }
              }
            }
          }
          
          // Try to trigger a resize event which might initialize scroll
          debugLog('Triggering resize event on window...');
          $(window).trigger('resize');
          
          // Check if there's a screenNavigator on the page element
          var pageElement = homePage[0];
          if (pageElement && pageElement.screenNavigator) {
            debugLog('Found screenNavigator on page element');
            if (typeof pageElement.screenNavigator.showScreen === 'function') {
              debugLog('screenNavigator.showScreen exists');
            }
          }
        }
      } catch (e) {
        debugLog('Error accessing home page via jQuery:', e.message);
      }
    }
    
    // Check for jQuery-based initialization
    if (typeof window.jQuery === 'function' || typeof window.$ === 'function') {
      debugLog('jQuery detected, checking for app object via jQuery...');
      try {
        var $ = window.jQuery || window.$;
        var appObj = $.fn.app || window.app;
        if (appObj && typeof appObj.initScroll === 'function') {
          debugLog('Found jQuery-based app.initScroll');
          try {
            appObj.initScroll();
            debugLog('Successfully called jQuery-based initScroll');
          } catch (e) {
            debugLog('ERROR calling jQuery-based initScroll:', e.message);
          }
        }
      } catch (e) {
        debugLog('Error checking jQuery:', e.message);
      }
    }

    debugLog('=== End scroll initialization attempt ===');
  }

  // Listen for preloader completion
  document.addEventListener('preloaderComplete', function() {
    debugLog('preloaderComplete event received');
    setTimeout(tryInitScroll, 100);
  });

  // Also try on window load as fallback
  if (document.readyState === 'complete') {
    debugLog('Document already complete, attempting init after delay');
    setTimeout(tryInitScroll, 500);
  } else {
    window.addEventListener('load', function() {
      debugLog('Window load event fired');
      setTimeout(tryInitScroll, 500);
    });
  }

  // Fix touch detection if it's wrong
  if (isTouch && window.app && window.app.hasTouch === false) {
    debugLog('FIXING: app.hasTouch is false but device is touch-enabled. Setting to true...');
    try {
      window.app.hasTouch = true;
      debugLog('Successfully set app.hasTouch = true');
    } catch (e) {
      debugLog('ERROR setting app.hasTouch:', e.message);
    }
  }

  // Immediate check for existing scroll system
  setTimeout(function() {
    debugLog('=== Immediate diagnostic check ===');
    debugLog('typeof window.App =', typeof window.App);
    debugLog('typeof window.app =', typeof window.app);
    debugLog('typeof window.Site =', typeof window.Site);
    
    if (window.app) {
      debugLog('window.app exists with keys:', Object.keys(window.app).join(', '));
      debugLog('window.app.hasTouch =', window.app.hasTouch);
      debugLog('window.app.windowWidth =', window.app.windowWidth);
      debugLog('window.app.screenM =', window.app.screenM);
      
      if (window.app.currentScreen) {
        debugLog('window.app.currentScreen.id =', window.app.currentScreen.id);
        debugLog('window.app.currentScreen methods:', Object.getOwnPropertyNames(window.app.currentScreen).filter(function(n) {
          return typeof window.app.currentScreen[n] === 'function';
        }).join(', '));
      }
    }
    
    if (window.App && typeof window.App.initScroll === 'function') {
      debugLog('Found window.App.initScroll');
    }
    if (window.app && typeof window.app.initScroll === 'function') {
      debugLog('Found window.app.initScroll');
    }
    if (window.Site && typeof window.Site.initScroll === 'function') {
      debugLog('Found window.Site.initScroll');
    }
    
    debugLog('Preloader active:', document.body.classList.contains('preloader-active'));
    debugLog('=== End immediate check ===');
  }, 1000);
})();

