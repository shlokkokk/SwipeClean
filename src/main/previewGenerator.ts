import sharp from 'sharp';
import { fromPath } from 'pdf2pic';
import fs from 'fs/promises';
import path from 'path';
import { app } from 'electron';
import crypto from 'crypto';
import type { FileCategory } from '../shared/types.js';

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
