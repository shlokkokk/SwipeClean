import sharp from 'sharp';
import { fromPath } from 'pdf2pic';
import fs from 'fs/promises';
import path from 'path';
import { app } from 'electron';
import crypto from 'crypto';
import type { FileCategory, TextPreview } from '../shared/types.js';

const TEXT_PREVIEW_EXTENSIONS = new Set([
  'txt', 'md', 'markdown', 'rtf', 'csv', 'tsv',
  'js', 'ts', 'jsx', 'tsx', 'html', 'css', 'scss', 'sass', 'less',
  'json', 'xml', 'yaml', 'yml', 'py', 'java', 'cpp', 'c', 'h', 'hpp',
  'php', 'rb', 'go', 'rs', 'swift', 'kt', 'sql', 'sh', 'bash', 'zsh',
  'ps1', 'ini', 'log'
]);

const MAX_TEXT_PREVIEW_LINES = 160;

export class PreviewGenerator {
  private previewDir: string;
  private maxDimension: number = 800;

  constructor() {
    // Use app.getPath to get the user data directory for previews
    const userDataPath = app.getPath('userData');
    this.previewDir = path.join(userDataPath, 'previews');
    this.ensurePreviewDir();
  }

  private async ensurePreviewDir(): Promise<void> {
    try {
      await fs.mkdir(this.previewDir, { recursive: true });
    } catch (error) {
      console.error('Error creating preview directory:', error);
    }
  }

  private normalizePathForFileUrl(filePath: string): string {
    // Convert to preview:// protocol URL
    // The path comes with backslashes on Windows, convert to forward slashes
    const normalized = filePath.replace(/\\/g, '/');
    // Encode the path for URI safety
    const encoded = encodeURIComponent(normalized);
    return `preview://${encoded}`;
  }

  private getPreviewPath(filePath: string): string {
    // Create a hash of the file path for the preview filename
    const hash = crypto.createHash('md5').update(filePath).digest('hex');
    return path.join(this.previewDir, `${hash}.png`);
  }

  private async previewExists(previewPath: string): Promise<boolean> {
    try {
      await fs.access(previewPath);
      return true;
    } catch {
      return false;
    }
  }

  async generateTextPreview(filePath: string, category: FileCategory): Promise<TextPreview | null> {
    if (!['code', 'document', 'spreadsheet'].includes(category)) {
      return null;
    }

    const extension = path.extname(filePath).toLowerCase().slice(1);
    if (!TEXT_PREVIEW_EXTENSIONS.has(extension)) {
      return null;
    }

    try {
      const fileHandle = await fs.open(filePath, 'r');
      const maxBytes = 64 * 1024;
      const buffer = Buffer.alloc(maxBytes);
      const { bytesRead } = await fileHandle.read(buffer, 0, maxBytes, 0);
      await fileHandle.close();

      if (bytesRead <= 0) {
        return null;
      }

      const slice = buffer.subarray(0, bytesRead);
      if (this.looksBinary(slice)) {
        return null;
      }

      const content = slice.toString('utf8').replace(/\r\n/g, '\n');
      const allLines = content.split('\n');
      const cleanedLines = allLines.map(line => line.replace(/\t/g, '  ').trimEnd());

      const previewLines = cleanedLines.slice(0, MAX_TEXT_PREVIEW_LINES);
      if (previewLines.length === 0) {
        return {
          title: path.basename(filePath),
          lines: ['(No readable text in this file)'],
          truncated: false
        };
      }

      return {
        title: this.getTextPreviewTitle(filePath, extension, previewLines),
        lines: previewLines,
        truncated: cleanedLines.length > previewLines.length
      };
    } catch (error) {
      console.warn('[Preview] Could not generate text preview for:', filePath, error);
      return null;
    }
  }

  private looksBinary(buffer: Buffer): boolean {
    const inspectLen = Math.min(buffer.length, 1024);
    let suspiciousBytes = 0;

    for (let i = 0; i < inspectLen; i++) {
      const byte = buffer[i];
      if (byte === 0) {
        return true;
      }

      const isControl = byte < 7 || (byte > 14 && byte < 32);
      if (isControl) {
        suspiciousBytes++;
      }
    }

    return inspectLen > 0 && suspiciousBytes / inspectLen > 0.2;
  }

  private getTextPreviewTitle(filePath: string, extension: string, lines: string[]): string {
    if (extension === 'md' || extension === 'markdown') {
      const heading = lines.find(line => line.startsWith('#'));
      if (heading) {
        return heading.replace(/^#+\s*/, '').trim();
      }
    }

    return path.basename(filePath);
  }

  async generatePreview(filePath: string, category: FileCategory): Promise<string | null> {
    const previewPath = this.getPreviewPath(filePath);
    
    // Check if preview already exists
    if (await this.previewExists(previewPath)) {
      console.log('[Preview] Cache hit for:', filePath);
      return this.normalizePathForFileUrl(previewPath);
    }

    console.log('[Preview] Generating preview for:', filePath, 'Category:', category);

    try {
      switch (category) {
        case 'image':
          return await this.generateImagePreview(filePath, previewPath);
          
        case 'pdf':
          return await this.generatePDFPreview(filePath, previewPath);
          
        case 'video':
          // For videos, we'll return a placeholder for now
          // Video thumbnail generation requires ffmpeg which is complex
          console.log('[Preview] Video previews not yet implemented');
          return null;
          
        default:
          console.log('[Preview] No preview available for category:', category);
          return null;
      }
    } catch (error) {
      console.error(`[Preview] Error generating preview for ${filePath}:`, error);
      return null;
    }
  }

  private async generateImagePreview(filePath: string, previewPath: string): Promise<string | null> {
    try {
      console.log('[Preview] Starting image preview generation for:', filePath);
      await sharp(filePath)
        .resize(this.maxDimension, this.maxDimension, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .png({ quality: 80 })
        .toFile(previewPath);
      
      console.log('[Preview] Image preview saved to:', previewPath);
      return this.normalizePathForFileUrl(previewPath);
    } catch (error) {
      console.error('[Preview] Error generating image preview:', error);
      return null;
    }
  }

  private async generatePDFPreview(filePath: string, previewPath: string): Promise<string | null> {
    try {
      console.log('[Preview] Starting PDF preview generation for:', filePath);
      const convert = fromPath(filePath, {
        density: 100,
        saveFilename: path.basename(previewPath, '.png'),
        savePath: this.previewDir,
        format: 'png',
        width: this.maxDimension,
        height: this.maxDimension
      });

      const result = await convert(1); // Convert first page
      
      if (result && result.path) {
        console.log('[Preview] PDF preview saved to:', result.path);
        return this.normalizePathForFileUrl(result.path);
      }
      
      console.log('[Preview] PDF conversion returned no result');
      return null;
    } catch (error) {
      console.error('[Preview] Error generating PDF preview:', error);
      return null;
    }
  }

  async clearCache(): Promise<void> {
    try {
      const files = await fs.readdir(this.previewDir);
      
      for (const file of files) {
        const filePath = path.join(this.previewDir, file);
        try {
          await fs.unlink(filePath);
        } catch (error) {
          console.warn(`Could not delete preview file: ${filePath}`, error);
        }
      }
      
      console.log('Preview cache cleared');
    } catch (error) {
      console.error('Error clearing preview cache:', error);
      throw error;
    }
  }

  async getCacheSize(): Promise<number> {
    try {
      const files = await fs.readdir(this.previewDir);
      let totalSize = 0;
      
      for (const file of files) {
        const filePath = path.join(this.previewDir, file);
        try {
          const stats = await fs.stat(filePath);
          totalSize += stats.size;
        } catch (error) {
          console.warn(`Could not stat preview file: ${filePath}`, error);
        }
      }
      
      return totalSize;
    } catch (error) {
      return 0;
    }
  }
}
