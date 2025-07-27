const { contextBridge, ipcRenderer, shell } = require('electron');

console.log('Preload script loading...');

// Test if contextBridge is available
if (!contextBridge) {
  console.error('contextBridge not available!');
}

try {
  contextBridge.exposeInMainWorld('electronAPI', {
    getConfig: () => {
      console.log('getConfig called from renderer');
      return ipcRenderer.invoke('get-config');
    },
    saveConfig: (config) => {
      console.log('saveConfig called from renderer with:', config);
      return ipcRenderer.invoke('save-config', config);
    },
    showMessageBox: (options) => {
      console.log('showMessageBox called from renderer');
      return ipcRenderer.invoke('show-message-box', options);
    },
    showErrorDialog: (title, content) => {
      console.log('showErrorDialog called from renderer');
      return ipcRenderer.invoke('show-error-dialog', title, content);
    },
    openExternal: (url) => {
      console.log('openExternal called with:', url);
      return shell.openExternal(url);
    },
    testConnection: () => {
      console.log('testConnection called from renderer');
      return ipcRenderer.invoke('test-connection');
    },
    onConfigUpdate: (callback) => {
      console.log('Setting up config-updated listener');
      ipcRenderer.on('config-updated', (event, config) => {
        console.log('Config update received:', config);
        callback(config);
      });
    },
    onRefreshData: (callback) => {
      console.log('Setting up refresh-data listener');
      ipcRenderer.on('refresh-data', () => {
        console.log('Refresh data event received');
        callback();
      });
    },
    removeAllListeners: (channel) => {
      console.log('Removing all listeners for channel:', channel);
      ipcRenderer.removeAllListeners(channel);
    }
  });

  // Also expose version info
  contextBridge.exposeInMainWorld('versions', {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
    app: () => '1.0.0'
  });

  console.log('Preload script loaded successfully');
  console.log('electronAPI exposed with methods:', Object.keys({
    getConfig: true,
    saveConfig: true,
    showMessageBox: true,
    showErrorDialog: true,
    openExternal: true,
    testConnection: true,
    onConfigUpdate: true,
    onRefreshData: true,
    removeAllListeners: true
  }));

} catch (error) {
  console.error('Error in preload script:', error);
}