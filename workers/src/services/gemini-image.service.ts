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
      // Using Imagen 3 model for image generation
      this.model = this.client.getGenerativeModel({ model: 'imagen-3.0-generate-001' });
      console.log('[Gemini Images] Client initialized successfully');
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

      // Generate 3 variations with different prompts
      const prompts = this.buildVariationPrompts(productName, productDescription, scenario);

      for (let i = 0; i < prompts.length; i++) {
        try {
          console.log(`[Gemini Images] Generating variation ${i + 1}/3...`);
          
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
          const imageData = response.candidates?.[0]?.content?.parts?.[0];

          if (imageData && 'inlineData' in imageData) {
            // Save the generated image
            const savedUrl = await this.saveGeneratedImage(
              Buffer.from(imageData.inlineData.data, 'base64'),
              `variation-${i + 1}`
            );
            imageUrls.push(savedUrl);
            console.log(`[Gemini Images] Variation ${i + 1}/3 created successfully`);
          } else {
            console.error(`[Gemini Images] No image data in response for variation ${i + 1}`);
          }

          // Delay between requests to avoid rate limits
          if (i < prompts.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
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
   * Emphasizes maintaining product fidelity while changing background/lighting
   */
  private buildVariationPrompts(
    productName: string,
    productDescription: string,
    scenario: string
  ): string[] {
    const baseContext = `Product: ${productName}. ${productDescription || ''}`;
    
    const scenarioInstructions: Record<string, string[]> = {
      'catalog': [
        `${baseContext}\n\nCreate a professional catalog photo with pure solid white background (#FFFFFF). Keep the product EXACTLY as shown - same shape, colors, design, and details. Only change the background to clean white and add professional studio lighting. The product must remain completely identical.`,
        `${baseContext}\n\nProfessional e-commerce product photography with pure white backdrop. The product must be 100% identical to the original - same appearance, same proportions. Only enhance lighting and ensure perfectly clean white background. No modifications to the product itself.`,
        `${baseContext}\n\nHigh-quality catalog image with pristine white background. Product must remain entirely unchanged - same colors, same features, same design. Only improve background cleanliness and add soft, professional lighting. Product is untouched.`,
      ],
      'table': [
        `${baseContext}\n\nPlace this exact product on a beautiful wooden table. Product must be 100% identical - same size, colors, and design. Only add elegant wooden surface underneath with natural wood grain texture. Professional lighting. The product itself cannot change.`,
        `${baseContext}\n\nSame product photographed on a modern desk or wooden surface. Product remains perfectly identical. Only change the background to show an elegant table with rich wood texture. Natural professional lighting. Product unchanged.`,
        `${baseContext}\n\nProduct on premium wooden table surface. Product must be exactly as shown - same appearance, same details. Only add beautiful wooden table backdrop with natural lighting. The product is completely preserved.`,
      ],
      'nature': [
        `${baseContext}\n\nPlace the exact product in a natural botanical setting with plants and greenery. Product must remain 100% identical. Only add natural elements like leaves, plants, or flowers in the background. Soft natural daylight. Product untouched.`,
        `${baseContext}\n\nSame product in an outdoor natural environment with botanical elements. Product stays perfectly identical. Only add greenery, plants, or natural textures in background. Natural organic lighting. Product unchanged.`,
        `${baseContext}\n\nProduct with natural botanical backdrop. Product must be exactly as is - same colors, same design. Only enhance with plants, leaves, or natural elements. Beautiful natural light. Product completely preserved.`,
      ],
      'minimal': [
        `${baseContext}\n\nProduct in minimalist modern setting with clean geometric shapes. Product must be entirely unchanged. Only add minimalist geometric elements or neutral backdrop. Modern clean aesthetic. Product remains identical.`,
        `${baseContext}\n\nSame product with minimalist design background. Product stays 100% identical. Only add simple geometric shapes or neutral tones. Contemporary minimalist style. Product untouched.`,
        `${baseContext}\n\nMinimalist product photography with clean lines. Product must be exactly as shown. Only enhance with minimalist elements and neutral colors. Modern simplicity. Product unchanged.`,
      ],
      'lifestyle': [
        `${baseContext}\n\nProduct in natural lifestyle home setting. Product must remain perfectly identical. Only add lifestyle elements like home decor, fabrics, or furniture in background. Warm natural lighting. Product unchanged.`,
        `${baseContext}\n\nSame product in cozy home environment. Product stays 100% identical. Only add lifestyle context with home accessories or natural setting. Soft ambient lighting. Product untouched.`,
        `${baseContext}\n\nLifestyle product shot in home context. Product must be exactly as is. Only enhance with home elements and natural environment. Inviting atmosphere. Product completely preserved.`,
      ],
      'studio': [
        `${baseContext}\n\nProduct with professional studio setup and dramatic lighting. Product must be entirely unchanged. Only enhance lighting and add studio backdrop elements. High-end professional atmosphere. Product remains identical.`,
        `${baseContext}\n\nSame product with studio photography lighting. Product stays perfectly identical. Only add dramatic lighting effects and professional studio background. Premium quality. Product untouched.`,
        `${baseContext}\n\nStudio product photography with artistic lighting. Product must be exactly as shown. Only enhance with studio lighting and professional backdrop. Sophisticated aesthetic. Product unchanged.`,
      ],
      'random': [
        `${baseContext}\n\nProduct in creative and artistic setting. Product must remain 100% identical. Only add unique and aesthetically pleasing background elements. Creative professional lighting. Product unchanged.`,
        `${baseContext}\n\nSame product in artistic environment. Product stays perfectly identical. Only enhance with creative backdrop and artistic elements. Unique aesthetic. Product untouched.`,
        `${baseContext}\n\nArtistic product photography with creative styling. Product must be exactly as is. Only add artistic background and creative lighting. Beautiful composition. Product completely preserved.`,
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
