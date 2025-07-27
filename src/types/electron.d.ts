export interface ElectronAPI {
  getConfig: () => Promise<any>;
  saveConfig: (config: any) => Promise<boolean>;
  showMessageBox: (options: any) => Promise<any>;
  showErrorDialog: (title: string, content: string) => Promise<void>;
  openExternal: (url: string) => Promise<void>;
  onConfigUpdate: (callback: (config: any) => void) => void;
  onRefreshData: (callback: () => void) => void;
  removeAllListeners: (channel: string) => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
    versions?: {
      node: () => string;
      chrome: () => string;
      electron: () => string;
      app: () => string;
    };
  }
}

export {};