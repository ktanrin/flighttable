// In preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  exportToExcel: async (flightData) => {
    try {
      // ✅ Convert flightData to JSON first before sending via IPC
      const flightDataCopy = JSON.parse(JSON.stringify(flightData));
      await ipcRenderer.invoke('export-to-excel', flightDataCopy);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    }
  },
  saveToText: (flightData) => ipcRenderer.send('save-to-text', flightData),
  onRequestFlightData: (callback) => {
    ipcRenderer.on('request-flight-data', () => {
      callback();
    });
  },
  onRequestSaveToText: (callback) => ipcRenderer.on('request-save-to-text', () => callback()),
});
