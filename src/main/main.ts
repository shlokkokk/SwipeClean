import { app, BrowserWindow, ipcMain, dialog, shell, protocol } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fsSync from 'fs';
import fs from 'fs/promises';
import { DatabaseManager } from './database.js';
import { FileScanner } from './fileScanner.js';
import { PreviewGenerator } from './previewGenerator.js';
import type { ScanOptions, RecentFolder, Session, AppSettings, FileItem } from '../shared/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize managers
const dbManager = new DatabaseManager();
const fileScanner = new FileScanner();
const previewGenerator = new PreviewGenerator();

let mainWindow: BrowserWindow | null = null;

// Determine if we're in development mode
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function getWindowIconPath(): string | undefined {
  const windowsCandidates = [
    path.join(app.getAppPath(), 'assets', 'icon.ico'),
    path.join(process.cwd(), 'assets', 'icon.ico'),
    path.join(__dirname, '../renderer/assets/icon.ico')
  ];

  const pngCandidates = [
    path.join(app.getAppPath(), 'assets', 'icon.png'),
    path.join(process.cwd(), 'assets', 'icon.png'),
    path.join(__dirname, '../renderer/assets/icon.png')
  ];

  const candidates = process.platform === 'win32'
    ? [...windowsCandidates, ...pngCandidates]
    : [...pngCandidates, ...windowsCandidates];

  return candidates.find((candidate) => fsSync.existsSync(candidate));
}

function createWindow(): void {
  const iconPath = getWindowIconPath();

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    icon: iconPath,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    },
    show: false,
    backgroundColor: '#0f172a'
  });

  // Load the renderer
  if (isDev) {
    // In development, load from the vite dev server
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built files
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(() => {
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.swipeclean.app');
  }

  // Register custom protocol for serving preview files
  protocol.registerBufferProtocol('preview', (request, callback) => {
    (async () => {
      try {
        const url = request.url.replace('preview://', '');
        // Decode the URL to handle percent-encoding
        const filePath = decodeURIComponent(url);
        console.log('[Protocol] Loading preview from:', filePath);
        
        // Read and serve the file
        const buffer = await fs.readFile(filePath);
        console.log('[Protocol] File size:', buffer.length, 'bytes');
        callback({
          mimeType: 'image/png',
          data: buffer
        });
        console.log('[Protocol] Successfully served:', filePath);
      } catch (error) {
        console.error('[Protocol] Error serving preview:', error);
        callback((error as any));
      }
    })();
  });

  createWindow();
  setupIPC();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Setup
function setupIPC(): void {
  // File operations
  ipcMain.handle('file:selectFolder', async () => {
    if (!mainWindow) return { canceled: true, filePaths: [] };
    
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: 'Select Folder to Clean'
    });
    
    return result;
  });

  ipcMain.handle('file:scanFolder', async (_, folderPath: string, options: ScanOptions) => {
    try {
      const files = await fileScanner.scanFolder(folderPath, options);
      return files;
    } catch (error) {
      console.error('Error scanning folder:', error);
      throw error;
    }
  });

  ipcMain.handle('file:moveToTrash', async (_, filePath: string) => {
    try {
      await fileScanner.moveToTrash(filePath);
      return { success: true };
    } catch (error) {
      console.error('Error moving to trash:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('file:openExternally', async (_, filePath: string) => {
    try {
      await shell.openPath(filePath);
    } catch (error) {
      console.error('Error opening file:', error);
      throw error;
    }
  });

  // Preview operations
  ipcMain.handle('preview:generate', async (_, filePath: string, category: string) => {
    try {
      const previewPath = await previewGenerator.generatePreview(filePath, category);
      console.log('[IPC] preview:generate returning:', previewPath);
      return previewPath;
    } catch (error) {
      console.error('[IPC] Error generating preview:', error);
      return null;
    }
  });

  ipcMain.handle('preview:getText', async (_, filePath: string, category: string) => {
    try {
      return await previewGenerator.generateTextPreview(filePath, category);
    } catch (error) {
      console.error('[IPC] Error generating text preview:', error);
      return null;
    }
  });

  ipcMain.handle('preview:clearCache', async () => {
    try {
      await previewGenerator.clearCache();
      return;
    } catch (error) {
      console.error('Error clearing preview cache:', error);
      throw error;
    }
  });

  // Database operations
  ipcMain.handle('db:getRecentFolders', () => {
    return dbManager.getRecentFolders();
  });

  ipcMain.handle('db:addRecentFolder', (_, folder: RecentFolder) => {
    dbManager.addRecentFolder(folder);
  });

  ipcMain.handle('db:saveSession', (_, session: Session) => {
    dbManager.saveSession(session);
  });

  ipcMain.handle('db:getSessions', () => {
    return dbManager.getSessions();
  });

  ipcMain.handle('db:getSettings', () => {
    return dbManager.getSettings();
  });

  ipcMain.handle('db:saveSettings', (_, settings: AppSettings) => {
    dbManager.saveSettings(settings);
  });

  // App operations
  ipcMain.handle('app:getVersion', () => {
    return app.getVersion();
  });

  ipcMain.handle('app:platform', () => {
    return process.platform;
  });
}
