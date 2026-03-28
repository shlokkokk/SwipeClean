import fs from 'fs/promises';
import path from 'path';
import trash from 'trash';
import crypto from 'crypto';
import type { FileItem, ScanOptions, SortOrder, FileCategory } from '../shared/types.js';

// System files to filter out
const SYSTEM_FILES = [
  '.DS_Store',
  'Thumbs.db',
  'desktop.ini',
  '.localized',
  '._.DS_Store',
  '.Spotlight-V100',
  '.Trashes',
  '.fseventsd'
];

// Protected paths that should not be accessed
const PROTECTED_PATHS = [
  '/System',
  '/usr',
  '/bin',
  '/sbin',
  '/lib',
  '/lib64',
  '/etc',
  '/var',
  '/boot',
  '/dev',
  '/proc',
  '/sys',
  'C:\\Windows',
  'C:\\Program Files',
  'C:\\Program Files (x86)',
  'C:\\ProgramData'
];

// File type mappings
const FILE_TYPE_MAP: Record<string, FileCategory> = {
  // Images
  jpg: 'image',
  jpeg: 'image',
  png: 'image',
  gif: 'image',
  webp: 'image',
  bmp: 'image',
  svg: 'image',
  tiff: 'image',
  ico: 'image',
  
  // Videos
  mp4: 'video',
  mov: 'video',
  avi: 'video',
  mkv: 'video',
  wmv: 'video',
  flv: 'video',
  webm: 'video',
  m4v: 'video',
  
  // PDFs
  pdf: 'pdf',
  
  // Documents
  doc: 'document',
  docx: 'document',
  txt: 'document',
  rtf: 'document',
  odt: 'document',
  pages: 'document',
  
  // Spreadsheets
  xls: 'spreadsheet',
  xlsx: 'spreadsheet',
  csv: 'spreadsheet',
  ods: 'spreadsheet',
  numbers: 'spreadsheet',
  
  // Code
  js: 'code',
  ts: 'code',
  jsx: 'code',
  tsx: 'code',
  html: 'code',
  css: 'code',
  scss: 'code',
  sass: 'code',
  less: 'code',
  json: 'code',
  xml: 'code',
  yaml: 'code',
  yml: 'code',
  py: 'code',
  java: 'code',
  cpp: 'code',
  c: 'code',
  h: 'code',
  php: 'code',
  rb: 'code',
  go: 'code',
  rs: 'code',
  swift: 'code',
  kt: 'code',
  sql: 'code',
  sh: 'code',
  bash: 'code',
  zsh: 'code',
  ps1: 'code',
  
  // Archives
  zip: 'archive',
  rar: 'archive',
  '7z': 'archive',
  tar: 'archive',
  gz: 'archive',
  bz2: 'archive',
  xz: 'archive',
  
  // Audio
  mp3: 'audio',
  wav: 'audio',
  flac: 'audio',
  aac: 'audio',
  ogg: 'audio',
  m4a: 'audio',
  wma: 'audio'
};

export class FileScanner {
  private isProtectedPath(folderPath: string): boolean {
    const normalizedPath = path.normalize(folderPath);
    return PROTECTED_PATHS.some(protectedPath => 
      normalizedPath.startsWith(protectedPath) || 
      normalizedPath.toLowerCase().startsWith(protectedPath.toLowerCase())
    );
  }

  async scanFolder(folderPath: string, options: ScanOptions): Promise<FileItem[]> {
    // Check if path is protected
    if (this.isProtectedPath(folderPath)) {
      throw new Error('Cannot scan protected system directories');
    }

    const files: FileItem[] = [];
    await this.scanDirectory(folderPath, options, files);
    
    // Sort files based on options
    return this.sortFiles(files, options);
  }

  private async scanDirectory(
    dirPath: string, 
    options: ScanOptions, 
    files: FileItem[]
  ): Promise<void> {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        // Skip system files
        if (SYSTEM_FILES.includes(entry.name)) {
          continue;
        }
        
        // Skip hidden files unless showSystemFiles is enabled
        if (entry.name.startsWith('.') && !options.showSystemFiles) {
          continue;
        }

        if (entry.isDirectory()) {
          // Recursively scan subdirectories if enabled
          if (options.recursive) {
            await this.scanDirectory(fullPath, options, files);
          }
        } else if (entry.isFile()) {
          try {
            const stats = await fs.stat(fullPath);
            const extension = path.extname(entry.name).toLowerCase().slice(1);
            
            // Check date range filter
            if (options.dateRangeStart || options.dateRangeEnd) {
              const fileDate = stats.birthtime || stats.mtime;
              
              if (options.dateRangeStart) {
                const startDate = new Date(options.dateRangeStart);
                if (fileDate < startDate) continue;
              }
              
              if (options.dateRangeEnd) {
                const endDate = new Date(options.dateRangeEnd);
                endDate.setHours(23, 59, 59, 999);
                if (fileDate > endDate) continue;
              }
            }

            const fileItem: FileItem = {
              id: crypto.randomUUID(),
              path: fullPath,
              name: entry.name,
              extension: extension,
              size: stats.size,
              createdAt: (stats.birthtime || stats.mtime).toISOString(),
              modifiedAt: stats.mtime.toISOString(),
              category: FILE_TYPE_MAP[extension] || 'unknown',
              status: 'pending'
            };
            
            files.push(fileItem);
          } catch (error) {
            console.warn(`Could not stat file: ${fullPath}`, error);
          }
        }
      }
    } catch (error) {
      console.error(`Error scanning directory: ${dirPath}`, error);
      throw error;
    }
  }

  private sortFiles(files: FileItem[], options: ScanOptions): FileItem[] {
    const sorted = [...files];
    
    switch (options.sortOrder) {
      case 'oldest':
        sorted.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
        
      case 'newest':
        sorted.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
        
      case 'largest':
        sorted.sort((a, b) => b.size - a.size);
        break;
        
      case 'type':
        sorted.sort((a, b) => {
          if (a.category !== b.category) {
            return a.category.localeCompare(b.category);
          }
          return a.name.localeCompare(b.name);
        });
        break;
        
      case 'daterange':
        // Files are already filtered by date range, sort by date
        sorted.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
        
      default:
        // Default to oldest first
        sorted.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
    }
    
    return sorted;
  }

  async moveToTrash(filePath: string): Promise<void> {
    try {
      // Handle both ESM and CommonJS exports of the trash module
      const trashFn = (trash as any).default || trash;
      await trashFn(filePath);
    } catch (error) {
      console.error(`Error moving file to trash: ${filePath}`, error);
      throw error;
    }
  }

  getCategoryForExtension(extension: string): FileCategory {
    return FILE_TYPE_MAP[extension.toLowerCase()] || 'unknown';
  }
}
