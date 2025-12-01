import * as aws from 'aws-sdk';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

/**
 * S3 Service for uploading and managing files in object storage
 */
export class S3Service {
  private client: aws.S3;
  private bucketName: string;
  private endpoint: string;

  constructor() {
    this.bucketName = process.env.S3_BUCKET_NAME || '';
    this.endpoint = process.env.S3_ENDPOINT || '';

    this.client = new aws.S3({
      signatureVersion: 'v4',
      endpoint: new aws.Endpoint(this.endpoint),
      secretAccessKey: process.env.S3_SECRET_KEY || '',
      accessKeyId: process.env.S3_ACCESS_KEY || '',
      s3ForcePathStyle: true,
    });
  }

  /**
   * Sanitize filename by removing special characters and spaces
   */
  private sanitizeString(line: string): string {
    const whitespace = new RegExp('\\s', 'g');
    let sanitized = line.normalize('NFD');
    sanitized = sanitized.replace(/[\u0300-\u036f]/g, '');
    sanitized = sanitized.replace(whitespace, '_');
    return sanitized;
  }

  /**
   * Upload a buffer to S3
   * @param buffer File buffer
   * @param filename Original filename
   * @param contentType MIME type
   * @param makePublic Whether to make the file public
   * @returns Public URL of uploaded file
   */
  async uploadBuffer(
    buffer: Buffer,
    filename: string,
    contentType: string = 'image/jpeg',
    makePublic: boolean = true
  ): Promise<string> {
    try {
      const sanitizedName = this.sanitizeString(filename);
      const key = `${Date.now()}-${sanitizedName}`;

      const params: aws.S3.PutObjectRequest = {
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      };

      if (makePublic) {
        params.ACL = 'public-read';
      }

      await this.client.putObject(params).promise();

      const fullUrl = `https://${this.endpoint}/${this.bucketName}/${key}`;
      console.log(`[S3] Uploaded file to ${fullUrl}`);

      return fullUrl;
    } catch (error) {
      console.error('[S3] Error uploading buffer:', error);
      throw new Error(`Failed to upload to S3: ${error}`);
    }
  }

  /**
   * Upload a local file to S3
   * @param localPath Path to local file
   * @param filename Filename to use in S3 (optional, uses local filename if not provided)
   * @param makePublic Whether to make the file public
   * @returns Public URL of uploaded file
   */
  async uploadLocalFile(
    localPath: string,
    filename?: string,
    makePublic: boolean = true
  ): Promise<string> {
    try {
      const fileBuffer = fs.readFileSync(localPath);
      const basename = filename || path.basename(localPath);
      
      // Detect content type from file extension
      const ext = path.extname(basename).toLowerCase();
      const contentTypeMap: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
        '.gif': 'image/gif',
        '.mp4': 'video/mp4',
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
      };
      const contentType = contentTypeMap[ext] || 'application/octet-stream';

      return await this.uploadBuffer(fileBuffer, basename, contentType, makePublic);
    } catch (error) {
      console.error('[S3] Error uploading local file:', error);
      throw new Error(`Failed to upload local file to S3: ${error}`);
    }
  }

  /**
   * Upload an image with optional processing (resize, compression)
   * @param imageBuffer Image buffer
   * @param filename Original filename
   * @param options Processing options
   * @returns Public URL of uploaded image
   */
  async uploadImage(
    imageBuffer: Buffer,
    filename: string,
    options: {
      maxWidth?: number;
      maxHeight?: number;
      quality?: number;
      format?: 'jpeg' | 'png' | 'webp';
      makePublic?: boolean;
    } = {}
  ): Promise<string> {
    try {
      const {
        maxWidth,
        maxHeight,
        quality = 80,
        format = 'jpeg',
        makePublic = true,
      } = options;

      let processedImage = sharp(imageBuffer);

      // Resize if dimensions provided
      if (maxWidth || maxHeight) {
        processedImage = processedImage.resize(maxWidth, maxHeight, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      // Convert and compress based on format
      let outputBuffer: Buffer;
      let contentType: string;
      let ext: string;

      switch (format) {
        case 'png':
          outputBuffer = await processedImage.png({ quality }).toBuffer();
          contentType = 'image/png';
          ext = '.png';
          break;
        case 'webp':
          outputBuffer = await processedImage.webp({ quality }).toBuffer();
          contentType = 'image/webp';
          ext = '.webp';
          break;
        case 'jpeg':
        default:
          outputBuffer = await processedImage.jpeg({ quality }).toBuffer();
          contentType = 'image/jpeg';
          ext = '.jpg';
          break;
      }

      // Update filename with new extension
      const baseFilename = filename.replace(/\.[^/.]+$/, '');
      const newFilename = `${baseFilename}${ext}`;

      return await this.uploadBuffer(outputBuffer, newFilename, contentType, makePublic);
    } catch (error) {
      console.error('[S3] Error uploading image:', error);
      throw new Error(`Failed to upload image to S3: ${error}`);
    }
  }

  /**
   * Download image from URL and upload to S3
   * @param imageUrl URL of image to download
   * @param filename Filename to use in S3
   * @param makePublic Whether to make the file public
   * @returns Public URL of uploaded file
   */
  async uploadFromUrl(
    imageUrl: string,
    filename?: string,
    makePublic: boolean = true
  ): Promise<string> {
    try {
      console.log(`[S3] Downloading image from ${imageUrl}`);
      
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Use URL basename as filename if not provided
      const urlFilename = filename || path.basename(new URL(imageUrl).pathname) || 'image.jpg';

      // Detect content type from response or buffer
      const contentType = response.headers.get('content-type') || 'image/jpeg';

      return await this.uploadBuffer(buffer, urlFilename, contentType, makePublic);
    } catch (error) {
      console.error('[S3] Error uploading from URL:', error);
      throw new Error(`Failed to upload from URL to S3: ${error}`);
    }
  }

  /**
   * Generate a signed URL for private file access
   * @param key File key in S3
   * @param expiresInSeconds Expiration time in seconds (default: 900 = 15 minutes)
   * @returns Signed URL
   */
  getSignedUrl(key: string, expiresInSeconds: number = 900): string {
    return this.client.getSignedUrl('getObject', {
      Key: key,
      Bucket: this.bucketName,
      Expires: expiresInSeconds,
    });
  }

  /**
   * Delete a file from S3
   * @param key File key in S3
   */
  async deleteFile(key: string): Promise<void> {
    try {
      await this.client
        .deleteObject({
          Bucket: this.bucketName,
          Key: key,
        })
        .promise();
      
      console.log(`[S3] Deleted file: ${key}`);
    } catch (error) {
      console.error('[S3] Error deleting file:', error);
      throw new Error(`Failed to delete file from S3: ${error}`);
    }
  }
}

export const s3Service = new S3Service();
