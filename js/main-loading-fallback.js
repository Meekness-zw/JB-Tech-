(function () {
  function ensureMainLoadingSkeleton() {
    if (document.getElementById('main-loading-page')) {
      return;
    }

    var wrapper = document.createElement('div');
    wrapper.id = 'main-loading-page';
    wrapper.className = 'initial-loader';
    wrapper.setAttribute('aria-hidden', 'true');

    var overlay = document.createElement('div');
    overlay.id = 'main-loading__overlay';
    wrapper.appendChild(overlay);

    var outer = document.createElement('div');
    outer.id = 'main-loading__outer';
    wrapper.appendChild(outer);

    var cubeField = document.createElement('div');
    cubeField.className = 'initial-loader__cube-field';
    cubeField.setAttribute('aria-hidden', 'true');
    outer.appendChild(cubeField);

    var inner = document.createElement('div');
    inner.id = 'main-loading__inner';
    outer.appendChild(inner);

    var logo = document.createElement('div');
    logo.id = 'main-loading__logo';
    logo.className = 'initial-loader__logo';
    logo.innerHTML = getLogoMarkup();
    inner.appendChild(logo);

    var lines = document.createElement('div');
    lines.id = 'main-loading__lines';
    lines.className = 'initial-loader__lines';
    inner.appendChild(lines);

    var spiral = document.createElement('div');
    spiral.className = 'initial-loader__spiral';
    spiral.innerHTML = getSpiralMarkup();
    inner.appendChild(spiral);

    var progress = document.createElement('div');
    progress.id = 'main-loading__progress';
    var progressValue = document.createElement('span');
    progressValue.id = 'main-loading__progress__value';
    progressValue.textContent = '00';
    progress.appendChild(progressValue);
    inner.appendChild(progress);

    document.body.insertBefore(wrapper, document.body.firstChild || null);

    createLines(lines);
    populateCubes(cubeField);
    debouncePopulateOnResize(cubeField);
    requestAnimationFrame(function () {
      wrapper.classList.add('initial-loader--ready');
    });
  }

  function getLogoMarkup() {
    return '' +
      '<svg viewBox=\"0 0 2000 2000\" class=\"initial-loader__logo-svg\" role=\"img\" aria-label=\"JB Technologies logo\">' +
      '  <g class=\"logo-glow\">' +
      '    <path d=\"M694.24,902.84h92c0,10.92.12,21.74,0,32.55-.36,28.82,3.78,34.42,32.84,37.44a144.18,144.18,0,0,0,39.06-1.72c20-3.47,24.41-9.3,24.56-29.74.41-55,.36-109.92.45-164.88,0-23.5,0-47,0-71a15,15,0,0,1,14.78-15h1.3q151.57-.06,303.14.12a277.55,277.55,0,0,1,40.7,3.25c35,5.29,56.07,23.94,62,58.82,3.43,20.05,3.47,41.21,1.53,61.53-2.61,27.2-19.23,44.6-45.88,52-2.78.77-5.42,2-11.06,4.13,7.23,1.57,11.35,2.5,15.48,3.35,26.6,5.46,44.45,20.71,46.88,48.2,2.07,23.4,3.25,47.54-.15,70.62-5.3,36-31.3,58.7-72.94,59.88-78.2,2.2-156.5.63-236,.63V850.27a14,14,0,0,1,13.95-14H1019c53-.14,106.09,0,159.13-.53,29.78-.3,45.07-27,30.8-53.68-2.31-4.32-7.7-8.11-12.49-9.74-6-2.06-12.92-2.19-19.45-2.21q-99.27-.21-198.55,0c-3.88,0-7.76.49-17.39,1.16,24.76,13.66,19,33.28,19.13,51.11.23,47.9.36,95.81-.05,143.71-.48,54.4-26.31,85.25-80.29,88.52-44.66,2.71-89.87,1.19-134.53-2.33-38-3-59.28-26.76-65.91-69.65C695.46,957,695.89,930.61,694.24,902.84Zm405.54,70.84c30.84,0,60.89.57,90.91-.28,12.26-.34,23-6.75,25.54-19.75,2.86-14.79,4.23-30.18-7-43-1.9-2.17-4.88-4.81-7.37-4.84-34-.32-67.94-.21-102.11-.21Z\" />' +
      '    <rect x=\"792.4\" y=\"694.72\" width=\"79.63\" height=\"73.16\" rx=\"14.52\" />' +
      '    <rect x=\"853.54\" y=\"613.34\" width=\"69.35\" height=\"68.6\" rx=\"14.78\" />' +
      '    <rect x=\"797.83\" y=\"590.38\" width=\"46.28\" height=\"45.92\" rx=\"9.87\" />' +
      '    <path d=\"M454.44,1146.31V1232h-30v-85.7H396.3V1120.7h88.14v25.61Z\" />' +
      '    <path d=\"M524.73,1145.17v20.06H572.1v20.63H524.73v21.69h51.61V1232H494.72V1120.7h80.64v24.47Z\" />' +
      '    <path d=\"M656.25,1189.93h29.44v3.35q-.08,9.54-.49,13.21-.9,7.83-4,12.39-7.19,10.68-20.8,13-5.13.9-21.93.9-12.65,0-15.82-.25a45.84,45.84,0,0,1-15.25-3.34q-17.53-8-19.08-33.76-.66-11-.65-29,0-12.48,1.47-19.16,2.19-10.36,8.8-16.64,7.9-7.5,20.55-9.62,6.6-1.14,23.16-1.14,18.18,0,25.36,2.36,16.14,5.31,17.77,25.93.26,2.94.41,12.32H655.6c-.05-.87-.08-1.61-.08-2.2q-.16-8.82-5.22-11.26-3.09-1.55-13.45-1.55-14.19,0-16.88,7.75-1.63,4.65-1.63,33.11,0,12.47,3.5,16.47,3.75,4.4,15.9,4.4,9.87,0,13.54-2,5-2.94,5-11.82Z\" />' +
      '    <path d=\"M796.35,1120.7V1232h-30v-43.79H727.85V1232h-30V1120.7h30v41.92h38.49V1120.7Z\" />' +
      '    <path d=\"M925.67,1120.7V1232H875.05l-31.39-85.71h-1.32l.49,10.27q.81,17.13.81,30.91V1232H814.45V1120.7h50.23l17.69,46.89q7.83,20.79,13.7,37.76h1.23l-.49-10q-.73-15-.74-30.09V1120.7Z\" />' +
      '    <path d=\"M992.7,1119.89q20.55,0,29.36,3.83,15.64,6.85,19.24,24.38,1.47,7.19,1.47,28.87,0,18.18-1.14,24.87-3.27,19.08-18.1,26-10.6,5-34.58,5-23.24,0-33.11-6-12.55-7.74-15.49-23.07-1.22-6.45-1.22-21.45,0-28.05,2.93-38.57,4.08-14.6,21.45-20.71Q972.15,1119.89,992.7,1119.89Zm-.9,25.6q-10.35-.08-14.19,1.55-6.27,2.61-7.58,13.86c-.16,1.26-.24,7-.24,17.13q0,17.21,2,22.34,1.88,4.82,8.48,6.2a64.78,64.78,0,0,0,11.26.65q7.83,0,10.92-.9a11.32,11.32,0,0,0,7.63-7.13q2.16-5.51,2.16-24,0-18.18-2-22.87t-7.83-6.07A50.08,50.08,0,0,0,991.8,1145.49Z\" />' +
      '    <path d=\"M1087,1120.7v85.71h46.73V1232H1057V1120.7Z\" />' +
      '    <path d=\"M1194.36,1119.89q20.55,0,29.35,3.83,15.66,6.85,19.25,24.38,1.47,7.19,1.46,28.87,0,18.18-1.14,24.87-3.26,19.08-18.1,26-10.61,5-34.57,5-23.25,0-33.11-6-12.55-7.74-15.49-23.07-1.23-6.45-1.23-21.45,0-28.05,2.94-38.57,4.08-14.6,21.45-20.71Q1173.81,1119.89,1194.36,1119.89Zm-.9,25.6q-10.35-.08-14.19,1.55-6.29,2.61-7.58,13.86c-.16,1.26-.25,7-.25,17.13q0,17.21,2,22.34,1.88,4.82,8.48,6.2a64.73,64.73,0,0,0,11.25.65q7.83,0,10.93-.9a11.36,11.36,0,0,0,7.63-7.13q2.14-5.51,2.16-24,0-18.18-2-22.87t-7.83-6.07A50.15,50.15,0,0,0,1193.46,1145.49Z\" />' +
      '    <path d=\"M1306.4,1169.14h50.31q.4,17.44.41,24.54,0,14.52-3.1,21.7-5.71,13.2-21.85,16.06-7.83,1.38-27.4,1.39-18,0-25.36-2.12-17.06-5-22.43-22.67-2.28-7.5-2.28-21.45,0-19.72.73-31.31,1.23-19.48,14.36-28,7.9-5.14,19.4-6.61a183,183,0,0,1,20.8-.81q20.46,0,28.13,2.44,10.92,3.51,15.17,12.73,3,6.68,3.42,20.22h-30.17q-1-7.33-6.12-9.38-3-1.22-12.15-1.22t-14.1,1.63q-8,2.68-8.65,14.68-.24,4.73-.24,14.27,0,20.46,2,25.68,2.76,7.1,18.18,7.1,11.34,0,15.49-2,6.29-3.18,6.28-13c0-.6,0-1.66-.08-3.18H1306.4Z\" />' +
      '    <path d=\"M1401.15,1120.7V1232h-30V1120.7Z\" />' +
      '    <path d=\"M1449.1,1145.17v20.06h47.37v20.63H1449.1v21.69h51.61V1232h-81.62V1120.7h80.65v24.47Z\" />' +
      '    <path d=\"M1604.52,1155.44h-28.38q0-5.39-.81-7.5a7.07,7.07,0,0,0-5.3-4.57,45.81,45.81,0,0,0-9.54-.73q-9.56,0-12.56,1.14-5.62,2.12-5.63,9.79,0,6.27,3.18,8.15,2.37,1.38,11.74,2,8.73.48,17.37,1.06a77.59,77.59,0,0,1,17.13,3q9.85,3.09,13.45,11.09,2.68,5.86,2.69,17.85,0,13.54-2.6,20-4.74,11.67-21.27,14.76-6.93,1.31-21.92,1.31-23,0-32.42-2.86-15-4.56-16.78-22.67c-.28-2.77-.41-6.55-.41-11.33h28.29v2.2q0,7.57,4.24,9.7,3.1,1.56,16.64,1.55c4.62,0,7.25,0,7.91-.08a10.78,10.78,0,0,0,6.85-3.26c1.41-1.58,2.12-4.21,2.12-7.91q0-6.43-4-8.56-2.37-1.23-10.11-1.72-25.61-1.55-33.11-3.34-11.32-2.77-15.57-11.49-3.27-6.69-3.26-20,0-19.74,9.29-26.34,6.62-4.65,18.51-6.12a187.39,187.39,0,0,1,19.74-.73q27,0,35.22,6.2,9.46,7.08,9.46,24.21C1604.68,1151.28,1604.63,1153,1604.52,1155.44Z\" />' +
      '  </g>' +
      '</svg>';
  }

  function getSpiralMarkup() {
    return '' +
      '<svg width=\"80\" height=\"80\" viewBox=\"0 0 80 80\" class=\"initial-loader__spiral-svg\" aria-hidden=\"true\">' +
      '  <defs>' +
      '    <linearGradient id=\"spiralGradient\" x1=\"0%\" y1=\"0%\" x2=\"100%\" y2=\"100%\">' +
      '      <stop offset=\"0%\" stop-color=\"#60a5fa\" stop-opacity=\"1\" />' +
      '      <stop offset=\"50%\" stop-color=\"#3b82f6\" stop-opacity=\"0.8\" />' +
      '      <stop offset=\"100%\" stop-color=\"#1d4ed8\" stop-opacity=\"0.3\" />' +
      '    </linearGradient>' +
      '  </defs>' +
      '  <circle cx=\"40\" cy=\"40\" r=\"32\" fill=\"none\" stroke=\"url(#spiralGradient)\" stroke-width=\"6\" stroke-linecap=\"round\" stroke-dasharray=\"160 50\">' +
      '    <animateTransform attributeName=\"transform\" type=\"rotate\" from=\"0 40 40\" to=\"360 40 40\" dur=\"1.5s\" repeatCount=\"indefinite\"></animateTransform>' +
      '  </circle>' +
      '  <circle cx=\"40\" cy=\"40\" r=\"24\" fill=\"none\" stroke=\"#60a5fa\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-dasharray=\"100 50\" opacity=\"0.6\">' +
      '    <animateTransform attributeName=\"transform\" type=\"rotate\" from=\"360 40 40\" to=\"0 40 40\" dur=\"2s\" repeatCount=\"indefinite\"></animateTransform>' +
      '  </circle>' +
      '  <circle cx=\"40\" cy=\"40\" r=\"16\" fill=\"none\" stroke=\"#3b82f6\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-dasharray=\"60 30\" opacity=\"0.4\">' +
      '    <animateTransform attributeName=\"transform\" type=\"rotate\" from=\"0 40 40\" to=\"360 40 40\" dur=\"1s\" repeatCount=\"indefinite\"></animateTransform>' +
      '  </circle>' +
      '</svg>';
  }

  function createLines(container) {
    if (!container) return;
    var svgNS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 400 200');
    svg.setAttribute('width', '400');
    svg.setAttribute('height', '200');

    for (var i = 0; i < 12; i += 1) {
      var path = document.createElementNS(svgNS, 'path');
      var yStart = 20 + i * 12;
      var yEnd = 40 + i * 10;
      var xEnd = 360 - i * 12;
      path.setAttribute('d', 'M20 ' + yStart + ' L ' + xEnd + ' ' + yEnd);
      path.setAttribute('stroke-width', (1.5 + (i % 3) * 0.6).toFixed(1));
      path.setAttribute('opacity', (0.35 + i * 0.05).toFixed(2));
      svg.appendChild(path);
    }

    container.appendChild(svg);
  }

  function populateCubes(container) {
    if (!container) return;
    container.innerHTML = '';
    var viewportArea = window.innerWidth * window.innerHeight;
    var cubeCount = Math.max(12, Math.floor(viewportArea / 50000));

    for (var i = 0; i < cubeCount; i += 1) {
      var cube = document.createElement('div');
      cube.className = 'initial-loader__cube';
      var size = 8 + Math.random() * 16;
      cube.style.width = size + 'px';
      cube.style.height = size + 'px';
      cube.style.left = Math.random() * 100 + '%';
      cube.style.top = Math.random() * 100 + '%';
      cube.style.opacity = (0.35 + Math.random() * 0.4).toFixed(2);
      cube.style.animationDuration = (10 + Math.random() * 20).toFixed(2) + 's';
      cube.style.animationDelay = (Math.random() * 5).toFixed(2) + 's';
      cube.style.setProperty('--cube-x-offset', (2 + Math.random() * 6).toFixed(2) + 'vw');
      cube.style.setProperty('--cube-y-offset', (3 + Math.random() * 9).toFixed(2) + 'vh');
      container.appendChild(cube);
    }
  }

  function debouncePopulateOnResize(container) {
    var resizeTimeout;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(function () {
        populateCubes(container);
      }, 250);
    });
  }

  function init() {
    if (document.body) {
      ensureMainLoadingSkeleton();
    } else {
      document.addEventListener('DOMContentLoaded', ensureMainLoadingSkeleton, {
        once: true
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();

