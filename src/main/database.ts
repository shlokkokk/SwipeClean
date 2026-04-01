import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';
import fs from 'fs';
import type { RecentFolder, Session, AppSettings } from '../shared/types.js';

export class DatabaseManager {
  private db: Database.Database;
  private dbPath: string;

  constructor() {
    // Use app.getPath to get the user data directory
    const userDataPath = app.getPath('userData');
    this.dbPath = path.join(userDataPath, 'swipeclean.db');
    
    // Ensure directory exists
    const dbDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    this.db = new Database(this.dbPath);
    this.initializeTables();
  }

  private initializeTables(): void {
    // Recent folders table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS recent_folders (
        path TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        last_accessed TEXT NOT NULL,
        file_count INTEGER DEFAULT 0
      )
    `);

    // Sessions table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        folder_path TEXT NOT NULL,
        started_at TEXT NOT NULL,
        ended_at TEXT,
        total_files INTEGER DEFAULT 0,
        kept_count INTEGER DEFAULT 0,
        deleted_count INTEGER DEFAULT 0,
        skipped_count INTEGER DEFAULT 0,
        space_freed INTEGER DEFAULT 0,
        sort_order TEXT DEFAULT 'oldest',
        date_range_start TEXT,
        date_range_end TEXT
      )
    `);

    // Settings table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);

    // Insert default settings if not exists
    const defaultSettings: AppSettings = {
      confirmBeforeDelete: false,
      recursiveScan: true,
      showSystemFiles: false,
      maxUndoActions: 10,
      previewCacheSize: 100,
      theme: 'dark'
    };

    const existingSettings = this.db.prepare('SELECT COUNT(*) as count FROM settings').get() as { count: number };
    if (existingSettings.count === 0) {
      const insert = this.db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
      for (const [key, value] of Object.entries(defaultSettings)) {
        insert.run(key, JSON.stringify(value));
      }
    }
  }

  // Recent Folders
  getRecentFolders(): RecentFolder[] {
    const stmt = this.db.prepare(
      'SELECT * FROM recent_folders ORDER BY last_accessed DESC LIMIT 10'
    );
    const rows = stmt.all() as Array<{
      path: string;
      name: string;
      last_accessed: string;
      file_count: number;
    }>;
    
    return rows.map(row => ({
      path: row.path,
      name: row.name,
      lastAccessed: row.last_accessed,
      fileCount: row.file_count
    }));
  }

  addRecentFolder(folder: RecentFolder): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO recent_folders (path, name, last_accessed, file_count)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(folder.path, folder.name, folder.lastAccessed, folder.fileCount);
  }

  // Sessions
  saveSession(session: Session): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO sessions 
      (id, folder_path, started_at, ended_at, total_files, kept_count, deleted_count, 
       skipped_count, space_freed, sort_order, date_range_start, date_range_end)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      session.id,
      session.folderPath,
      session.startedAt,
      session.endedAt || null,
      session.totalFiles,
      session.keptCount,
      session.deletedCount,
      session.skippedCount,
      session.spaceFreed,
      session.sortOrder,
      session.dateRangeStart || null,
      session.dateRangeEnd || null
    );
  }

  getSessions(): Session[] {
    const stmt = this.db.prepare(
      'SELECT * FROM sessions ORDER BY started_at DESC LIMIT 50'
    );
    const rows = stmt.all() as Array<{
      id: string;
      folder_path: string;
      started_at: string;
      ended_at: string | null;
      total_files: number;
      kept_count: number;
      deleted_count: number;
      skipped_count: number;
      space_freed: number;
      sort_order: string;
      date_range_start: string | null;
      date_range_end: string | null;
    }>;
    
    return rows.map(row => ({
      id: row.id,
      folderPath: row.folder_path,
      startedAt: row.started_at,
      endedAt: row.ended_at || undefined,
      totalFiles: row.total_files,
      keptCount: row.kept_count,
      deletedCount: row.deleted_count,
      skippedCount: row.skipped_count,
      spaceFreed: row.space_freed,
      sortOrder: row.sort_order as Session['sortOrder'],
      dateRangeStart: row.date_range_start || undefined,
      dateRangeEnd: row.date_range_end || undefined
    }));
  }

  // Settings
  getSettings(): AppSettings {
    const stmt = this.db.prepare('SELECT key, value FROM settings');
    const rows = stmt.all() as Array<{ key: string; value: string }>;
    
    const settings: Partial<AppSettings> = {};
    for (const row of rows) {
      settings[row.key as keyof AppSettings] = JSON.parse(row.value);
    }
    
    return {
      confirmBeforeDelete: settings.confirmBeforeDelete ?? false,
      recursiveScan: settings.recursiveScan ?? true,
      showSystemFiles: settings.showSystemFiles ?? false,
      maxUndoActions: settings.maxUndoActions ?? 10,
      previewCacheSize: settings.previewCacheSize ?? 100,
      theme: settings.theme ?? 'dark'
    };
  }

  saveSettings(settings: AppSettings): void {
    const insert = this.db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    for (const [key, value] of Object.entries(settings)) {
      insert.run(key, JSON.stringify(value));
    }
  }

  close(): void {
    this.db.close();
  }
}
