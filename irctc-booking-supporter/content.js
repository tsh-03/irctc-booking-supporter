// IRCTC Content Script - Cleaned and optimized version
if (typeof window.IRCTCAutomation !== 'undefined') {
  console.log('🔄 IRCTC Automation already loaded');
} else {

class IRCTCAutomation {
  constructor() {
    this.config = null;
    this.currentStep = 'idle';
    this.isTatkalMode = false;
    this.maxRetries = 5;
    this.retryCount = 0;
    this.init();
  }
  
  init() {
    console.log('🚄 IRCTC Booking Supporter loaded');
    this.createFloatingStatus();
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'startBooking') {
        this.startAutomation(request.config);
        sendResponse({ success: true });
      }
    });
  }
  
  createFloatingStatus() {
    this.statusDiv = document.createElement('div');
    this.statusDiv.id = 'irctc-helper-status';
    this.statusDiv.style.cssText = `
      position: fixed; top: 20px; right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white; padding: 20px 24px 20px 20px; border-radius: 12px;
      font-family: system-ui; font-size: 16px; font-weight: 500;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4); z-index: 10000;
      display: none; max-width: 400px; min-width: 300px; word-wrap: break-word;
      cursor: move; user-select: none;
      transform: scale(0) translateY(-20px);
      transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      opacity: 0;
    `;
    
    // Create close button
    const closeButton = document.createElement('span');
    closeButton.innerHTML = '✕';
    closeButton.style.cssText = `
      position: absolute; top: 8px; right: 12px;
      cursor: pointer; font-size: 18px; font-weight: bold;
      color: rgba(255,255,255,0.8); hover: rgba(255,255,255,1);
      padding: 2px 4px; border-radius: 3px;
    `;
    closeButton.addEventListener('click', (e) => {
      e.stopPropagation();
      // Animate out before hiding
      this.statusDiv.style.transform = 'scale(0) translateY(-20px)';
      this.statusDiv.style.opacity = '0';
      setTimeout(() => this.statusDiv.style.display = 'none', 300);
    });
    closeButton.addEventListener('mouseenter', () => {
      closeButton.style.backgroundColor = 'rgba(255,255,255,0.2)';
    });
    closeButton.addEventListener('mouseleave', () => {
      closeButton.style.backgroundColor = 'transparent';
    });
    
    // Create message container
    this.statusMessage = document.createElement('div');
    this.statusMessage.style.cssText = `
      padding-right: 30px; line-height: 1.5; font-size: 16px;
    `;
    
    this.statusDiv.appendChild(this.statusMessage);
    this.statusDiv.appendChild(closeButton);
    
    // Make draggable
    this.makeDraggable(this.statusDiv);
    
    document.body.appendChild(this.statusDiv);
  }
  
  makeDraggable(element) {
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;
    
    element.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);
    
    function dragStart(e) {
      if (e.target.tagName === 'SPAN' && e.target.innerHTML === '✕') return; // Don't drag on close button
      
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;
      
      if (e.target === element || e.target.parentNode === element) {
        isDragging = true;
        element.style.cursor = 'grabbing';
      }
    }
    
    function drag(e) {
      if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
        
        xOffset = currentX;
        yOffset = currentY;
        
        // Keep within viewport bounds
        const rect = element.getBoundingClientRect();
        const maxX = window.innerWidth - rect.width;
        const maxY = window.innerHeight - rect.height;
        
        currentX = Math.min(Math.max(0, currentX), maxX);
        currentY = Math.min(Math.max(0, currentY), maxY);
        
        element.style.transform = `translate(${currentX}px, ${currentY}px)`;
      }
    }
    
    function dragEnd(e) {
      isDragging = false;
      element.style.cursor = 'move';
    }
  }
  
  showStatus(message, permanent = true) {
    // Replace \n with <br> for HTML line breaks
    this.statusMessage.innerHTML = `🚄 ${message}`.replace(/\n/g, '<br>');
    this.statusDiv.style.display = 'block';
    
    // Trigger popup animation
    setTimeout(() => {
      this.statusDiv.style.transform = 'scale(1) translateY(0)';
      this.statusDiv.style.opacity = '1';
    }, 10);
    
    // Add a slight bounce effect
    setTimeout(() => {
      this.statusDiv.style.transform = 'scale(1.05) translateY(0)';
    }, 300);
    
    setTimeout(() => {
      this.statusDiv.style.transform = 'scale(1) translateY(0)';
    }, 400);
    
    if (message.toLowerCase().includes('error')) {
      this.statusDiv.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)';
      this.statusDiv.style.border = '2px solid #ff4757';
    } else {
      this.statusDiv.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      this.statusDiv.style.border = '1px solid rgba(255,255,255,0.2)';
    }
    
    // Only auto-hide if explicitly set to non-permanent
    if (!permanent) {
      setTimeout(() => {
        this.statusDiv.style.transform = 'scale(0) translateY(-20px)';
        this.statusDiv.style.opacity = '0';
        setTimeout(() => this.statusDiv.style.display = 'none', 300);
      }, 3000);
    }
  }

  async startAutomation(config) {
    this.config = config;
    this.isTatkalMode = config.mode === 'tatkal';
    this.retryCount = 0;
    
    const modeText = this.isTatkalMode ? 'TATKAL' : 'GENERAL';
    this.showStatus(`Starting ${modeText} booking...`);
    
    console.log(`🚄 Starting IRCTC automation in ${modeText} mode`);

    if (!this.validateConfig(config)) {
      this.showStatus('Invalid configuration. Please check all fields.');
      return;
    }

    const currentUrl = window.location.href;
    if (currentUrl.includes('train-search') && currentUrl.includes('irctc.co.in')) {
      // Check if user is logged in
      if (!this.isUserLoggedIn()) {
        this.showStatus('❌ Please log in to IRCTC first!<br>Login → Then click "Start Smart Booking"');
        return;
      }
      await this.handleIRCTCFlow();
    } else {
      this.showStatus('Please navigate to IRCTC train-search website and log in first.');
    }
  }

  isUserLoggedIn() {
  // Check for IRCTC logout button - if it exists, user is logged in
  const logoutButton = document.querySelector('a.search_btn.loginText.ng-star-inserted > span');
  
  const isLoggedIn = logoutButton !== null;
  
  console.log(`🔐 Login check: logoutButton=${!!logoutButton}, result=${isLoggedIn}`);
  
  return isLoggedIn;
}

  validateConfig(config) {
    if (!config.journey?.from || !config.journey?.to) return false;
    if (!config.contact?.mobile) return false;
    if (!config.passengers?.length) return false;
    for (const passenger of config.passengers) {
      if (!passenger.name || !passenger.age) return false;
    }
    return true;
  }

  async handleIRCTCFlow() {
    try {
      const url = window.location.href;
      console.log(`🌐 Current URL: ${url}`);
      
      // Check for access blocked
      if (url.includes('errors.edgesuite.net') || 
          document.body.textContent.includes("You don't have permission")) {
        this.showStatus('⛔ IRCTC Access Blocked!');
        return;
      }
      
      await this.waitForPageReady();
      
      if (url.includes('train-search')) {
        await this.fillSearchForm();
      } else if (url.includes('train-list')) {
        
        await this.selectTrain();
      } else if (url.includes('psgninput')) {
        await this.fillPassengerDetails();
      } else {
        this.showStatus('Navigating to search page...');
        window.location.href = 'https://www.irctc.co.in/nget/train-search';
      }
    } catch (error) {
      console.error('❌ Automation error:', error);
      this.showStatus(`Error: ${error.message}`);
    }
  }

  async waitForPageReady() {
    if (document.readyState !== 'complete') {
      await new Promise(resolve => window.addEventListener('load', resolve, { once: true }));
    }
    await this.sleep(1000);
  }

  async fillSearchForm() {
    this.showStatus('Filling search form...');
    
    try {
      await this.sleep(800);
      
      // Fill From Station
      const fromInput = await this.findElement('#origin input');
      if (fromInput) {
        await this.fillInput(fromInput, this.config.journey.from);
        await this.selectDropdownOption();
      }

      // Fill To Station
      const toInput = await this.findElement('#destination input');
      if (toInput) {
        await this.fillInput(toInput, this.config.journey.to);
        await this.selectDropdownOption();
      }

      // Select Date
      const dateInput = await this.findElement('div.col-md-5 > div.ui-float-label input');
      if (dateInput) {
        await this.clickElement(dateInput);
        await this.selectDate();
      }

      // Select Quota
      const quotaDropdown = await this.findElement('form > div:nth-of-type(3) div.ui-dropdown-trigger > span');
      if (quotaDropdown) {
        await this.clickElement(quotaDropdown);
        await this.sleep(500);
        
        // Try multiple selectors for quota options
        const quotaText = this.isTatkalMode ? 'TATKAL' : 'GENERAL';
        const quotaOption = await this.findElement(`li:contains("${quotaText}")`);

        if (quotaOption) await this.clickElement(quotaOption);
      }

      // Click Search
      const searchButton = await this.findElement('button[type="submit"]');
      if (searchButton) {
        this.showStatus('Searching trains...', true);
        await this.clickElement(searchButton);
        await this.waitForSearchResults();
      }
    } catch (error) {
      console.error('❌ Search form error:', error);
      this.showStatus(`Search error: ${error.message}`);
    }
  }

  async waitForSearchResults() {
    this.showStatus('⏳ Waiting for train list page...');

    const maxWait = 45000;
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWait) {
      const currentUrl = window.location.href;
      
      if (currentUrl.includes('train-list')) {
        console.log('✅ On train list page');
        await this.sleep(500);
        await this.selectTrain();
        return;
      }
      
      if (document.body.textContent.includes('No trains found')) {
        this.showStatus('No trains found for this route.');
        return;
      }
      
      await this.sleep(100);
    }
    
    this.showStatus('Search timeout. Please check manually.');
  }

  async selectTrain() {
    const requestedTrain = this.config.journey.trainPreference;
    this.showStatus(`Looking for train: ${requestedTrain}...`, true);
    console.log(`🚂 selectTrain() function started for train: ${requestedTrain}`);
    
    try {
      // Get all train elements on the page
      const trainElements = document.querySelectorAll('app-train-avl-enq, [class*="train"], .trainlist-table tr, .search-result');
      const foundTrain = Array.from(trainElements).filter(el => el.textContent.includes(requestedTrain));

      if (foundTrain.length > 0) {
        const trainContainer = foundTrain[0];
        this.showStatus('Found requested train. Selecting class and date...', true);
        
        // Step 1: Click on the class tab (e.g., 3A, SL, 2A, 1A)
        const requestedClass = this.config.journey.class;
        console.log(`🎫 Looking for class: ${requestedClass}`);
        
        // First, find the class container
        const classContainer = trainContainer.querySelector('div.ng-star-inserted > div:nth-child(5) > div.white-back.col-xs-12.ng-star-inserted');

        let position = null;
        if (classContainer) {
          // Get all div elements in the class container
          const candidateElements = classContainer.querySelectorAll('div');
          
          // Find all div.pre-avl elements
          const preAvlElements = Array.from(candidateElements).filter(div => div.classList.contains('pre-avl'));
          
          // Find the position of the div.pre-avl that contains the requested class
          for (let i = 0; i < preAvlElements.length; i++) {
            const element = preAvlElements[i];
            if (element.textContent.includes(requestedClass)) {
              position = i + 1; // nth-child is 1-based
              console.log(`✅ Found class ${requestedClass} in div.pre-avl at position ${position}`);
              break;
            }
          }
        } else {
          console.log('❌ Class container not found');
        }

        if (position) {
          // Use the original selector with the found position
          const classEl = trainContainer.querySelector(`table tr td:nth-child(${position}) div div.col-xs-12.link span`);
          
          if (classEl) {
            console.log(`✅ Found class element: ${requestedClass} at position ${position}`);
            await this.clickElement(classEl);
          } else {
            this.showStatus(`Class element "${requestedClass}" not found at position ${position}.`);
            console.log(`❌ Class element not found with original selector at position ${position}`);
            return;
          }
        } else {
          this.showStatus(`Class "${requestedClass}" not found in div.pre-avl elements.`);
          console.log(`❌ Class "${requestedClass}" not found in any div.pre-avl elements`);
          return;
        }
        
        // Step 2: Find the date and check availability
        const targetDate = new Date(this.config.journey.date);
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        const dayName = dayNames[targetDate.getDay()];
        const dayNumber = targetDate.getDate().toString().padStart(2, '0');
        const monthName = monthNames[targetDate.getMonth()];
        const dateString = `${dayName}, ${dayNumber} ${monthName}`;
        
        console.log(`📅 Looking for date: ${dateString}`);
        
        // Wait for the date cell to become available (up to 45 seconds)
        const availableDate = await this.waitForAvailableDate(trainContainer, dateString);
        
        if (availableDate) {
          // Click on the available date
          await this.clickElement(availableDate);
          
          // Step 3: Wait for and click Book Now button
          console.log('🔘 Waiting for Book Now button to appear...');
          const bookNowButton = await this.waitForBookNowButton(trainContainer);
          
          if (bookNowButton) {
            console.log('✅ Found Book Now button, clicking...');
            await this.clickElement(bookNowButton);
            await this.waitForPassengerPage();
          } else {
            this.showStatus('Book Now button not found after 45 seconds. Please check manually.');
          }
        } else {
          this.showStatus(`Train not available on ${dateString}. Please check other dates.`);
        }
        
      } else {
        this.showStatus(`Train "${requestedTrain}" not found on this page. Please check manually.`);
      }
    } catch (error) {
      console.error('❌ Train selection error:', error);
      this.showStatus(`Train selection error: ${error.message}`);
    }
  }

  async waitForBookNowButton(trainContainer) {
    const maxWait = 45000; // 45 seconds
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWait) {
      const bookNowButton = trainContainer.querySelector('div.col-xs-12 > div > span > span:nth-child(1) > button');
      
      if (bookNowButton && bookNowButton.offsetParent !== null) { // Check if button exists and is visible
        return bookNowButton;
      }
      
      await this.sleep(100); // Check every 100ms
    }
    
    return null; // Button not found within timeout
  }

  async waitForAvailableDate(trainContainer, dateString) {
    const maxWait = 45000; // 45 seconds
    const startTime = Date.now();
    
    console.log(`⏳ Waiting up to 45 seconds for date "${dateString}" to become available...`);
    
    while (Date.now() - startTime < maxWait) {
      const dateCells = trainContainer.querySelectorAll('.pre-avl');
      
      for (const cell of dateCells) {
        if (cell.textContent.includes(dateString)) {
          const statusElement = cell.querySelector('.AVAILABLE');
          if (statusElement && statusElement.textContent.includes('AVAILABLE')) {
            console.log(`✅ Found available date: ${dateString}`);
            return cell;
          }
        }
      }

      await this.sleep(100); // Check every 100ms
    }
    
    console.log(`❌ Date "${dateString}" not found or not available after 45 seconds`);
    return null; // Date not found within timeout
  }

  async waitForPassengerPage() {
    this.showStatus('⏳ Waiting for passenger page...');
    const maxWait = 45000;
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWait) {
      if (window.location.href.includes('psgninput') || 
          document.querySelector('input[placeholder*="Name"]')) {
        console.log('✅ Reached passenger page');
        await this.sleep(500);
        await this.fillPassengerDetails();
        return;
      }
      await this.sleep(100);
    }
    
    this.showStatus('Passenger page timeout');
  }

  async waitForCaptchaPage() {
    this.showStatus('⏳ Waiting for captcha page...');
    const maxWait = 45000; // 45 seconds
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWait) {
      const currentUrl = window.location.href;
      
      if (currentUrl.includes('reviewBooking')) {
        console.log('✅ Reached captcha/review booking page');
        await this.sleep(500);
        
        // Click on the captcha text field to focus it
        const captchaInput = document.querySelector('input[id*="captcha" i]');

        if (captchaInput) {
          await this.clickElement(captchaInput);
          console.log('✅ Clicked on captcha text field');
        }
        
        this.showStatus('✅ Please solve captcha manually and click "Continue"! <br>Now the control is with you! 🚀');
        return;
      }
      
      await this.sleep(100);
    }
    
    this.showStatus('Captcha page timeout - please check manually');
  }

  async fillPassengerDetails() {
    this.showStatus('Filling passenger details...', true);
    
    try {
      await this.sleep(1000);
      
      for (let i = 0; i < this.config.passengers.length; i++) {
        const passenger = this.config.passengers[i];
        console.log(`👤 Filling passenger ${i + 1}: ${passenger.name}`);
        
        if (i === 0) {
          await this.fillFirstPassenger(passenger);
        } else {
          await this.addAndFillPassenger(passenger, i);
        }
      }

      // Fill mobile number
      const mobileInput = await this.findElement('#mobileNumber');
      if (mobileInput && this.config.contact.mobile) {
        await this.fillInput(mobileInput, this.config.contact.mobile);
      }

      // Select payment mode
      await this.selectPaymentMode();
      
      // Click Continue
      const continueButton = await this.findElement('button.train_Search');
      if (continueButton) {
        this.showStatus('Proceeding to captcha...', true);
        await this.clickElement(continueButton);
        await this.waitForCaptchaPage();
      }
    } catch (error) {
      console.error('❌ Passenger details error:', error);
      this.showStatus(`Passenger error: ${error.message}`);
    }
  }

  async fillFirstPassenger(passenger) {
    console.log('👤 Filling first passenger details');
    await this.sleep(100);
    
    // Fill name
    const nameInput = document.querySelector('input[placeholder*="Name"]');
    if (nameInput) {
      await this.fillInput(nameInput, passenger.name);
    }

    // Fill age
    const ageInput = document.querySelector('input[type="number"]');
    if (ageInput) {
      await this.fillInput(ageInput, passenger.age.toString());
    }

    // Select gender
    const genderSelect = document.querySelectorAll('select')[0];
    if (genderSelect) {
      await this.selectOption(genderSelect, passenger.gender);
    }

    // Select country
    const countrySelect = document.querySelectorAll('select')[1];
    if (countrySelect) {
      await this.selectOption(countrySelect, passenger.country || 'IN');
    }

    // Select berth
    const berthSelect = document.querySelectorAll('select')[2];
    if (berthSelect) {
      await this.selectOption(berthSelect, passenger.berth || 'No preference');
    }

    // Check if catering service option is available and store the result
    const cateringSelect = document.querySelectorAll('select')[3];
    this.hasCatering = cateringSelect !== undefined && cateringSelect !== null;
    
    if (this.hasCatering) {
      await this.selectOption(cateringSelect, passenger.catering || 'Veg');
    }
  }

  async addAndFillPassenger(passenger, index) {
    console.log(`👤 Adding passenger ${index + 1}`);
    
    // Click add passenger button
    const addButton = await this.findElement('span:contains("Add Passenger")');
    if (addButton) {
      await this.clickElement(addButton);
      await this.sleep(500);
    }

    // Fill name
    const nameInput = document.querySelectorAll('input[placeholder*="Name"]')[index];
    if (nameInput) {
      await this.fillInput(nameInput, passenger.name);
    }

    // Fill age
    const ageInput = document.querySelectorAll('input[type="number"]')[index];
    if (ageInput) {
      await this.fillInput(ageInput, passenger.age.toString());
    }

    // Use catering availability detected in fillFirstPassenger
    const selectsPerPassenger = this.hasCatering ? 4 : 3;
    
    // Select gender
    const genderSelect = document.querySelectorAll('select')[selectsPerPassenger * index];
    if (genderSelect) {
      await this.selectOption(genderSelect, passenger.gender);
    }

    // Select country
    const countrySelect = document.querySelectorAll('select')[selectsPerPassenger * index + 1];
    if (countrySelect) {
      await this.selectOption(countrySelect, passenger.country || 'IN');
    }

    // Select berth
    const berthSelect = document.querySelectorAll('select')[selectsPerPassenger * index + 2];
    if (berthSelect) {
      await this.selectOption(berthSelect, passenger.berth || 'No preference');
    }

    // Select catering service option (only if available)
    if (this.hasCatering) {
      const cateringSelect = document.querySelectorAll('select')[selectsPerPassenger * index + 3];
      if (cateringSelect) {
        await this.selectOption(cateringSelect, passenger.catering || 'Veg');
      }
    }
  }

  // Utility functions
  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async findElement(selector) {
    if (selector.includes(':contains(')) {
      const match = selector.match(/(.+):contains\("(.+)"\)/);
      if (match) {
        const [, baseSelector, text] = match;
        const elements = document.querySelectorAll(baseSelector);
        for (const el of elements) {
          if (el.textContent.includes(text)) return el;
        }
      }
      return null;
    }
    return document.querySelector(selector);
  }

  async findElements(selectors) {
    for (const selector of selectors) {
      const element = await this.findElement(selector);
      if (element) return [element];
    }
    return [];
  }

  async clickElement(element) {
    if (!element) return;
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await this.sleep(100);
    element.focus();
    element.click();
    await this.sleep(100);
  }

  async fillInput(element, text) {
    if (!element || !text) return;
    element.focus();
    element.value = '';
    element.value = text;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    await this.sleep(200);
  }

  async selectOption(selectElement, value) {
    if (!selectElement || !value) return;
    
    const option = Array.from(selectElement.options).find(opt => 
      opt.value === value || opt.text.includes(value)
    );
    
    if (option) {
      selectElement.value = option.value;
      selectElement.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  async selectDropdownOption() {
    await this.sleep(300);
    const dropdown = document.querySelector('#p-highlighted-option');
    if (dropdown) {
      await this.clickElement(dropdown);
    }
  }

  async selectDate() {
    await this.sleep(500);
    const targetDate = new Date(this.config.journey.date);
    const targetMonth = targetDate.getMonth();
    const targetYear = targetDate.getFullYear();
    const targetDay = targetDate.getDate();
    
    await this.navigateToCorrectMonth(targetMonth, targetYear);
    
    await this.sleep(300);
    const dateElements = document.querySelectorAll('.ui-datepicker-calendar td a');
    for (const el of dateElements) {
      if (el.textContent.trim() === targetDay.toString()) {
        await this.clickElement(el);
        break;
      }
    }
  }

  async navigateToCorrectMonth(targetMonth, targetYear) {
    const maxAttempts = 12;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      const monthElement = document.querySelector('.ui-datepicker-month');
      const yearElement = document.querySelector('.ui-datepicker-year');
      
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                         'July', 'August', 'September', 'October', 'November', 'December'];
      
      const currentMonth = monthNames.indexOf(monthElement.textContent.trim());
      const currentYear = yearElement ? parseInt(yearElement.textContent) : new Date().getFullYear();
      
      // Check if we're at the target month
      if (currentMonth === targetMonth && currentYear === targetYear) {
        break;
      }
      
      // Always go forward
      const nextButton = document.querySelector('.ui-datepicker-next');
      if (nextButton) {
        await this.clickElement(nextButton);
        await this.sleep(200);
      } else {
        break;
      }
      
      attempts++;
    }
  }

  async selectPaymentMode() {
    console.log('💳 Selecting payment mode...');
    
    try {
      await this.sleep(500);
      
      const paymentMode = this.config.journey.paymentMode || 'UPI'; // Default to UPI for lower fee
      
      if (paymentMode === 'UPI') {
        // Find the UPI/BHIM option label first
      const upiLabel = Array.from(document.querySelectorAll('label'))
        .find(el => el.textContent && (el.textContent.includes('BHIM') || el.textContent.includes('UPI')));

        if (upiLabel) {
          // Find the associated radio button
        const upiRadio = upiLabel.querySelector('input[type="radio"]');

        if (upiRadio && upiRadio.type === 'radio') {
          console.log('✅ Clicking UPI radio button');
          await this.clickElement(upiRadio);
        } else {
          console.log('❌ UPI radio button not found');
        }
      } else {
        console.log('❌ UPI payment option not found');
      }
      } else {
        // Find the Card/Net Banking option label first
        const cardLabel = Array.from(document.querySelectorAll('label'))
          .find(el => el.textContent && (el.textContent.includes('Credit') || el.textContent.includes('Debit') || el.textContent.includes('Net Banking')));

        if (cardLabel) {
          // Find the associated radio button
          const cardRadio = cardLabel.querySelector('input[type="radio"]');

          if (cardRadio && cardRadio.type === 'radio') {
            console.log('✅ Clicking Card/Net Banking radio button');
            await this.clickElement(cardRadio);
          } else {
            console.log('❌ Card radio button not found');
          }
        } else {
          console.log('❌ Card payment option not found');
        }
      }
      
      await this.sleep(300);
    } catch (error) {
      console.error('❌ Payment mode selection error:', error);
    }
  }
}

// Initialize
window.IRCTCAutomation = IRCTCAutomation;
window.irctcAutomationInstance = new IRCTCAutomation();

} // End conditional block
