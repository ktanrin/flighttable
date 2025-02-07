// In preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  exportToExcel: async (flightData) => {
    try {
      await ipcRenderer.invoke('export-to-excel', flightData);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    }
  },
  onRequestFlightData: (callback) => {
    ipcRenderer.on('request-flight-data', () => {
      callback();
    });
  }
});
