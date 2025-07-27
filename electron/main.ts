// electron/main.ts
import { app, BrowserWindow, Menu, ipcMain, dialog } from 'electron';
import * as path from 'path';
const isDev = process.env.NODE_ENV === 'development' || process.env.ELECTRON_IS_DEV === 'true';
const Store = require('electron-store');

// Configuration store for API keys and settings
interface AppConfig {
  footballApiKey?: string;
  newsApiKey?: string;
  windowBounds?: {
    width: number;
    height: number;
    x?: number;
    y?: number;
  };
  theme?: 'light' | 'dark';
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const store = new Store({
  defaults: {
    windowBounds: {
      width: 1200,
      height: 800
    }
  }
});
let mainWindow: BrowserWindow;

function createWindow(): void {
  const bounds = store.get('windowBounds');

  // Create the browser window
  mainWindow = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    x: bounds.x,
    y: bounds.y,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload.js')
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    title: 'Slovenian Football Hub',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    show: false // Don't show until ready
  });

  // Load the app
  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../build/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Focus window on creation
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Save window bounds on close
  mainWindow.on('close', () => {
    const bounds = mainWindow.getBounds();
    store.set('windowBounds', bounds);
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null as any;
  });

  // Create application menu
  createMenu();
}

function createMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            showSettingsDialog();
          }
        },
        {
          label: 'Refresh',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.webContents.send('refresh-data');
          }
        },
        { type: 'separator' },
        {
          role: 'quit'
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Slovenian Football Hub',
              message: 'Slovenian Football Hub',
              detail: 'A comprehensive desktop application for Slovenian football fans.\n\nVersion: 1.0.0\nBuilt with Electron & React'
            });
          }
        }
      ]
    }
  ];

  // macOS specific menu adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });

    // Window menu
    (template[3].submenu as Electron.MenuItemConstructorOptions[]).push(
      { type: 'separator' },
      { role: 'front' }
    );
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

async function showSettingsDialog(): Promise<void> {
  const settingsWindow = new BrowserWindow({
    width: 500,
    height: 400,
    parent: mainWindow,
    modal: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload.js')
    },
    title: 'Settings',
    resizable: false,
    minimizable: false,
    maximizable: false
  });

  // Load settings page or create inline settings
  // In the showSettingsDialog function, update the HTML:
const settingsHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Settings</title>
  <style>
    /* ... existing styles ... */
    .help-text {
      font-size: 11px;
      color: #666;
      margin-top: 3px;
    }
  </style>
</head>
<body>
  <h2>API Configuration</h2>
  <p style="color: #666; font-size: 14px;">Enter your RapidAPI keys to access live football data:</p>
  
  <form id="settings-form">
    <div class="form-group">
      <label for="football-api-key">API-Football Key (RapidAPI):</label>
      <input type="password" id="football-api-key" placeholder="Enter your API-Football key">
      <div class="help-text">For fixtures, standings, player stats, transfers</div>
    </div>
    
    <div class="form-group">
      <label for="news-api-key">Football API News Key (RapidAPI):</label>
      <input type="password" id="news-api-key" placeholder="Enter your Football API News key">
      <div class="help-text">For current football news and updates</div>
    </div>
    
    <div class="form-group">
      <button type="submit">Save Settings</button>
      <button type="button" class="button-secondary" onclick="window.close()">Cancel</button>
    </div>
  </form>
  <!-- ... rest of script remains the same ... -->
</body>
</html>
`;

  settingsWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(settingsHtml)}`);
}

// IPC handlers
ipcMain.handle('get-config', () => {
  return store.store;
});

ipcMain.handle('save-config', (event, config: Partial<AppConfig>) => {
  // Update store with new config
  Object.keys(config).forEach(key => {
    store.set(key as keyof AppConfig, (config as any)[key]);
  });
  
  // Notify renderer of config change
  mainWindow.webContents.send('config-updated', store.store);
  
  return true;
});

ipcMain.handle('show-message-box', async (event, options) => {
  const result = await dialog.showMessageBox(mainWindow, options);
  return result;
});

ipcMain.handle('show-error-dialog', async (event, title: string, content: string) => {
  await dialog.showErrorBox(title, content);
});

// App event handlers
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // On macOS, re-create window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // On macOS, keep app running even when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: Prevent new-window navigation
app.on('web-contents-created', (event, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    return { action: 'deny' };
  });

  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    // Allow navigation only to localhost in development
    if (isDev && parsedUrl.origin === 'http://localhost:3000') {
      return;
    }
    
    // Prevent navigation to external URLs
    event.preventDefault();
  });
});

// Handle certificate errors
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  if (isDev) {
    // In development, ignore certificate errors
    event.preventDefault();
    callback(true);
  } else {
    // In production, use default behavior
    callback(false);
  }
});

// Auto-updater (placeholder for future implementation)
if (!isDev) {
  // Here you would integrate with electron-updater
  // autoUpdater.checkForUpdatesAndNotify();
}

export { mainWindow };