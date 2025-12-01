import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

/**
 * Google Gemini Imagen Service
 * Handles image generation and editing using Google's Imagen model
 */
class GeminiImageService {
  private client: GoogleGenerativeAI | null = null;
  private model: GenerativeModel | null = null;

  constructor() {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.warn('[Gemini Images] API key not configured. Image generation will not work.');
      console.warn('[Gemini Images] Set GOOGLE_API_KEY or GEMINI_API_KEY environment variable');
      return;
    }

    try {
      this.client = new GoogleGenerativeAI(apiKey);
      // Using Gemini 2.5 Flash Image for native image generation
      this.model = this.client.getGenerativeModel({ model: 'gemini-2.5-flash-image' });
      console.log('[Gemini Images] Client initialized successfully with gemini-2.5-flash-image');
    } catch (error) {
      console.error('[Gemini Images] Failed to initialize client:', error);
    }
  }

  /**
   * Check if the service is configured
   */
  isConfigured(): boolean {
    return this.client !== null && this.model !== null;
  }

  /**
   * Generate enhanced product images based on original image
   * Creates 3 high-quality variations maintaining product fidelity
   */
  async generateEnhancedImages(
    productName: string,
    productDescription: string,
    scenario: string,
    originalImageUrl: string
  ): Promise<string[]> {
    if (!this.model) {
      throw new Error('Gemini client not configured. Please set GOOGLE_API_KEY or GEMINI_API_KEY.');
    }

    console.log(`[Gemini Images] Generating 3 enhanced variations`);
    console.log(`[Gemini Images] Product: ${productName}`);
    console.log(`[Gemini Images] Original image: ${originalImageUrl}`);
    console.log(`[Gemini Images] Scenario: ${scenario}`);

    const imageUrls: string[] = [];

    try {
      // Download and prepare the original image
      const imageBuffer = await this.downloadImage(originalImageUrl);
      const base64Image = imageBuffer.toString('base64');
      const mimeType = await this.detectMimeType(imageBuffer);

      // Generate 3 variations with different prompts using original image as reference
      const prompts = this.buildVariationPrompts(productName, productDescription, scenario);

      for (let i = 0; i < prompts.length; i++) {
        try {
          console.log(`[Gemini Images] Generating variation ${i + 1}/3...`);
          console.log(`[Gemini Images] Prompt: ${prompts[i].substring(0, 100)}...`);
          
          // Generate image using original as reference
          const result = await this.model.generateContent([
            {
              inlineData: {
                data: base64Image,
                mimeType: mimeType,
              },
            },
            prompts[i],
          ]);

          const response = await result.response;
          const parts = response.candidates?.[0]?.content?.parts;

          if (parts && parts.length > 0) {
            // Find the image part (inlineData)
            const imagePart = parts.find(part => 'inlineData' in part && part.inlineData);
            
            if (imagePart && 'inlineData' in imagePart && imagePart.inlineData) {
              // Save the generated image
              const savedUrl = await this.saveGeneratedImage(
                Buffer.from(imagePart.inlineData.data, 'base64'),
                `variation-${i + 1}`
              );
              imageUrls.push(savedUrl);
              console.log(`[Gemini Images] Variation ${i + 1}/3 created successfully: ${savedUrl}`);
            } else {
              console.error(`[Gemini Images] No image data in response for variation ${i + 1}`);
              console.error(`[Gemini Images] Response parts:`, JSON.stringify(parts, null, 2));
            }
          } else {
            console.error(`[Gemini Images] No parts in response for variation ${i + 1}`);
          }

          // Delay between requests to avoid rate limits
          if (i < prompts.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } catch (error) {
          console.error(`[Gemini Images] Error generating variation ${i + 1}:`, error);
          // Continue with other variations
        }
      }

      if (imageUrls.length === 0) {
        throw new Error('Failed to generate any images');
      }

      console.log(`[Gemini Images] Successfully generated ${imageUrls.length}/3 images`);
      return imageUrls;

    } catch (error) {
      console.error(`[Gemini Images] Error in image generation:`, error);
      throw error;
    }
  }

  /**
   * Build variation prompts for different scenarios
   * Prompts emphasize keeping the product IDENTICAL while changing background/lighting
   */
  private buildVariationPrompts(
    productName: string,
    productDescription: string,
    scenario: string
  ): string[] {
    const scenarioInstructions: Record<string, string[]> = {
      'catalog': [
        `Keep this exact product 100% identical - same shape, colors, size, design, and all details. Only change the background to pure solid white (#FFFFFF) and add professional studio lighting for e-commerce catalog. The product itself CANNOT change at all. High quality commercial photography.`,
        `Maintain this product perfectly as shown - exactly the same appearance, proportions, and colors. Only replace the background with clean white backdrop and enhance with soft professional lighting for catalog. Product must remain completely unchanged. Premium quality shot.`,
        `Preserve this product exactly as it is - identical design, colors, and features. Only modify the background to pristine white and add studio lighting for commercial catalog photography. The product is untouched. Crystal clear professional quality.`,
      ],
      'table': [
        `Keep this exact product 100% identical. Only place it on a beautiful wooden table with natural wood grain texture. Add elegant wooden surface underneath while maintaining the product exactly as shown. Professional lighting. Product unchanged.`,
        `Maintain this product perfectly as it is. Only photograph it on a modern wooden desk with rich wood texture. The product stays completely identical - only the background changes to wooden surface. Natural lighting. Product untouched.`,
        `Preserve this product exactly as shown. Only add a premium wooden table surface underneath. Product must remain entirely the same - only enhance with beautiful wooden backdrop. Warm lighting. Product unchanged.`,
      ],
      'nature': [
        `Keep this exact product 100% identical. Only place it in a natural botanical setting with plants and greenery in the background. Product remains perfectly the same - only add natural elements like leaves, plants, or flowers. Soft natural daylight. Product untouched.`,
        `Maintain this product exactly as it is. Only photograph it in an outdoor natural environment with botanical elements. The product stays completely identical - only the background changes to nature. Natural organic lighting. Product unchanged.`,
        `Preserve this product perfectly as shown. Only add natural botanical backdrop with plants and leaves. Product must remain entirely the same - only enhance with natural elements. Beautiful natural light. Product untouched.`,
      ],
      'minimal': [
        `Keep this exact product 100% identical. Only place it in a minimalist modern setting with clean geometric shapes. Product remains perfectly the same - only add minimalist backdrop with geometric elements or neutral tones. Modern clean aesthetic. Product untouched.`,
        `Maintain this product exactly as it is. Only photograph it with minimalist design background. The product stays completely identical - only add simple geometric shapes or neutral colors. Contemporary minimalist style. Product unchanged.`,
        `Preserve this product perfectly as shown. Only add minimalist elements and clean lines to background. Product must remain entirely the same - only enhance with neutral minimalist backdrop. Modern simplicity. Product untouched.`,
      ],
      'lifestyle': [
        `Keep this exact product 100% identical. Only place it in a natural lifestyle home setting. Product remains perfectly the same - only add lifestyle elements like home decor, fabrics, or furniture in background. Warm natural lighting. Product untouched.`,
        `Maintain this product exactly as it is. Only photograph it in a cozy home environment. The product stays completely identical - only add lifestyle context with home accessories. Soft ambient lighting. Product unchanged.`,
        `Preserve this product perfectly as shown. Only add home elements and natural environment to background. Product must remain entirely the same - only enhance with lifestyle setting. Inviting atmosphere. Product untouched.`,
      ],
      'studio': [
        `Keep this exact product 100% identical. Only add professional studio setup with dramatic lighting. Product remains perfectly the same - only enhance lighting and add studio backdrop elements. High-end professional atmosphere. Product untouched.`,
        `Maintain this product exactly as it is. Only photograph it with studio photography lighting. The product stays completely identical - only add dramatic lighting effects and professional studio background. Premium quality. Product unchanged.`,
        `Preserve this product perfectly as shown. Only add artistic studio lighting and professional backdrop. Product must remain entirely the same - only enhance with sophisticated studio setup. Product untouched.`,
      ],
      'random': [
        `Keep this exact product 100% identical. Only place it in a creative and artistic setting. Product remains perfectly the same - only add unique and aesthetically pleasing background elements. Creative professional lighting. Product untouched.`,
        `Maintain this product exactly as it is. Only photograph it in an artistic environment. The product stays completely identical - only enhance with creative backdrop and artistic elements. Unique aesthetic. Product unchanged.`,
        `Preserve this product perfectly as shown. Only add artistic background and creative lighting. Product must remain entirely the same - only enhance with beautiful artistic composition. Product untouched.`,
      ],
    };

    const prompts = scenarioInstructions[scenario] || scenarioInstructions['catalog'];
    
    // Return all 3 prompts for variety
    return prompts;
  }

  /**
   * Save generated image to disk and return URL
   */
  private async saveGeneratedImage(
    imageBuffer: Buffer,
    prefix: string
  ): Promise<string> {
    try {
      // Optimize image with Sharp
      const optimized = await sharp(imageBuffer)
        .jpeg({ quality: 90, mozjpeg: true })
        .toBuffer();

      // Generate unique filename
      const filename = `${Date.now()}-${prefix}-${Math.random().toString(36).substring(7)}.jpg`;
      const uploadDir = path.join(process.cwd(), '..', 'public', 'uploads', 'enhanced');
      
      // Ensure directory exists
      await fs.mkdir(uploadDir, { recursive: true });
      
      const filepath = path.join(uploadDir, filename);
      await fs.writeFile(filepath, optimized);

      // Return URL path
      const url = `/uploads/enhanced/${filename}`;
      console.log(`[Gemini Images] Saved image to: ${url}`);
      
      return url;
    } catch (error) {
      console.error(`[Gemini Images] Error saving image:`, error);
      throw error;
    }
  }

  /**
   * Download image from URL to Buffer
   */
  private async downloadImage(url: string): Promise<Buffer> {
    console.log(`[Gemini Images] Downloading image from: ${url}`);
    
    try {
      // Handle local file paths
      if (url.startsWith('/uploads/')) {
        const filepath = path.join(process.cwd(), '..', 'public', url);
        const buffer = await fs.readFile(filepath);
        console.log(`[Gemini Images] Loaded local file: ${buffer.length} bytes`);
        return buffer;
      }

      // Handle remote URLs
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      console.log(`[Gemini Images] Downloaded ${buffer.length} bytes`);
      return buffer;
    } catch (error) {
      console.error(`[Gemini Images] Error downloading image:`, error);
      throw error;
    }
  }

  /**
   * Detect MIME type from image buffer
   */
  private async detectMimeType(buffer: Buffer): Promise<string> {
    try {
      const metadata = await sharp(buffer).metadata();
      
      switch (metadata.format) {
        case 'jpeg':
        case 'jpg':
          return 'image/jpeg';
        case 'png':
          return 'image/png';
        case 'webp':
          return 'image/webp';
        case 'gif':
          return 'image/gif';
        default:
          return 'image/jpeg'; // Default fallback
      }
    } catch (error) {
      console.warn(`[Gemini Images] Could not detect MIME type, using default:`, error);
      return 'image/jpeg';
    }
  }
}

export const geminiImageService = new GeminiImageService();
