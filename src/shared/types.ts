// File item representing a file in the system
export interface FileItem {
  id: string;
  path: string;
  name: string;
  extension: string;
  size: number;
  createdAt: string;
  modifiedAt: string;
  category: FileCategory;
  previewPath?: string;
  status: FileStatus;
}

// Text preview payload for code and document-like files
export interface TextPreview {
  title: string;
  lines: string[];
  truncated: boolean;
}

// File categories for preview handling
export type FileCategory = 
  | 'image' 
  | 'video' 
  | 'pdf' 
  | 'document' 
  | 'spreadsheet' 
  | 'code' 
  | 'archive' 
  | 'audio' 
  | 'unknown';

// File status during cleanup session
export type FileStatus = 'pending' | 'kept' | 'deleted' | 'skipped';

// Sort order options
export type SortOrder = 
  | 'oldest' 
  | 'newest' 
  | 'daterange' 
  | 'largest' 
  | 'type';

// Session data
export interface Session {
  id: string;
  folderPath: string;
  startedAt: string;
  endedAt?: string;
  totalFiles: number;
  keptCount: number;
  deletedCount: number;
  skippedCount: number;
  spaceFreed: number;
  sortOrder: SortOrder;
  dateRangeStart?: string;
  dateRangeEnd?: string;
}

// Action for undo system
export interface Action {
  id: string;
  fileId: string;
  previousStatus: FileStatus;
  newStatus: FileStatus;
  timestamp: number;
}

// App settings
export interface AppSettings {
  confirmBeforeDelete: boolean;
  recursiveScan: boolean;
  showSystemFiles: boolean;
  maxUndoActions: number;
  previewCacheSize: number;
  theme: 'dark' | 'light';
}

// Stats for the session screen
export interface SessionStats {
  totalFiles: number;
  currentIndex: number;
  keptCount: number;
  deletedCount: number;
  skippedCount: number;
  spaceFreed: number;
}

// Recent folder entry
export interface RecentFolder {
  path: string;
  name: string;
  lastAccessed: string;
  fileCount: number;
}

// IPC Channel definitions
export interface IPCChannels {
  // File operations
  'file:selectFolder': () => Promise<{ canceled: boolean; filePaths: string[] }>;
  'file:scanFolder': (folderPath: string, options: ScanOptions) => Promise<FileItem[]>;
  'file:moveToTrash': (filePath: string) => Promise<{ success: boolean; error?: string }>;
  'file:openExternally': (filePath: string) => Promise<void>;
  
  // Preview operations
  'preview:generate': (filePath: string, category: FileCategory) => Promise<string | null>;
  'preview:getText': (filePath: string, category: FileCategory) => Promise<TextPreview | null>;
  'preview:clearCache': () => Promise<void>;
  
  // Database operations
  'db:getRecentFolders': () => Promise<RecentFolder[]>;
  'db:addRecentFolder': (folder: RecentFolder) => Promise<void>;
  'db:saveSession': (session: Session) => Promise<void>;
  'db:getSessions': () => Promise<Session[]>;
  'db:getSettings': () => Promise<AppSettings>;
  'db:saveSettings': (settings: AppSettings) => Promise<void>;
  
  // App operations
  'app:getVersion': () => string;
  'app:platform': () => string;
}

// Scan options
export interface ScanOptions {
  recursive: boolean;
  showSystemFiles: boolean;
  sortOrder: SortOrder;
  dateRangeStart?: string;
  dateRangeEnd?: string;
}

// Swipe direction
export type SwipeDirection = 'left' | 'right' | 'up';

// File type configuration
export interface FileTypeConfig {
  category: FileCategory;
  extensions: string[];
  icon: string;
  color: string;
}
