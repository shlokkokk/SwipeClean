import { app, BrowserWindow, ipcMain, dialog, shell, protocol } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fsSync from 'fs';
import fs from 'fs/promises';
import { autoUpdater } from 'electron-updater';
import { DatabaseManager } from './database.js';
import { FileScanner } from './fileScanner.js';
import { PreviewGenerator } from './previewGenerator.js';
import type { ScanOptions, RecentFolder, Session, AppSettings, AppUpdateStatus, FileCategory } from '../shared/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize managers
const dbManager = new DatabaseManager();
const fileScanner = new FileScanner();
const previewGenerator = new PreviewGenerator();

let mainWindow: BrowserWindow | null = null;

// Determine if we're in development mode
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

const createInitialUpdateStatus = (): AppUpdateStatus => ({
  status: 'idle',
  message: 'Ready to check for updates.',
  currentVersion: app.getVersion()
});

let updateStatus: AppUpdateStatus = createInitialUpdateStatus();

function setUpdateStatus(patch: Partial<AppUpdateStatus>): AppUpdateStatus {
  updateStatus = {
    ...updateStatus,
    ...patch,
    currentVersion: app.getVersion()
  };

  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('app:updateStatus', updateStatus);
  }

  return updateStatus;
}

function setupAutoUpdater(): void {
  if (isDev) {
    // Updater is intentionally disabled for unpackaged/dev runs.
    // Keep renderer messaging neutral so end users do not see a dev-only warning banner.
    return;
  }

  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update', () => {
    setUpdateStatus({
      status: 'checking',
      message: 'Checking GitHub for a newer version...',
      availableVersion: undefined,
      progress: undefined
    });
  });

  autoUpdater.on('update-available', (info) => {
    setUpdateStatus({
      status: 'downloading',
      message: `Update ${info.version} found. Downloading now...`,
      availableVersion: info.version,
      progress: 0
    });

    void autoUpdater.downloadUpdate().catch((error) => {
      console.error('[Updater] downloadUpdate failed:', error);
      setUpdateStatus({
        status: 'error',
        message: `Update download failed: ${(error as Error).message}`,
        progress: undefined
      });
    });
  });

  autoUpdater.on('update-not-available', () => {
    setUpdateStatus({
      status: 'up-to-date',
      message: 'You are already on the latest version.',
      availableVersion: undefined,
      progress: undefined
    });
  });

  autoUpdater.on('download-progress', (progressObj) => {
    setUpdateStatus({
      status: 'downloading',
      message: `Downloading update... ${Math.round(progressObj.percent)}%`,
      progress: progressObj.percent
    });
  });

  autoUpdater.on('update-downloaded', (info) => {
    setUpdateStatus({
      status: 'downloaded',
      message: `Update ${info.version} downloaded. Restarting to apply...`,
      availableVersion: info.version,
      progress: 100
    });

    // Give renderer a brief chance to render status before restart.
    setTimeout(() => {
      autoUpdater.quitAndInstall();
    }, 1200);
  });

  autoUpdater.on('error', (error) => {
    console.error('[Updater] error:', error);
    setUpdateStatus({
      status: 'error',
      message: `Update check failed: ${error.message}`,
      progress: undefined
    });
  });
}

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
  setupAutoUpdater();
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
  ipcMain.handle('preview:generate', async (_, filePath: string, category: FileCategory) => {
    try {
      const previewPath = await previewGenerator.generatePreview(filePath, category);
      console.log('[IPC] preview:generate returning:', previewPath);
      return previewPath;
    } catch (error) {
      console.error('[IPC] Error generating preview:', error);
      return null;
    }
  });

  ipcMain.handle('preview:getText', async (_, filePath: string, category: FileCategory) => {
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

  ipcMain.handle('app:getUpdateStatus', () => {
    return updateStatus;
  });

  ipcMain.handle('app:checkForUpdates', async () => {
    if (isDev) {
      // In development we skip network update checks entirely.
      // Return the current neutral status instead of a visible "disabled in dev" message.
      return updateStatus;
    }

    if (updateStatus.status === 'checking' || updateStatus.status === 'downloading') {
      return updateStatus;
    }

    try {
      await autoUpdater.checkForUpdates();
      return updateStatus;
    } catch (error) {
      return setUpdateStatus({
        status: 'error',
        message: `Update check failed: ${(error as Error).message}`,
        progress: undefined
      });
    }
  });
}
