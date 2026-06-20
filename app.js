// Zentrale State-Verwaltung
const APP_STATE = {
  settings: { number: "65432", qrCodeData: null, logoSpeed: 2 },
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
    const qrImg = document.getElementById("displayQR");
    if (this.settings.qrCodeData) qrImg.src = this.settings.qrCodeData;
    
    // Geschwindigkeit auf Logo anwenden
    const logo = document.getElementById("floatingLogo");
    logo.style.animationDuration = `${3 / this.settings.logoSpeed}s`;
  },

  setupEventListeners() {
    const modal = document.getElementById("settingsModal");
    document.getElementById("menuBtn").addEventListener("click", () => {
      document.getElementById("inputNumber").value = this.settings.number;
      document.getElementById("speedRange").value = this.settings.logoSpeed;
      modal.classList.add("active");
    });

    document.getElementById("settingsForm").addEventListener("submit", (e) => {
      e.preventDefault();
      this.settings.number = document.getElementById("inputNumber").value;
      this.settings.logoSpeed = document.getElementById("speedRange").value;
      
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
