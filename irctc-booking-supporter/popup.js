// Popup JavaScript for IRCTC Helper
class IRCTCHelper {
  constructor() {
    this.passengers = [];
    this.init();
  }
  
  init() {
    this.loadSavedData();
    this.bindEvents();
    this.renderPassengers();
    this.makeDraggable(); // Make popup draggable
    this.loadConfigurationList(); // Load saved configurations
    this.setDateRestrictions(); // Set date input restrictions
  }
  
  bindEvents() {
    document.getElementById('startBooking').addEventListener('click', () => this.startBooking());
    document.getElementById('addPassenger').addEventListener('click', () => this.addPassenger());
    document.getElementById('saveConfig').addEventListener('click', () => this.saveConfiguration());
    document.getElementById('loadConfig').addEventListener('click', () => this.loadConfiguration());
    document.getElementById('deleteConfig').addEventListener('click', () => this.deleteConfiguration());
  }

  makeDraggable() {
    const header = document.getElementById('popupHeader');
    const popup = document.body;
    let isDragging = false;
    let startX, startY, startLeft, startTop;

    header.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      
      // Get current position
      const rect = popup.getBoundingClientRect();
      startLeft = rect.left;
      startTop = rect.top;
      
      // Set popup to absolute positioning when dragging starts
      popup.style.position = 'absolute';
      popup.style.left = startLeft + 'px';
      popup.style.top = startTop + 'px';
      popup.style.margin = '0';
      
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      
      e.preventDefault();
    });

    function onMouseMove(e) {
      if (!isDragging) return;
      
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      const newLeft = Math.max(0, Math.min(window.innerWidth - popup.offsetWidth, startLeft + deltaX));
      const newTop = Math.max(0, Math.min(window.innerHeight - popup.offsetHeight, startTop + deltaY));
      
      popup.style.left = newLeft + 'px';
      popup.style.top = newTop + 'px';
    }

    function onMouseUp() {
      isDragging = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }
  }

  setDateRestrictions() {
    const travelDateInput = document.getElementById('travelDate');
    if (travelDateInput) {
      const today = new Date();
      const maxDate = new Date();
      maxDate.setDate(today.getDate() + 62);
      
      const todayString = today.toISOString().split('T')[0];
      
      // Set minimum date to today
      travelDateInput.min = todayString;
      // Set maximum date to 62 days from today
      travelDateInput.max = maxDate.toISOString().split('T')[0];
      // Set default value to today
      travelDateInput.value = todayString;
    }
  }
  
  addPassenger(data = null) {
    const passenger = data || {
      name: '',
      age: '',
      gender: 'M',
      berth: 'No preference',
      country: 'IN',
      catering: 'Veg'
    };
    
    this.passengers.push(passenger);
    this.renderPassengers();
  }
  
  removePassenger(index) {
    this.passengers.splice(index, 1);
    this.renderPassengers();
  }
  
  renderPassengers() {
    const container = document.getElementById('passengerList');
    container.innerHTML = '';
    
    this.passengers.forEach((passenger, index) => {
      const passengerDiv = document.createElement('div');
      passengerDiv.className = 'passenger-item';
      passengerDiv.innerHTML = `
        <div class="passenger-header">
          <span class="passenger-number">Passenger ${index + 1}</span>
          <button class="remove-passenger" data-index="${index}">✕</button>
        </div>
        <div class="form-group">
          <label>Full Name <span style="color: white; font-weight: bold;">*</span></label>
          <input type="text" value="${passenger.name}" placeholder="As per ID proof" 
                 data-index="${index}" data-field="name">
        </div>
        <div class="row">
          <div class="form-group">
            <label>Age <span style="color: white; font-weight: bold;">*</span></label>
            <input type="number" value="${passenger.age}" placeholder="Age" min="1" max="120"
                   data-index="${index}" data-field="age">
          </div>
          <div class="form-group">
            <label>Gender <span style="color: white; font-weight: bold;">*</span></label>
            <select data-index="${index}" data-field="gender">
              <option value="M" ${passenger.gender === 'M' ? 'selected' : ''}>Male</option>
              <option value="F" ${passenger.gender === 'F' ? 'selected' : ''}>Female</option>
              <option value="T" ${passenger.gender === 'T' ? 'selected' : ''}>Transgender</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Country</label>
          <select data-index="${index}" data-field="country">
            <option value="IN" ${(passenger.country || 'IN') === 'IN' ? 'selected' : ''}>India</option>
            <option value="US" ${passenger.country === 'US' ? 'selected' : ''}>United States</option>
            <option value="GB" ${passenger.country === 'GB' ? 'selected' : ''}>United Kingdom</option>
            <option value="CA" ${passenger.country === 'CA' ? 'selected' : ''}>Canada</option>
            <option value="AU" ${passenger.country === 'AU' ? 'selected' : ''}>Australia</option>
            <option value="OTHER" ${passenger.country === 'OTHER' ? 'selected' : ''}>Other</option>
          </select>
        </div>
        <div class="form-group">
          <label>Berth Preference</label>
          <select data-index="${index}" data-field="berth">
            <option value="No preference" ${passenger.berth === 'No preference' ? 'selected' : ''}>No preference</option>
            <option value="Lower" ${passenger.berth === 'Lower' ? 'selected' : ''}>Lower</option>
            <option value="Middle" ${passenger.berth === 'Middle' ? 'selected' : ''}>Middle</option>
            <option value="Upper" ${passenger.berth === 'Upper' ? 'selected' : ''}>Upper</option>
            <option value="Side Lower" ${passenger.berth === 'Side Lower' ? 'selected' : ''}>Side Lower</option>
            <option value="Side Upper" ${passenger.berth === 'Side Upper' ? 'selected' : ''}>Side Upper</option>
          </select>
        </div>
        <div class="form-group">
          <label>Catering Service</label>
          <select data-index="${index}" data-field="catering">
            <option value="Veg" ${(passenger.catering || 'Veg') === 'Veg' ? 'selected' : ''}>Veg</option>
            <option value="Non Veg" ${passenger.catering === 'Non Veg' ? 'selected' : ''}>Non Veg</option>
            <option value="Jain Meal" ${passenger.catering === 'Jain Meal' ? 'selected' : ''}>Jain Meal</option>
            <option value="Veg (Diabetic)" ${passenger.catering === 'Veg (Diabetic)' ? 'selected' : ''}>Veg (Diabetic)</option>
            <option value="Non Veg (Diabetic)" ${passenger.catering === 'Non Veg (Diabetic)' ? 'selected' : ''}>Non Veg (Diabetic)</option>
            <option value="No Food" ${passenger.catering === 'No Food' ? 'selected' : ''}>No Food</option>
          </select>
        </div>
      `;
      container.appendChild(passengerDiv);
      
      // Add event listeners for this passenger
      const removeBtn = passengerDiv.querySelector('.remove-passenger');
      removeBtn.addEventListener('click', () => this.removePassenger(index));
      
      // Add change listeners for input fields
      const inputs = passengerDiv.querySelectorAll('input, select');
      inputs.forEach(input => {
        input.addEventListener('change', (e) => {
          const index = parseInt(e.target.dataset.index);
          const field = e.target.dataset.field;
          if (field) {
            this.updatePassenger(index, field, e.target.value);
          }
        });
      });
    });
  }
  
  updatePassenger(index, field, value) {
    if (this.passengers[index]) {
      this.passengers[index][field] = value;
    }
  }

  showStatus(message, type = 'active') {
    const statusEl = document.getElementById('status');
    statusEl.textContent = message;
    statusEl.className = `status ${type}`;
    statusEl.style.display = 'block';
    
    // Scroll to the status message when showing errors
    if (type === 'error') {
      statusEl.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
      // Don't auto-hide error messages - keep them visible
      return;
    }
    
    if (type !== 'active') {
      statusEl.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
      setTimeout(() => {
        statusEl.style.display = 'none';
      }, 5000);
    }
  }
  
  async startBooking() {
    console.log("Starting booking...");

    const config = this.getBookingConfig();
    
    if (!this.validateConfig(config)) {
      // Error message is already shown by validateConfig
      return;
    }
    
    this.showStatus('Starting auto booking...', 'active');
    
    try {
      // Get active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Send config to content script
      await chrome.tabs.sendMessage(tab.id, {
        action: 'startBooking',
        config: config
      });
      
      this.showStatus('Smart booking started! 🚀', 'active');
      
      // Close the popup window after starting booking
      setTimeout(() => {
        window.close();
      }, 1000);
      
    } catch (error) {
      console.error('Error starting booking:', error);
      this.showStatus('Error: Make sure you\'re on IRCTC site', 'error');
    }
  }
  
  getBookingConfig() {
    return {
      journey: {
        from: document.getElementById('fromStation').value,
        to: document.getElementById('toStation').value,
        date: document.getElementById('travelDate').value,
        class: document.getElementById('travelClass').value,
        trainPreference: document.getElementById('trainPreference').value.toUpperCase(),
        paymentMode: document.getElementById('paymentMode').value
      },
      contact: {
        mobile: document.getElementById('mobileNumber').value
      },
      passengers: this.passengers,
      mode: document.getElementById('bookingMode').value
    };
  }
  
  validateConfig(config) {
    console.log("Validating config");
    
    // Check journey details
    if (!config.journey.from) {
      this.showStatus('❌ Please enter From Station', 'error');
      return false;
    }
    
    if (!config.journey.to) {
      this.showStatus('❌ Please enter To Station', 'error');
      return false;
    }
    
    if (!config.journey.date) {
      this.showStatus('❌ Please select Travel Date', 'error');
      return false;
    }
    
    if (!config.journey.trainPreference) {
      this.showStatus('❌ Please enter Preferred Train', 'error');
      return false;
    }
    
    // Check mobile number
    if (!config.contact.mobile) {
      this.showStatus('❌ Please enter Mobile Number', 'error');
      return false;
    }
    
    if (config.contact.mobile.length !== 10) {
      this.showStatus('❌ Mobile Number must be 10 digits', 'error');
      return false;
    }
    
    // Check passengers
    if (config.passengers.length === 0) {
      this.showStatus('❌ Please add at least one passenger', 'error');
      return false;
    }
    
    // Check each passenger
    for (let i = 0; i < config.passengers.length; i++) {
      const passenger = config.passengers[i];
      
      if (!passenger.name) {
        this.showStatus(`❌ Please enter name for Passenger ${i + 1}`, 'error');
        return false;
      }
      
      if (!passenger.age) {
        this.showStatus(`❌ Please enter age for Passenger ${i + 1}`, 'error');
        return false;
      }
      
      if (passenger.age < 1 || passenger.age > 120) {
        this.showStatus(`❌ Invalid age for Passenger ${i + 1}`, 'error');
        return false;
      }
    }
    
    return true;
  }
  
  async saveConfiguration() {
    const config = this.getBookingConfig();
    
    // Validate before saving
    if (!this.validateConfig(config)) {
      // Error message is already shown by validateConfig
      return;
    }

    const label = document.getElementById('configLabel').value.trim();
    if (!label) {
      this.showStatus('❌ Please enter a configuration label', 'error');
      return;
    }

    // Get existing configurations
    const result = await chrome.storage.local.get(['irctcConfigs']);
    const configs = result.irctcConfigs || {};
    
    // Add timestamp to config
    config.savedAt = new Date().toISOString();
    config.label = label;
    
    // Save with label as key
    configs[label] = config;
    
    await chrome.storage.local.set({ irctcConfigs: configs });
    
    // Clear the label input
    document.getElementById('configLabel').value = '';
    
    // Refresh the configuration list
    this.loadConfigurationList();

    this.showStatus(`Configuration "${label}" saved! 💾`, 'success');
  }

  async loadConfiguration() {
    const selectedLabel = document.getElementById('configSelector').value;
    if (!selectedLabel) {
      this.showStatus('❌ Please select a configuration to load', 'error');
      return;
    }

    const result = await chrome.storage.local.get(['irctcConfigs']);
    const configs = result.irctcConfigs || {};
    
    if (configs[selectedLabel]) {
      this.loadConfig(configs[selectedLabel]);
      this.showStatus(`Configuration "${selectedLabel}" loaded! 📂`, 'success');
    } else {
      this.showStatus('❌ Selected configuration not found', 'error');
    }
  }

  async deleteConfiguration() {
    const selectedLabel = document.getElementById('configSelector').value;
    if (!selectedLabel) {
      this.showStatus('❌ Please select a configuration to delete', 'error');
      return;
    }

    if (!confirm(`Are you sure you want to delete the configuration "${selectedLabel}"?`)) {
      return;
    }

    const result = await chrome.storage.local.get(['irctcConfigs']);
    const configs = result.irctcConfigs || {};
    
    if (configs[selectedLabel]) {
      delete configs[selectedLabel];
      await chrome.storage.local.set({ irctcConfigs: configs });
      
      // Refresh the configuration list
      this.loadConfigurationList();

      this.showStatus(`Configuration "${selectedLabel}" deleted!`, 'success');
    } else {
      this.showStatus('❌ Selected configuration not found', 'error');
    }
  }

  async loadConfigurationList() {
    const result = await chrome.storage.local.get(['irctcConfigs']);
    const configs = result.irctcConfigs || {};
    
    const selector = document.getElementById('configSelector');
    
    // Clear existing options
    selector.innerHTML = '<option value="">Select a saved configuration...</option>';
    
    // Add saved configurations
    Object.keys(configs).forEach(label => {
      const option = document.createElement('option');
      option.value = label;
      const config = configs[label];
      const savedDate = config.savedAt ? new Date(config.savedAt).toLocaleDateString() : '';
      option.textContent = `${label}${savedDate ? ` (${savedDate})` : ''}`;
      selector.appendChild(option);
    });
  }
  
  loadConfig(config) {
    // Load journey details
    document.getElementById('fromStation').value = config.journey.from || '';
    document.getElementById('toStation').value = config.journey.to || '';
    document.getElementById('travelDate').value = config.journey.date || '';
    document.getElementById('travelClass').value = config.journey.class || '3A';
    document.getElementById('trainPreference').value = config.journey.trainPreference || '';
    document.getElementById('paymentMode').value = config.journey.paymentMode || 'UPI';
    
    // Load booking mode
    document.getElementById('bookingMode').value = config.mode || 'tatkal';
    
    // Load contact details
    document.getElementById('mobileNumber').value = config.contact?.mobile || '';
    
    // Load passengers
    this.passengers = config.passengers || [];
    this.renderPassengers();
  }
  
  async loadSavedData() {
    // First check for old single config format for backward compatibility
    const oldResult = await chrome.storage.local.get(['irctcConfig']);
    if (oldResult.irctcConfig) {
      // Migrate old config to new format
      const configs = { 'Default Configuration': oldResult.irctcConfig };
      await chrome.storage.local.set({ irctcConfigs: configs });
      await chrome.storage.local.remove(['irctcConfig']); // Remove old format
      
      this.loadConfig(oldResult.irctcConfig);
      this.loadConfigurationList();
      return;
    }

    // Load from new format - load the first available configuration as default
    const result = await chrome.storage.local.get(['irctcConfigs']);
    const configs = result.irctcConfigs || {};
    const configKeys = Object.keys(configs);
    
    if (configKeys.length > 0) {
      // Load the most recently saved configuration
      let latestConfig = null;
      let latestDate = new Date(0);
      
      for (const key of configKeys) {
        const config = configs[key];
        const configDate = config.savedAt ? new Date(config.savedAt) : new Date(0);
        if (configDate > latestDate) {
          latestDate = configDate;
          latestConfig = config;
        }
      }
      
      if (latestConfig) {
        this.loadConfig(latestConfig);
      }
    }
  }
}

// Initialize when DOM is loaded
let helper;
document.addEventListener('DOMContentLoaded', () => {
  helper = new IRCTCHelper();
});