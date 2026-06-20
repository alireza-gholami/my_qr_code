// Zentrale State-Verwaltung für hohe Erweiterbarkeit
const APP_STATE = {
  // Standardeinstellungen
  settings: {
    number: "65432",
    userName: "Max Mustermann",
    colleagueName: "Sabine Musterfrau",
    qrCodeData: null // Base64-String des hochgeladenen QR-Codes (JPG)
  },

  // Schlüssel für LocalStorage
  STORAGE_KEY: "HNV_PWA_STATE",

  // Initialisierung der App-Daten
  init() {
    this.loadFromStorage();
    this.updateUI();
    this.startLiveClock();
    this.setupEventListeners();
    this.registerServiceWorker();
  },

  // Daten aus dem LocalStorage laden
  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Zusammenführen, um Abwärtskompatibilität bei Erweiterungen sicherzustellen
        this.settings = { ...this.settings, ...parsed };
      }
    } catch (e) {
      console.error("Fehler beim Laden aus LocalStorage", e);
    }
  },

  // Daten im LocalStorage speichern
  saveToStorage() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.settings));
    } catch (e) {
      console.error("Fehler beim Speichern in LocalStorage", e);
    }
  },

  // Die UI mit den aktuellen Daten befüllen
  updateUI() {
    document.getElementById("displayNumber").textContent = this.settings.number;
    document.getElementById("displayUserName").textContent = this.settings.userName;
    document.getElementById("displayColleagueName").textContent = this.settings.colleagueName;

    // QR-Code aktualisieren (entweder der hochgeladene oder das Standard-Bild)
    const qrImgElement = document.getElementById("displayQR");
    if (this.settings.qrCodeData) {
      qrImgElement.src = this.settings.qrCodeData;
    } else {
      qrImgElement.src = "data/QR_deWP.svg.png";
    }
  },

  // Startet die sekundengenaue Live-Uhr im Format "01.01.2026 07:05"
  startLiveClock() {
    const clockElement = document.getElementById("displayDate");
    
    const updateClock = () => {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      
      clockElement.textContent = `${day}.${month}.${year} ${hours}:${minutes}`;
    };

    updateClock(); // Sofort einmal ausführen
    setInterval(updateClock, 1000); // Jede Sekunde aktualisieren
  },

  // Event Listener einrichten
  setupEventListeners() {
    const modal = document.getElementById("settingsModal");
    const menuBtn = document.getElementById("menuBtn");
    const closeBtn = document.getElementById("closeModalBtn");
    const cancelBtn = document.getElementById("cancelBtn");
    const settingsForm = document.getElementById("settingsForm");
    const qrUploadInput = document.getElementById("qrUpload");
    const fileStatus = document.getElementById("fileStatus");
    const backBtn = document.getElementById("backBtn");

    // Modal öffnen
    menuBtn.addEventListener("click", () => {
      // Inputs mit aktuellen Werten füllen
      document.getElementById("inputNumber").value = this.settings.number;
      document.getElementById("inputUserName").value = this.settings.userName;
      document.getElementById("inputColleagueName").value = this.settings.colleagueName;
      fileStatus.textContent = this.settings.qrCodeData ? "Aktueller QR-Code ist gespeichert" : "Keine neue Datei ausgewählt";
      
      modal.classList.add("active");
    });

    // Modal schließen (Hilfsfunktion)
    const closeModal = () => {
      modal.classList.remove("active");
      settingsForm.reset();
    };

    closeBtn.addEventListener("click", closeModal);
    cancelBtn.addEventListener("click", closeModal);

    // Schließen bei Klick außerhalb des Modals
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    // Dateiupload-Handler (nur JPG/JPEG erlauben)
    let tempQrData = null;
    qrUploadInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.type === "image/jpeg" || file.type === "image/jpg") {
          const reader = new FileReader();
          reader.onload = (event) => {
            tempQrData = event.target.result;
            fileStatus.textContent = `Erfolgreich geladen: ${file.name}`;
            fileStatus.style.color = "#30d158"; // iOS Grün
          };
          reader.readAsDataURL(file);
        } else {
          fileStatus.textContent = "Fehler: Nur JPG/JPEG-Dateien sind erlaubt!";
          fileStatus.style.color = "#ff453a"; // iOS Rot
          qrUploadInput.value = ""; // Input zurücksetzen
          tempQrData = null;
        }
      }
    });

    // Formular abschicken / Einstellungen speichern
    settingsForm.addEventListener("submit", (e) => {
      e.preventDefault();

      // Werte auslesen und im State speichern
      this.settings.number = document.getElementById("inputNumber").value.trim() || this.settings.number;
      this.settings.userName = document.getElementById("inputUserName").value.trim() || this.settings.userName;
      this.settings.colleagueName = document.getElementById("inputColleagueName").value.trim() || this.settings.colleagueName;
      
      if (tempQrData) {
        this.settings.qrCodeData = tempQrData;
        tempQrData = null;
      }

      this.saveToStorage();
      this.updateUI();
      closeModal();
    });

    // Zurück-Button Logik (Pfeil nach links)
    backBtn.addEventListener("click", () => {
      // Wenn es Verlauf gibt, gehen wir zurück, ansonsten dezent visualisieren
      if (window.history.length > 1) {
        window.history.back();
      } else {
        // Optionale visuelle Rückmeldung (Pfeil blinkt kurz auf)
        backBtn.style.opacity = "0.5";
        setTimeout(() => backBtn.style.opacity = "1", 200);
      }
    });
  },

  // Service Worker für Offline-Nutzung registrieren
  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
          .then(reg => console.log('Service Worker erfolgreich registriert', reg.scope))
          .catch(err => console.error('Service Worker Registrierung fehlgeschlagen', err));
      });
    }
  }
};

// Start der App bei Seitenaufbau
document.addEventListener("DOMContentLoaded", () => {
  APP_STATE.init();
});
