function injectColorBlindSVGFilters() {
  if (document.getElementById("color-blind-filters")) return;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("id", "color-blind-filters");
  svg.setAttribute("style", "position:absolute;width:0;height:0;");
  svg.innerHTML = `
    <defs>
      <filter id="protanopia">
        <feColorMatrix type="matrix" values="
          0.567, 0.433, 0, 0, 0,
          0.558, 0.442, 0, 0, 0,
          0, 0.242, 0.758, 0, 0,
          0, 0, 0, 1, 0"/>
      </filter>

      <filter id="deuteranopia">
        <feColorMatrix type="matrix" values="
          0.625, 0.375, 0, 0, 0,
          0.7, 0.3, 0, 0, 0,
          0, 0.3, 0.7, 0, 0,
          0, 0, 0, 1, 0"/>
      </filter>

      <filter id="tritanopia">
        <feColorMatrix type="matrix" values="
          0.95, 0.05, 0, 0, 0,
          0, 0.433, 0.567, 0, 0,
          0, 0.475, 0.525, 0, 0,
          0, 0, 0, 1, 0"/>
      </filter>
    </defs>
  `;
  document.body.appendChild(svg);
}
  
  function injectGlobalTintFilter(hexColor) {
    if (document.getElementById('tint-filter-svg')) {
      document.getElementById('tint-filter-svg').remove();
    }
  
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("id", "tint-filter-svg");
    svg.setAttribute("style", "position:absolute;width:0;height:0;");
  
    svg.innerHTML = `
      <filter id="tintFilter">
        <feColorMatrix type="matrix"
          values="1 0 0 0 0
                  0 1 0 0 0
                  0 0 1 0 0
                  0 0 0 1 0" />
        <feFlood flood-color="${hexColor}" flood-opacity="0.3" result="flood"/>
        <feComposite in="flood" in2="SourceGraphic" operator="overlay"/>
      </filter>
    `;
  
    document.body.appendChild(svg);
  }
  function applyGlobalTint() {
    const style = document.createElement("style");
    style.id = "tint-style";
    style.innerHTML = `
      html {
        filter: url(#tintFilter) !important;
      }
    `;
    document.head.appendChild(style);
  }
  
  
  // Apply Color Blindness Filter
  function applyColorBlindFilter(type) {
    const existing = document.getElementById('color-blind-filter-style');
    if (existing) existing.remove();
  
    if (type === 'none') return;
  
    const filterMap = {
      protanopia: 'url(#protanopia)',
      deuteranopia: 'url(#deuteranopia)',
      tritanopia: 'url(#tritanopia)'
    };
  
    const bgColorMap = {
      protanopia: '#e6ffe6',     // light green
      deuteranopia: '#fff5e6',   // light orange
      tritanopia: '#e6f0ff'      // light blue
    };
  
    const style = document.createElement('style');
    style.id = 'color-blind-filter-style';
    style.innerHTML = `
      html {
        filter: ${filterMap[type]} !important;
        background-color: ${bgColorMap[type]} !important;
        transition: filter 0.4s ease, background-color 0.4s ease;
      }
      body {
        background-color: ${bgColorMap[type]} !important;
      }
    `;
    document.head.appendChild(style);
  }
  
  function applyColorBlindOverlay(type) {
    const existing = document.getElementById('color-blind-overlay');
    if (existing) existing.remove();
  
    if (type === 'none') return;
  
    const overlayColorMap = {
      protanopia: 'rgba(200, 255, 200, 0.35)',     // light green tint
      deuteranopia: 'rgba(255, 240, 200, 0.35)',   // light peach
      tritanopia: 'rgba(200, 220, 255, 0.35)'      // light blue
    };
  
    const overlay = document.createElement('div');
    overlay.id = 'color-blind-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.zIndex = '999999'; // Super high to overlay above everything
    overlay.style.pointerEvents = 'none'; // Allows clicks to go through
    overlay.style.backgroundColor = overlayColorMap[type];
    overlay.style.transition = 'background-color 0.4s ease';
  
    document.body.appendChild(overlay);
  }
  
  
  // Replace Specific Colors on the Page
  function replaceColors(fromHex, toHex) {
    const fromRGB = hexToRgb(fromHex.toLowerCase());
    document.querySelectorAll('[data-color-replaced="true"]').forEach(el => {
      el.style.removeProperty('color');
      el.style.removeProperty('background-color');
      el.removeAttribute('data-color-replaced');
    });
    const elements = document.querySelectorAll('*');
    elements.forEach(el => {
      const style = getComputedStyle(el);
      const currentColor = normalizeColor(style.color);
      // const bgColor = normalizeColor(style.backgroundColor);
  
      if (colorsMatch(currentColor, fromRGB)) {
        el.style.setProperty('color', toHex, 'important');
        el.setAttribute('data-color-replaced', 'true');
      }
  
      if (colorsMatch(bgColor, fromRGB)) {
        el.style.setProperty('background-color', toHex, 'important');
        el.setAttribute('data-color-replaced', 'true');
      }
    });
  }
  
  
  // Fix normalization for comparison
  function normalizeColor(color) {
    const match = color.match(/\d+/g);
    return match ? match.map(Number) : [];
  }
  
  // Compare two RGB arrays
  function colorsMatch(rgb1, rgb2) {
    if (!rgb1 || !rgb2 || rgb1.length !== 3 || rgb2.length !== 3) return false;
    return rgb1.every((val, i) => val === rgb2[i]);
  }
  
  
  function hexToRgb(hex) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
    }
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return [r, g, b];  // returns array now
  }
  

  

  function enableHighContrast() {
    const existing = document.getElementById('high-contrast-style');
    if (existing) existing.remove();
  
    const style = document.createElement('style');
    style.id = 'high-contrast-style';
    style.innerHTML = `
      * {
        color: #000 !important;
        background-color: #fff !important;
        border-color: #000 !important;
      }
    `;
    document.head.appendChild(style);
  }
  function parseRGB(colorStr) {
    const match = colorStr.match(/\d+/g);
    return match ? match.map(Number) : [0, 0, 0];
  }
  
  function getLuminance([r, g, b]) {
    const toLinear = c => {
      c /= 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    const [R, G, B] = [toLinear(r), toLinear(g), toLinear(b)];
    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
  }
  
  function getContrast(fg, bg) {
    const fgLum = getLuminance(fg);
    const bgLum = getLuminance(bg);
    return (Math.max(fgLum, bgLum) + 0.05) / (Math.min(fgLum, bgLum) + 0.05);
  }
  
  // Fix Low Contrast Between Text and Background
  function adjustTextBackgroundContrast() {
    const MIN_CONTRAST = 4.5;
    document.querySelectorAll('*').forEach(el => {
      const style = getComputedStyle(el);
      if (!style.color || !style.backgroundColor) return;
  
      const fg = parseRGB(style.color);
      const bg = parseRGB(style.backgroundColor);
  
      const contrast = getContrast(fg, bg);
      if (contrast < MIN_CONTRAST) {
        el.style.color = '#000';
        el.style.backgroundColor = '#fff';
      }
    });
  }
  // Simple Contrast Checker
  function lowContrast(fg, bg) {
    const toRGB = str => {
      const match = str.match(/\d+/g);
      return match ? match.map(Number) : [0, 0, 0];
    };
  
    const luminance = ([r, g, b]) =>
      0.2126 * r + 0.7152 * g + 0.0722 * b;
  
    const contrastRatio = (l1, l2) =>
      (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  
    const fgL = luminance(toRGB(fg));
    const bgL = luminance(toRGB(bg));
  
    return contrastRatio(fgL, bgL) < 4.5;
  }
  
  // Adapt Images & Highlight Red Warnings
  function adaptImages() {
    const images = document.querySelectorAll('img');
  
    // Apply basic contrast enhancement with CSS filters
    images.forEach(img => {
      img.style.filter = 'contrast(1.2) saturate(1.2)';
    });
  
    // Highlight elements with red text (like warnings or errors)
    const redWarnings = [...document.querySelectorAll('*')].filter(el => {
      const color = getComputedStyle(el).color;
      return color.includes('rgb(255, 0, 0)');
    });
  
    redWarnings.forEach(el => {
      // Add a dashed border and warning icon via pseudo element
      el.style.border = '2px dashed black';
      el.style.position = 'relative';
  
      // Add a warning symbol overlay (if not already added)
      if (!el.querySelector('.colorblind-icon')) {
        const icon = document.createElement('span');
        icon.className = 'colorblind-icon';
        icon.textContent = '⚠️';
        icon.style.position = 'absolute';
        icon.style.top = '0';
        icon.style.right = '0';
        icon.style.background = '#fff';
        icon.style.fontSize = '14px';
        icon.style.padding = '2px';
        el.appendChild(icon);
      }
    });
  }
  
  // Main Logic
  chrome.storage.sync.get([
    'filterType',
    'replaceFrom',
    'replaceTo',
    'highContrast',
    'textBgAdjust',
    'imageAdapt',
    'colorTint'
  ], (settings) => {
    // Always inject the filter definitions
    injectColorBlindSVGFilters();
  
    // Apply color blindness filter + overlay (only if not "none")
    applyColorBlindFilter(settings.filterType);
    applyColorBlindOverlay(settings.filterType);
  
    // Apply color replacement logic independently
    if (settings.replaceFrom && settings.replaceTo) {
      replaceColors(settings.replaceFrom, settings.replaceTo);
    }
  
    // Other toggles
    if (settings.highContrast) {
      enableHighContrast();
    }
  
    if (settings.textBgAdjust) {
      adjustTextBackgroundContrast();
    }
  
    if (settings.imageAdapt) {
      adaptImages();
    }
  
    if (settings.colorTint) {
      injectGlobalTintFilter(settings.colorTint);
      applyGlobalTint();
    }
  });
  