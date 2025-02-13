'use strict'

import { app, protocol, BrowserWindow, Menu} from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
import { ipcMain, dialog } from 'electron';
import fs from 'fs'; // Import the filesystem module
import path from 'path';
import * as XLSX from 'xlsx';

const isDevelopment = process.env.NODE_ENV !== 'production'

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])


async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      devTools: true,
      preload: __dirname + '/preload.js', // Preload script for secure IPC communication
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
 
  return win;
}

// Export to excel function
function exportToExcel(flightData) {
  try {
    const headers = [
      'Callsign', 'ACType', 'Stand', 'EOBT', 'WP', 'RWY', 'TOBT', 'ETOT',
      'TTOT', 'CTOT', 'ATOT', 'EXOT', 'TSAT', 'ARDT', 'AOBT', 'Differ'
    ];

    const data = flightData.map(flight => ({
      Callsign: flight.AircraftId || '',
      ACType: flight.Type || '',
      Stand: flight.DepartureGate || '',
      EOBT: flight.EOBTSTR || '',
      WP: flight.Waypoint || '',
      RWY: flight.DepartureRunway || '',
      TOBT: flight.AirlineOffBlockTimeSTR || '',
      ETOT: flight.ETOTSTR || '',
      TTOT: flight.STOTSTR || '',
      CTOT: flight.CTOTSTR || '',
      ATOT: flight.ATOTSTR || '',
      EXOT: flight.EXOTSTR || '',
      TSAT: flight.TSATSTR || '',
      ARDT: flight.ARDTSTR || '',
      AOBT: flight.iFIMSAOBTSTR || '',
      Differ: calculateTimeDifference(flight.TSATSTR, flight.AirlineOffBlockTimeSTR)
    }));

    const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Flights');

    // Ask the user where to save the file
    const filePath = dialog.showSaveDialogSync({
      title: 'Save Excel File',
      defaultPath: path.join(app.getPath('documents'), 'FlightData.xlsx'),
      filters: [{ name: 'Excel Files', extensions: ['xlsx'] }]
    });

    if (filePath) {
      // Use `fs.writeFileSync` instead of XLSX.writeFile for better file handling
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
      fs.writeFileSync(filePath, excelBuffer);
      dialog.showMessageBoxSync({
        type: 'info',
        title: 'Export Successful',
        message: `Excel file saved successfully at ${filePath}`
      });
    }
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    dialog.showMessageBoxSync({
      type: 'error',
      title: 'Export Failed',
      message: 'An error occurred while exporting to Excel.'
    });
  }
}

// 📌 Function to save flight data as a text file
function saveFlightDataToTxt(flightData) {
  const parsedData = JSON.parse(flightData);
  if (!parsedData || parsedData.length === 0) {
    console.warn('No flight data to save.');
    return;
  }

  const atcoheaders = [
    'Callsign', 'ACType', 'Stand', 'EOBT', 'WP', 'RWY', 'TOBT', 'ETOT',
    'TTOT', 'CTOT', 'ATOT', 'EXOT', 'TSAT', 'ARDT', 'AOBT', 'Differ'
  ];

  const airlineheaders = ['Arrival','Reg','Type','From','A/ELDT','A/EIBT','Departure','To',
    'EOBT','Parking Stand','TOBT','TSAT','ARDT','AOBT','CTOT','ATOT'
  ];

  //const filePath = path.join(app.getPath('documents'), 'FlightData.txt');
  const atcofilePath = "C:/iDEPdata/iDEPatco.txt";
  const airlinefilePath = "C:/iDEPdata/iDEPairline.txt";
  // Prepare text content
  let atcoContent = atcoheaders.join('\t') + '\n'; // Header row
  parsedData.forEach(flight => {
    const row = [
      flight.AircraftId + '\t' || '',
      flight.Type || '',
      flight.DepartureGate || '',
      flight.EOBTSTR || '',
      flight.Waypoint || '',
      flight.DepartureRunway || '',
      flight.AirlineOffBlockTimeSTR || '',
      flight.ETOTSTR || '',
      flight.STOTSTR || '',
      flight.CTOTSTR || '',
      flight.ATOTSTR || '',
      flight.EXOTSTR || '',
      flight.TSATSTR || '',
      flight.ARDTSTR || '',
      flight.iFIMSAOBTSTR || '',
      calculateTimeDifference(flight.TSATSTR, flight.AirlineOffBlockTimeSTR)
    ].join('\t');
    
    atcoContent += row + '\n';
  });

  let airlineContent = airlineheaders.join('\t') + '\n'; // Header row
  parsedData.forEach(flight => {
    const row = [
      flight.PreviousCallsign || '',
      flight.REG || '',
      flight.Type || '',
      flight.PreviousDeparture || '',
      flight.PreviousELDT || '',
      flight.AIBTSTR || '',
      flight.AircraftId + '\t' || '',
      flight.Destination || '',
      flight.EOBTSTR || '',
      flight.DepartureGate + '\t' || '',
      flight.AirlineOffBlockTimeSTR || '',
      flight.TSATSTR || '',
      flight.ARDTSTR || '',
      flight.iFIMSAOBTSTR || '',
      flight.CTOTSTR || '',
      flight.ATOTSTR || ''
    ].join('\t');
    
    airlineContent += row + '\n';
  });

  // Write the file (Auto replace old file)
  fs.writeFileSync(atcofilePath, atcoContent, 'utf-8');
  console.log(`Flight data saved to ${atcofilePath}`);

  fs.writeFileSync(airlinefilePath, airlineContent, 'utf-8');
  console.log(`Flight data saved to ${airlinefilePath}`);
}


function calculateTimeDifference(tsat, tobt) {
  if (!tsat || !tobt) return '';

  // Ensure inputs are exactly 4-digit numbers (HHMM format)
  const timeRegex = /^\d{4}$/;
  if (!timeRegex.test(tsat) || !timeRegex.test(tobt)) {
    console.warn(`Invalid time format detected: TSAT=${tsat}, TOBT=${tobt}`);
    return '';  // Return empty string if format is incorrect
  }

  // Convert HHMM string to Date object (using today's date)
  const now = new Date();
  const tsatDate = new Date(now);
  tsatDate.setHours(parseInt(tsat.substring(0, 2)), parseInt(tsat.substring(2, 4)), 0, 0);
  
  const tobtDate = new Date(now);
  tobtDate.setHours(parseInt(tobt.substring(0, 2)), parseInt(tobt.substring(2, 4)), 0, 0);

  // Calculate difference in minutes
  let diff = (tsatDate - tobtDate) / (1000 * 60);

  // Handle crossing midnight scenario (e.g., TSAT = 0020 and TOBT = 2355)
  if (diff > 720) {  // More than 12 hours means next day
    diff -= 1440;
  } else if (diff < -720) {  // More than -12 hours means previous day
    diff += 1440;
  }

  return isNaN(diff) ? '' : diff;  // Ensure no NaN values are returned
}



let mainWindow;

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (!mainWindow) mainWindow = createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  Menu.setApplicationMenu(createMenu());
  mainWindow = await createWindow();
})
// Create the application menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Save to Text File',
          click: () => {
            mainWindow.webContents.send('request-save-to-text');
          }
        },
        {
          label: 'Export to Excel',
          click: () => {
            mainWindow.webContents.send('request-flight-data');
          }
        },
        { role: 'quit' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forcereload' },
        { role: 'toggledevtools' } // Toggle DevTools menu item
      ]
    }
  ];

  return Menu.buildFromTemplate(template);
}

// IPC Handlers excel
ipcMain.handle('export-to-excel', async (event, flightData) => {
  try {
    if (!Array.isArray(flightData)) {
      console.error("Invalid flight data received:", flightData);
      return;
    }
    exportToExcel(flightData);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
  }
});

// IPC Handlers text
ipcMain.on('save-to-text', (event, flightData) => {
  try {
    saveFlightDataToTxt(flightData);
  } catch (error) {
    console.error('Error saving to text file:', error);
  }
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
