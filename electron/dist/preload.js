const { contextBridge, ipcRenderer, shell } = require('electron');

console.log('Preload script starting...');

try {
  // Test if contextBridge is available
  if (!contextBridge) {
    throw new Error('contextBridge not available');
  }

  console.log('Exposing electronAPI to main world...');

  contextBridge.exposeInMainWorld('electronAPI', {
    // Config methods
    getConfig: () => {
      console.log('getConfig called from renderer');
      return ipcRenderer.invoke('get-config');
    },
    
    saveConfig: (config) => {
      console.log('saveConfig called from renderer with:', config);
      return ipcRenderer.invoke('save-config', config);
    },
    
    // Dialog methods
    showMessageBox: (options) => {
      console.log('showMessageBox called from renderer');
      return ipcRenderer.invoke('show-message-box', options);
    },
    
    showErrorDialog: (title, content) => {
      console.log('showErrorDialog called from renderer');
      return ipcRenderer.invoke('show-error-dialog', title, content);
    },
    
    // External links
    openExternal: (url) => {
      console.log('openExternal called with:', url);
      return shell.openExternal(url);
    },
    
    // Test connection
    testConnection: () => {
      console.log('testConnection called from renderer');
      return ipcRenderer.invoke('test-connection');
    },
    
    // Event listeners
    onConfigUpdate: (callback) => {
      console.log('Setting up config-updated listener');
      const listener = (event, config) => {
        console.log('Config update received in preload:', config);
        callback(config);
      };
      ipcRenderer.on('config-updated', listener);
      
      // Return cleanup function
      return () => {
        ipcRenderer.removeListener('config-updated', listener);
      };
    },
    
    onRefreshData: (callback) => {
      console.log('Setting up refresh-data listener');
      const listener = () => {
        console.log('Refresh data event received in preload');
        callback();
      };
      ipcRenderer.on('refresh-data', listener);
      
      // Return cleanup function
      return () => {
        ipcRenderer.removeListener('refresh-data', listener);
      };
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

  console.log('Preload script completed successfully');
  console.log('electronAPI exposed with methods:', [
    'getConfig', 'saveConfig', 'showMessageBox', 'showErrorDialog', 
    'openExternal', 'testConnection', 'onConfigUpdate', 'onRefreshData', 'removeAllListeners'
  ]);

} catch (error) {
  console.error('Error in preload script:', error);
  
  // Fallback: expose a dummy API to prevent errors
  try {
    if (typeof window !== 'undefined') {
      window.electronAPI = {
        getConfig: () => Promise.resolve({}),
        saveConfig: () => Promise.resolve(false),
        showMessageBox: () => Promise.resolve({ response: 0 }),
        showErrorDialog: () => Promise.resolve(),
        openExternal: () => Promise.resolve(),
        testConnection: () => Promise.resolve({ success: false }),
        onConfigUpdate: () => () => {},
        onRefreshData: () => () => {},
        removeAllListeners: () => {}
      };
      console.log('Fallback electronAPI created');
    }
  } catch (fallbackError) {
    console.error('Failed to create fallback API:', fallbackError);
  }
}

// Add a test function that can be called from main process
window.electronAPITest = () => {
  console.log('electronAPI test called');
  return !!window.electronAPI;
};