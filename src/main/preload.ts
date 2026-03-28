import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  selectFolder: () => ipcRenderer.invoke('file:selectFolder'),
  scanFolder: (folderPath: string, options: any) => ipcRenderer.invoke('file:scanFolder', folderPath, options),
  moveToTrash: (filePath: string) => ipcRenderer.invoke('file:moveToTrash', filePath),
  openExternally: (filePath: string) => ipcRenderer.invoke('file:openExternally', filePath),

  // Preview operations
  generatePreview: (filePath: string, category: string) => ipcRenderer.invoke('preview:generate', filePath, category),
  clearPreviewCache: () => ipcRenderer.invoke('preview:clearCache'),

  // Database operations
  getRecentFolders: () => ipcRenderer.invoke('db:getRecentFolders'),
  addRecentFolder: (folder: any) => ipcRenderer.invoke('db:addRecentFolder', folder),
  saveSession: (session: any) => ipcRenderer.invoke('db:saveSession', session),
  getSessions: () => ipcRenderer.invoke('db:getSessions'),
  getSettings: () => ipcRenderer.invoke('db:getSettings'),
  saveSettings: (settings: any) => ipcRenderer.invoke('db:saveSettings', settings),

  // App operations
  getAppVersion: () => ipcRenderer.invoke('app:getVersion'),
  getPlatform: () => ipcRenderer.invoke('app:platform'),
});

// Type declaration for the exposed API
declare global {
  interface Window {
    electronAPI: {
      selectFolder: () => Promise<{ canceled: boolean; filePaths: string[] }>;
      scanFolder: (folderPath: string, options: any) => Promise<any[]>;
      moveToTrash: (filePath: string) => Promise<{ success: boolean; error?: string }>;
      openExternally: (filePath: string) => Promise<void>;
      generatePreview: (filePath: string, category: string) => Promise<string | null>;
      clearPreviewCache: () => Promise<void>;
      getRecentFolders: () => Promise<any[]>;
      addRecentFolder: (folder: any) => Promise<void>;
      saveSession: (session: any) => Promise<void>;
      getSessions: () => Promise<any[]>;
      getSettings: () => Promise<any>;
      saveSettings: (settings: any) => Promise<void>;
      getAppVersion: () => Promise<string>;
      getPlatform: () => Promise<string>;
    };
  }
}
