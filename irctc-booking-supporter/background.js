// Background Service Worker for IRCTC Booking Supporter
class BackgroundService {
  constructor() {
    this.init();
  }
  
  init() {
    // Handle extension installation
    chrome.runtime.onInstalled.addListener((details) => {
      if (details.reason === 'install') {
        console.log('🚄 IRCTC Booking Supporter installed successfully!');
        this.openWelcomePage();
      }
    });
    
    // Handle messages from content script or popup (for future use)
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true; // Keep message port open for async response
    });
  }
  
  async openWelcomePage() {
    chrome.tabs.create({
      url: 'https://www.irctc.co.in/nget/train-search',
      active: true
    });
  }
  
  async handleMessage(request, sender, sendResponse) {
    try {
      switch (request.action) {
        case 'openIRCTC':
          await this.openIRCTCTab();
          sendResponse({ success: true });
          break;
          
        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Background script error:', error);
      sendResponse({ success: false, error: error.message });
    }
  }
  
  async openIRCTCTab() {
    const tabs = await chrome.tabs.query({ url: '*://www.irctc.co.in/*' });
    
    if (tabs.length > 0) {
      // Focus existing IRCTC tab
      chrome.tabs.update(tabs[0].id, { active: true });
      chrome.windows.update(tabs[0].windowId, { focused: true });
    } else {
      // Create new IRCTC tab
      chrome.tabs.create({
        url: 'https://www.irctc.co.in/nget/train-search',
        active: true
      });
    }
  }
}

// Initialize background service
const backgroundService = new BackgroundService();