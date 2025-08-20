# 🚄 IRCTC Booking Supporter

[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc/4.0/)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-yellow.svg)](https://developer.chrome.com/docs/extensions/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6-green.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

> **⚠️ NON-COMMERCIAL USE ONLY**: This project is licensed under Creative Commons BY-NC 4.0. Commercial use is prohibited. Free for personal, educational, and research purposes.

## 📖 Project Story

Picture this: It's 10 AM sharp, and Tatkal tickets are about to be released. Your fingers are ready, your journey details are memorized, but the IRCTC website is slow, forms are complex, and every second counts. This Chrome extension was born from the frustration of missing Tatkal bookings due to slow form filling.

This tool automates the tedious parts of IRCTC booking - filling passenger details, selecting classes, choosing payment modes - so you can focus on what matters: securing that crucial Tatkal ticket for your urgent journey. Whether it's a family emergency, an important business meeting, or that long-awaited vacation, this extension helps you navigate the Tatkal booking rush with speed and precision.

## 🎯 What This Extension Does

This Chrome extension assists with IRCTC train booking by:
- **Smart Form Filling**: Automatically fills passenger details, journey information, and preferences
- **Tatkal Booking Support**: Optimized for the speed required during Tatkal booking windows
- **🔒 Secure & Private**: No payment and login data is tracked or stored. You must be logged in to IRCTC before starting the automation. Automation stops before CAPTCHA and payment processing for your security

## 🎥 Video Demonstration

Watch a live demonstration of the extension in action during a sample Tatkal booking process:


[▶️ Watch the demo video (tatkal-booking-demo.mp4)](tatkal-booking-demo.mp4)

*The video shows the complete automation process from form filling to the CAPTCHA step, demonstrating the speed and efficiency gains during Tatkal booking.*

## 📁 File Structure & Purpose

```
/
├── LICENSE                # CC BY-NC License
├── README.md              # This documentation
├── tatkal-booking-demo.mp4  # Video demonstration of Tatkal booking process
└── irctc-booking-supporter/
    ├── manifest.json          # Extension configuration and permissions
    ├── popup.html             # Extension popup interface
    ├── popup.js               # Handles user input and configuration
    ├── content.js             # Main automation engine that works on IRCTC pages
    └── background.js          # Extension service worker for background tasks
```

### File Descriptions

- **`manifest.json`**: Defines extension permissions, content scripts, and Chrome extension settings
- **`popup.html`**: The user interface that appears when you click the extension icon
- **`popup.js`**: Manages the popup functionality, saves/loads booking configurations
- **`content.js`**: The core automation script that runs on IRCTC pages and handles form filling
- **`background.js`**: Manages extension lifecycle and background processes

## 🚀 Installation

1. **Download/Clone the Project**:
   ```bash
   git clone https://github.com/your-username/irctc-booking-supporter.git
   ```

2. **Load Extension in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `irctc-booking-supporter` folder
   - The extension will appear in your toolbar

3. **Configure and Use**:
   - Click the extension icon to open the popup
   - Fill in your passenger details and preferences
   - **Important**: Navigate to IRCTC website and **log in to your account first**
   - Once logged in, click "Start Smart Booking" in the extension popup
   - The extension will assist with form filling during booking

## 📄 License

This project is licensed under the [Creative Commons Attribution-NonCommercial 4.0 International License](https://creativecommons.org/licenses/by-nc/4.0/).

**You are free to:**
- Share and redistribute the material
- Adapt, remix, and build upon the material

**Under the following terms:**
- **Attribution**: You must give appropriate credit and indicate if changes were made
- **NonCommercial**: You may not use the material for commercial purposes

See the [LICENSE](LICENSE) file for complete details.

## 🤖 Development Credits

This project was developed with AI assistance from **Claude (Anthropic)** for vibe-coding, code optimization, and architectural guidance. Despite having no prior experience with web development, the coding assistant helped build an almost commercial-level web extension.