// Zentrale State-Verwaltung
const APP_STATE = {
  settings: { 
    number: "65432", 
    userName: "Max Mustermann", 
    ticketTitle: "Deutschland Ticket",
    validFrom: "01.06.2026 00:00",
    validUntil: "01.06.2026 03:00",
    qrCodeData: null, 
    logoSpeed: 2,
    logoRange: 130,
    qrSize: 255,
    logoSize: 40
  },
  STORAGE_KEY: "HNV_PWA_STATE",

  init() {
    this.loadFromStorage();
    this.updateUI();
    this.setupEventListeners();
  },

  loadFromStorage() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) this.settings = { ...this.settings, ...JSON.parse(stored) };
  },

  saveToStorage() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.settings));
  },

  updateUI() {
    document.getElementById("displayNumber").textContent = this.settings.number;
    document.getElementById("displayUserName").textContent = this.settings.userName;
    document.getElementById("displayTicketTitle").textContent = this.settings.ticketTitle;
    document.getElementById("validFrom").textContent = "Gültig von: " + this.settings.validFrom;
    document.getElementById("validUntil").textContent = "Gültig bis: " + this.settings.validUntil;
    
    const qrImg = document.getElementById("displayQR");
    if (this.settings.qrCodeData) qrImg.src = this.settings.qrCodeData;
    
    const logo = document.getElementById("floatingLogo");
    logo.style.animation = `sway ${3 / this.settings.logoSpeed}s linear infinite alternate`;
    
    document.documentElement.style.setProperty('--sway-range', `${this.settings.logoRange}px`);
    document.documentElement.style.setProperty('--qr-size', `${this.settings.qrSize}px`);
    document.documentElement.style.setProperty('--logo-height', `${this.settings.logoSize}px`);
  },

  setupEventListeners() {
    const modal = document.getElementById("settingsModal");
    document.getElementById("menuBtn").addEventListener("click", () => {
      document.getElementById("inputNumber").value = this.settings.number;
      document.getElementById("inputUserName").value = this.settings.userName;
      document.getElementById("inputTicketTitle").value = this.settings.ticketTitle;
      document.getElementById("speedRange").value = this.settings.logoSpeed;
      document.getElementById("rangeRange").value = this.settings.logoRange;
      document.getElementById("qrRange").value = this.settings.qrSize;
      document.getElementById("logoRange").value = this.settings.logoSize;
      modal.classList.add("active");
    });

    document.getElementById("settingsForm").addEventListener("submit", (e) => {
      e.preventDefault();
      this.settings.number = document.getElementById("inputNumber").value;
      this.settings.userName = document.getElementById("inputUserName").value;
      this.settings.ticketTitle = document.getElementById("inputTicketTitle").value;
      this.settings.logoSpeed = document.getElementById("speedRange").value;
      this.settings.logoRange = document.getElementById("rangeRange").value;
      this.settings.qrSize = document.getElementById("qrRange").value;
      this.settings.logoSize = document.getElementById("logoRange").value;
      
      const file = document.getElementById("qrUpload").files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          this.settings.qrCodeData = event.target.result;
          this.saveAndApply();
        };
        reader.readAsDataURL(file);
      } else {
        this.saveAndApply();
      }
    });
  },

  saveAndApply() {
    this.saveToStorage();
    this.updateUI();
    document.getElementById("settingsModal").classList.remove("active");
  }
};

document.addEventListener("DOMContentLoaded", () => APP_STATE.init());
