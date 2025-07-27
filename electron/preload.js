const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (config) => ipcRenderer.invoke('save-config', config),
  showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),
  showErrorDialog: (title, content) => ipcRenderer.invoke('show-error-dialog', title, content),
  onConfigUpdate: (callback) => {
    ipcRenderer.on('config-updated', (event, config) => callback(config));
  },
  onRefreshData: (callback) => {
    ipcRenderer.on('refresh-data', () => callback());
  },
  removeAllListeners: (channel) => {
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