import fs from 'fs/promises';
import path from 'path';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

/**
 * Storage service for file operations
 */
class StorageService {
  private uploadsDir: string;

  constructor() {
    // Assume workers run at root level, so uploads are in ../public/uploads
    this.uploadsDir = path.join(process.cwd(), '..', 'public', 'uploads');
  }

  /**
   * Get full path for a file
   */
  getFilePath(relativePath: string): string {
    return path.join(this.uploadsDir, relativePath);
  }

  /**
   * Read a file as buffer
   */
  async readFile(relativePath: string): Promise<Buffer> {
    const fullPath = this.getFilePath(relativePath);
    return fs.readFile(fullPath);
  }

  /**
   * Write a file from buffer
   */
  async writeFile(relativePath: string, data: Buffer): Promise<string> {
    const fullPath = this.getFilePath(relativePath);
    const dir = path.dirname(fullPath);
    
    // Ensure directory exists
    await fs.mkdir(dir, { recursive: true });
    
    // Write file
    await fs.writeFile(fullPath, data);
    
    return relativePath;
  }

  /**
   * Write a file from stream
   */
  async writeFileFromStream(relativePath: string, stream: NodeJS.ReadableStream): Promise<string> {
    const fullPath = this.getFilePath(relativePath);
    const dir = path.dirname(fullPath);
    
    // Ensure directory exists
    await fs.mkdir(dir, { recursive: true });
    
    // Pipe stream to file
    const writeStream = createWriteStream(fullPath);
    await pipeline(stream, writeStream);
    
    return relativePath;
  }

  /**
   * Delete a file
   */
  async deleteFile(relativePath: string): Promise<void> {
    const fullPath = this.getFilePath(relativePath);
    await fs.unlink(fullPath);
  }

  /**
   * Check if file exists
   */
  async fileExists(relativePath: string): Promise<boolean> {
    const fullPath = this.getFilePath(relativePath);
    try {
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate unique filename
   */
  generateFilename(extension: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${random}.${extension}`;
  }
}

export const storageService = new StorageService();
