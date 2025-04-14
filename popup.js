
  
document.getElementById("applyBtn").addEventListener("click", () => {
  const settings = {
    filterType: document.getElementById("filterType").value,
    replaceFrom: document.getElementById("replaceFrom").value,
    replaceTo: document.getElementById("replaceTo").value,
    colorTint: document.getElementById("colorTint").value,
    highContrast: document.getElementById("contrastToggle").checked,
    textBgAdjust: document.getElementById("textBgAdjustToggle").checked,
    imageAdapt: document.getElementById("imageAdaptToggle").checked,
    fontSize: document.getElementById("fontSize").value,
lineSpacing: document.getElementById("lineSpacing").value,
fontFamily: document.getElementById("fontFamily").value,
dyslexicFont: document.getElementById("dyslexicFontToggle").checked,


  };

  chrome.storage.sync.set(settings, () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: applyAccessibilitySettings,
        args: [settings]
      }, () => {
        showToastInTab("Changes Applied", "#28a745");
      });
    });
  });
});


document.getElementById("resetBtn").addEventListener("click", () => {
  // Clear Chrome storage
  chrome.storage.sync.clear(() => {
    // Reset the form fields in popup
    document.getElementById("filterType").value = "none";
    document.getElementById("replaceFrom").value = "#000000";
    document.getElementById("replaceTo").value = "#000000";
    document.getElementById("colorTint").value = "#000000";
    document.getElementById("contrastToggle").checked = false;
    document.getElementById("textBgAdjustToggle").checked = false;
    document.getElementById("imageAdaptToggle").checked = false;

    const fontSizeInput = document.getElementById("fontSize");
    const lineSpacingInput = document.getElementById("lineSpacing");
    const fontFamilyInput = document.getElementById("fontFamily");
    const dyslexicFontToggle = document.getElementById("dyslexicFontToggle");

    if (fontSizeInput) fontSizeInput.value = 16;
    if (lineSpacingInput) lineSpacingInput.value = 1.5;
    if (fontFamilyInput) fontFamilyInput.value = "default";
    if (dyslexicFontToggle) dyslexicFontToggle.checked = false;

    // Clear changes from the webpage
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: clearAllAccessibilityChanges
      }, () => {
        showToastInTab("♻️ Reset to Default", "#dc3545");
      });
    });
  });
});


// Injected function: Clear all effects from page
function clearAllAccessibilityChanges() {
  // Remove all injected <style> tags
  ['color-blind-filter-style', 'high-contrast-style', 'tint-style', 'dyslexic-font-style'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.remove();
  });

  // Remove overlays and SVGs
  ['color-blind-overlay', 'tint-filter-svg', 'color-blind-filters'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.remove();
  });

  // Remove replaced colors
  document.querySelectorAll('[data-color-replaced="true"]').forEach(el => {
    el.style.removeProperty('color');
    el.style.removeProperty('background-color');
    el.removeAttribute('data-color-replaced');
  });
  document.getElementById('dyslexic-font-style')?.remove();
  document.body.style.removeProperty('font-family');
  
  // Remove filter on images
  document.querySelectorAll('img').forEach(img => {
    img.style.removeProperty('filter');
  });

  // Remove warning icons
  document.querySelectorAll('.colorblind-icon').forEach(icon => icon.remove());

  // Reset font styles
  document.querySelectorAll('*').forEach(el => {
    el.style.removeProperty('font-size');
    el.style.removeProperty('line-height');
    el.style.removeProperty('font-family');
  });

  // Remove dyslexic font (if loaded dynamically)
  if (document.body.style.fontFamily.includes('OpenDyslexic')) {
    document.body.style.removeProperty('font-family');
  }

  const toast = document.getElementById("extension-toast");
  if (toast) toast.remove();
}


// Inject toast into web page from popup
function showToastInTab(message, color) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: (msg, clr) => {
        let toast = document.getElementById("extension-toast");
        if (!toast) {
          toast = document.createElement("div");
          toast.id = "extension-toast";
          toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${clr};
            color: white;
            padding: 12px 18px;
            font-weight: bold;
            border-radius: 6px;
            z-index: 1000000;
            box-shadow: 0 2px 6px rgba(0,0,0,0.2);
            font-family: sans-serif;
            max-width: 300px;
          `;
          toast.innerHTML = `
            <span>${msg}</span>
            <div id="toast-progress-bar" style="
              height: 4px;
              background: white;
              width: 100%;
              margin-top: 8px;
              transition: width 2s linear;
            "></div>
          `;
          document.body.appendChild(toast);
        } else {
          toast.style.background = clr;
          toast.querySelector("span").textContent = msg;
        }

        const bar = document.getElementById("toast-progress-bar");
        bar.style.transition = "none";
        bar.style.width = "100%";
        void bar.offsetWidth; // Force reflow
        bar.style.transition = "width 2s linear";
        bar.style.width = "0%";

        setTimeout(() => {
          toast.remove();
        }, 2100);
      },
      args: [message, color]
    });
  });
}
function applyAccessibilitySettings(settings) {
  // Inject SVG filter defs
  if (!document.getElementById("color-blind-filters")) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("id", "color-blind-filters");
    svg.setAttribute("style", "position:absolute;width:0;height:0;");
    svg.innerHTML = `
      <defs>
        <filter id="protanopia">
          <feColorMatrix type="matrix" values="0.567 0.433 0 0 0 0.558 0.442 0 0 0 0 0.242 0.758 0 0 0 0 0 1 0"/>
        </filter>
        <filter id="deuteranopia">
          <feColorMatrix type="matrix" values="0.625 0.375 0 0 0 0.7 0.3 0 0 0 0 0.3 0.7 0 0 0 0 0 1 0"/>
        </filter>
        <filter id="tritanopia">
          <feColorMatrix type="matrix" values="0.95 0.05 0 0 0 0 0.433 0.567 0 0 0 0.475 0.525 0 0 0 0 0 1 0"/>
        </filter>
      </defs>`;
    document.body.appendChild(svg);
  }

  // Apply blindness filter
  const existingFilter = document.getElementById('color-blind-filter-style');
  if (existingFilter) existingFilter.remove();

  const filterMap = {
    protanopia: 'url(#protanopia)',
    deuteranopia: 'url(#deuteranopia)',
    tritanopia: 'url(#tritanopia)'
  };

  if (settings.filterType !== 'none') {
    const style = document.createElement('style');
    style.id = 'color-blind-filter-style';
    style.innerHTML = `
      html {
        filter: ${filterMap[settings.filterType]} !important;
        transition: filter 0.4s ease;
      }
    `;
    document.head.appendChild(style);
  }
  if (settings.dyslexicFont) {
    const fontLink = document.createElement('link');
    fontLink.href = 'https://cdn.jsdelivr.net/npm/open-dyslexic-fonts/open-dyslexic.css';
    fontLink.rel = 'stylesheet';
    fontLink.id = 'dyslexic-font-style';
    document.head.appendChild(fontLink);
  
    document.body.style.fontFamily = 'OpenDyslexic, sans-serif';
  }
  
  
  
  
  // Overlay tint
  const existingOverlay = document.getElementById('color-blind-overlay');
  if (existingOverlay) existingOverlay.remove();

  if (settings.filterType !== 'none') {
    const overlayColorMap = {
      protanopia: 'rgba(200, 255, 200, 0.35)',
      deuteranopia: 'rgba(255, 240, 200, 0.35)',
      tritanopia: 'rgba(200, 220, 255, 0.35)'
    };
    const overlay = document.createElement('div');
    overlay.id = 'color-blind-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      z-index: 999999;
      background-color: ${overlayColorMap[settings.filterType]};
      pointer-events: none;
      transition: background-color 0.4s ease;
    `;
    document.body.appendChild(overlay);
  }
  if (settings.fontSize || settings.lineSpacing || settings.fontFamily) {
    document.querySelectorAll('*').forEach(el => {
      if (settings.fontSize) el.style.fontSize = settings.fontSize + "px";
      if (settings.lineSpacing) el.style.lineHeight = settings.lineSpacing;
      if (settings.fontFamily && settings.fontFamily !== "default") {
        el.style.fontFamily = settings.fontFamily;
      }
    });
  }
  // Color replacement
  if (settings.replaceFrom && settings.replaceTo) {
    const fromRGB = hexToRgb(settings.replaceFrom.toLowerCase());
    document.querySelectorAll('[data-color-replaced="true"]').forEach(el => {
      el.style.removeProperty('color');
      el.style.removeProperty('background-color');
      el.removeAttribute('data-color-replaced');
    });

    document.querySelectorAll('*').forEach(el => {
      const style = getComputedStyle(el);
      const currentColor = normalizeColor(style.color);
      const bgColor = normalizeColor(style.backgroundColor);

      if (colorsMatch(currentColor, fromRGB)) {
        el.style.setProperty('color', settings.replaceTo, 'important');
        el.setAttribute('data-color-replaced', 'true');
      }

      if (colorsMatch(bgColor, fromRGB)) {
        el.style.setProperty('background-color', settings.replaceTo, 'important');
        el.setAttribute('data-color-replaced', 'true');
      }
    });

  }

  // High contrast
  if (settings.highContrast) {
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

  // Text & background contrast fix
  if (settings.textBgAdjust) {
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

  // Image adaptation
  if (settings.imageAdapt) {
    document.querySelectorAll('img').forEach(img => {
      img.style.filter = 'contrast(1.2) saturate(1.2)';
    });
  }

  // Helper functions (included inline)
  function hexToRgb(hex) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    return [parseInt(hex.substr(0, 2), 16), parseInt(hex.substr(2, 2), 16), parseInt(hex.substr(4, 2), 16)];
  }

  function normalizeColor(color) {
    const match = color.match(/\d+/g);
    return match ? match.map(Number) : [];
  }

  function colorsMatch(rgb1, rgb2) {
    return rgb1 && rgb2 && rgb1.length === 3 && rgb2.every((v, i) => v === rgb1[i]);
  }

  function parseRGB(colorStr) {
    const match = colorStr.match(/\d+/g);
    return match ? match.map(Number) : [0, 0, 0];
  }

  function getLuminance([r, g, b]) {
    const toLinear = c => (c /= 255) <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    const [R, G, B] = [toLinear(r), toLinear(g), toLinear(b)];
    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
  }

  function getContrast(fg, bg) {
    const fgLum = getLuminance(fg);
    const bgLum = getLuminance(bg);
    return (Math.max(fgLum, bgLum) + 0.05) / (Math.min(fgLum, bgLum) + 0.05);
  }
}
