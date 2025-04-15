chrome.runtime.onInstalled.addListener(() => {
    console.log("Real-Time Accessibility Enhancer installed!");
});

chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"]
    });
});
chrome.runtime.onSuspend.addListener(() => {
    // Clear any saved state or preferences
    chrome.storage.sync.clear(() => {
      console.log("Cleared extension state.");
    });
  });
  
// chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//     chrome.scripting.executeScript({
//       target: { tabId: tabs[0].id },
//       func: applyAccessibilitySettings,
//       args: [settings]
//     }, () => {
//       showToastInTab("Changes Applied", "#28a745");
//     });
//   });
  