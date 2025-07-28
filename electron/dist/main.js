"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainWindow = void 0;
// electron/main.ts
const electron_1 = require("electron");
const path = __importStar(require("path"));
// Enhanced development detection
const isDev = process.env.NODE_ENV === 'development' ||
    process.env.ELECTRON_IS_DEV === 'true' ||
    !electron_1.app.isPackaged;
console.log('Development mode:', isDev);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('ELECTRON_IS_DEV:', process.env.ELECTRON_IS_DEV);
console.log('app.isPackaged:', electron_1.app.isPackaged);
const Store = require('electron-store');
const store = new Store({
    defaults: {
        windowBounds: {
            width: 1200,
            height: 800
        }
    }
});
let mainWindow;
exports.mainWindow = mainWindow;
function createWindow() {
    const bounds = store.get('windowBounds');
    // Create the browser window
    exports.mainWindow = mainWindow = new electron_1.BrowserWindow({
        width: bounds.width,
        height: bounds.height,
        x: bounds.x,
        y: bounds.y,
        minWidth: 1000,
        minHeight: 700,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
            // Add additional security options
            allowRunningInsecureContent: false,
            experimentalFeatures: false
        },
        // Temporarily comment out icon to avoid path issues
        // icon: path.join(__dirname, 'assets', 'icon.png'),
        title: 'Slovenian Football Hub',
        titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
        show: false
    });
    // Fixed URL loading logic
    let startUrl;
    if (isDev) {
        // In development, always connect to React dev server
        startUrl = 'http://localhost:3000';
        console.log('Development mode: Loading from React dev server');
    }
    else {
        // In production, load from built files
        startUrl = `file://${path.join(__dirname, '..', 'build', 'index.html')}`;
        console.log('Production mode: Loading from built files');
    }
    console.log('Loading URL:', startUrl);
    console.log('Preload script path:', path.join(__dirname, 'preload.js'));
    mainWindow.loadURL(startUrl);
    // Show window when ready to prevent visual flash
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        if (isDev) {
            // Force open DevTools in development
            mainWindow.webContents.openDevTools();
            console.log('DevTools should be opening...');
        }
    });
    // Enhanced error handling for URL loading
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
        console.error('Failed to load URL:', validatedURL);
        console.error('Error code:', errorCode);
        console.error('Error description:', errorDescription);
        if (isDev) {
            // If dev server isn't ready, retry after a delay
            console.log('Retrying connection to React dev server in 2 seconds...');
            setTimeout(() => {
                mainWindow.loadURL('http://localhost:3000');
            }, 2000);
        }
    });
    // Log when page finishes loading
    mainWindow.webContents.on('did-finish-load', () => {
        console.log('Page loaded successfully!');
        // Test if preload script worked
        mainWindow.webContents.executeJavaScript(`
      console.log('Testing electronAPI availability:', !!window.electronAPI);
      if (window.electronAPI) {
        console.log('electronAPI methods:', Object.keys(window.electronAPI));
      } else {
        console.error('electronAPI not available - preload script failed');
      }
    `);
    });
    // Save window bounds on close
    mainWindow.on('close', () => {
        const bounds = mainWindow.getBounds();
        store.set('windowBounds', bounds);
    });
    // Handle window closed
    mainWindow.on('closed', () => {
        exports.mainWindow = mainWindow = null;
    });
    // Create application menu
    createMenu();
}
function createMenu() {
    const template = [
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
                        electron_1.dialog.showMessageBox(mainWindow, {
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
            label: electron_1.app.getName(),
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
        template[3].submenu.push({ type: 'separator' }, { role: 'front' });
    }
    const menu = electron_1.Menu.buildFromTemplate(template);
    electron_1.Menu.setApplicationMenu(menu);
}
async function showSettingsDialog() {
    // Get current config
    const currentConfig = store.store;
    const result = await electron_1.dialog.showMessageBox(mainWindow, {
        type: 'question',
        title: 'API Configuration',
        message: 'Configure your RapidAPI keys for football data',
        detail: `Current status:
- Football API Key: ${currentConfig.footballApiKey ? '✓ Set' : '✗ Not set'}
- News API Key: ${currentConfig.newsApiKey ? '✓ Set' : '✗ Not set'}

Choose an option:`,
        buttons: ['Set Football API Key', 'Set News API Key', 'View Current Keys', 'Cancel'],
        defaultId: 0,
        cancelId: 3
    });
    if (result.response === 3)
        return; // Cancel
    if (result.response === 2) {
        // View current keys
        showCurrentKeys();
        return;
    }
    const keyType = result.response === 0 ? 'footballApiKey' : 'newsApiKey';
    const keyName = result.response === 0 ? 'Football API Key' : 'News API Key';
    // Create a simple input dialog
    const inputWindow = new electron_1.BrowserWindow({
        width: 500,
        height: 350,
        parent: mainWindow,
        modal: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        title: `Enter ${keyName}`,
        resizable: false,
        minimizable: false,
        maximizable: false,
        show: false
    });
    const inputHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Enter ${keyName}</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      padding: 30px;
      margin: 0;
      background: #f5f5f5;
    }
    .container {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h2 {
      margin-top: 0;
      color: #333;
      text-align: center;
    }
    .info {
      background: #e1f5fe;
      padding: 15px;
      border-radius: 6px;
      margin-bottom: 20px;
      font-size: 14px;
      line-height: 1.4;
    }
    input {
      width: 100%;
      padding: 12px;
      border: 2px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
      box-sizing: border-box;
      margin-bottom: 20px;
    }
    input:focus {
      outline: none;
      border-color: #8b5cf6;
    }
    .buttons {
      display: flex;
      gap: 10px;
      justify-content: center;
    }
    button {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
    }
    .save-btn {
      background: #8b5cf6;
      color: white;
    }
    .save-btn:hover {
      background: #7c3aed;
    }
    .cancel-btn {
      background: #6b7280;
      color: white;
    }
    .cancel-btn:hover {
      background: #4b5563;
    }
    .current-value {
      font-size: 12px;
      color: #666;
      margin-bottom: 10px;
    }
    .toggle-btn {
      background: transparent;
      border: 1px solid #ddd;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      margin-left: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>🔑 ${keyName}</h2>
    
    <div class="info">
      <strong>How to get this key:</strong><br>
      1. Go to <strong>rapidapi.com</strong><br>
      2. Search for "${result.response === 0 ? 'API-Football' : 'Football API News'}"<br>
      3. Subscribe (free tier available)<br>
      4. Copy your API key and paste it below
    </div>
    
    ${currentConfig[keyType] ? `<div class="current-value">Current: ${currentConfig[keyType].substring(0, 8)}...</div>` : ''}
    
    <div style="display: flex; align-items: center;">
      <input type="password" id="apiKey" placeholder="Enter your ${keyName}" value="${currentConfig[keyType] || ''}" autofocus>
      <button class="toggle-btn" onclick="togglePassword()">Show</button>
    </div>
    
    <div class="buttons">
      <button class="cancel-btn" onclick="window.close()">Cancel</button>
      <button class="save-btn" onclick="saveKey()">Save Key</button>
    </div>
  </div>
  
  <script>
    const { ipcRenderer } = require('electron');
    
    function togglePassword() {
      const input = document.getElementById('apiKey');
      const btn = document.querySelector('.toggle-btn');
      if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = 'Hide';
      } else {
        input.type = 'password';
        btn.textContent = 'Show';
      }
    }
    
    function saveKey() {
      const apiKey = document.getElementById('apiKey').value.trim();
      
      if (!apiKey) {
        alert('Please enter an API key');
        return;
      }
      
      // Send the key to main process
      ipcRenderer.send('save-api-key', {
        keyType: '${keyType}',
        keyValue: apiKey
      });
      
      window.close();
    }
    
    // Handle Enter key
    document.getElementById('apiKey').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        saveKey();
      }
    });
    
    // Handle Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        window.close();
      }
    });
  </script>
</body>
</html>
`;
    inputWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(inputHtml)}`);
    inputWindow.once('ready-to-show', () => {
        inputWindow.show();
    });
}
function showCurrentKeys() {
    const currentConfig = store.store;
    electron_1.dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Current API Keys',
        message: 'API Keys Status',
        detail: `Football API Key: ${currentConfig.footballApiKey ?
            `Set (${currentConfig.footballApiKey.substring(0, 8)}...)` : 'Not set'}

News API Key: ${currentConfig.newsApiKey ?
            `Set (${currentConfig.newsApiKey.substring(0, 8)}...)` : 'Not set'}

To update a key, use File > Settings and select the key you want to change.`,
        buttons: ['OK']
    });
}
// IPC Handlers
electron_1.ipcMain.handle('get-config', () => {
    try {
        const config = store.store;
        console.log('get-config called, returning config');
        return config;
    }
    catch (error) {
        console.error('Error getting config:', error);
        return {};
    }
});
electron_1.ipcMain.handle('save-config', (event, config) => {
    try {
        console.log('save-config called via handle');
        if (!config || typeof config !== 'object') {
            console.error('Invalid config object received:', config);
            return false;
        }
        // Update store with new config
        Object.keys(config).forEach(key => {
            if (config[key] !== undefined && config[key] !== '') {
                store.set(key, config[key]);
            }
        });
        console.log('Config saved successfully via handle');
        // Notify renderer of config change
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('config-updated', store.store);
            console.log('Config update notification sent to main window');
        }
        return true;
    }
    catch (error) {
        console.error('Error in save-config handler:', error);
        return false;
    }
});
// Simple API key saving (for the new settings dialog)
electron_1.ipcMain.on('save-api-key', (event, data) => {
    try {
        console.log('Saving API key:', data.keyType);
        if (!data.keyType || !data.keyValue) {
            console.error('Invalid key data received');
            electron_1.dialog.showErrorBox('Error', 'Invalid key data received');
            return;
        }
        // Save the key
        store.set(data.keyType, data.keyValue);
        console.log('API key saved successfully');
        // Show success message
        electron_1.dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'Success',
            message: 'API Key Saved',
            detail: `Your ${data.keyType === 'footballApiKey' ? 'Football API' : 'News API'} key has been saved successfully.`,
            buttons: ['OK']
        });
        // Notify main window of config change
        if (mainWindow && !mainWindow.isDestroyed()) {
            const updatedConfig = store.store;
            mainWindow.webContents.send('config-updated', updatedConfig);
            console.log('Config update notification sent to main window after API key save');
        }
    }
    catch (error) {
        console.error('Error saving API key:', error);
        electron_1.dialog.showErrorBox('Error', 'Failed to save API key. Please try again.');
    }
});
// Test connection handler
electron_1.ipcMain.handle('test-connection', () => {
    console.log('test-connection called - IPC is working!');
    return {
        success: true,
        timestamp: Date.now(),
        message: 'IPC connection successful'
    };
});
electron_1.ipcMain.handle('show-message-box', async (event, options) => {
    try {
        const result = await electron_1.dialog.showMessageBox(mainWindow, options);
        return result;
    }
    catch (error) {
        console.error('Error showing message box:', error);
        return { response: 0 };
    }
});
electron_1.ipcMain.handle('show-error-dialog', async (event, title, content) => {
    try {
        await electron_1.dialog.showErrorBox(title, content);
    }
    catch (error) {
        console.error('Error showing error dialog:', error);
    }
});
// App event handlers
electron_1.app.whenReady().then(() => {
    createWindow();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
// Security: Prevent new-window navigation
electron_1.app.on('web-contents-created', (event, contents) => {
    contents.setWindowOpenHandler(({ url }) => {
        return { action: 'deny' };
    });
    contents.on('will-navigate', (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);
        if (isDev && parsedUrl.origin === 'http://localhost:3000') {
            return;
        }
        event.preventDefault();
    });
});
// Handle certificate errors
electron_1.app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
    if (isDev) {
        event.preventDefault();
        callback(true);
    }
    else {
        callback(false);
    }
});
