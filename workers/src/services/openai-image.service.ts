import OpenAI from 'openai';
import sharp from 'sharp';

/**
 * OpenAI Image Generation Service
 * Handles image generation and editing using OpenAI DALL-E 3
 */
class OpenAIImageService {
  private client: OpenAI | null = null;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.warn('[OpenAI Images] API key not configured. Image generation will not work.');
      return;
    }

    try {
      this.client = new OpenAI({ apiKey });
      console.log('[OpenAI Images] Client initialized successfully');
    } catch (error) {
      console.error('[OpenAI Images] Failed to initialize client:', error);
    }
  }

  /**
   * Normalize image to PNG format and ensure it's under 4MB
   * OpenAI requires PNG format and max 4MB for edit/variations
   */
  private async normalizeImage(imageBuffer: Buffer): Promise<Buffer> {
    console.log(`[OpenAI Images] Normalizing image (${imageBuffer.length} bytes)`);

    try {
      // Convert to PNG and resize if needed to stay under 4MB
      let normalized = await sharp(imageBuffer)
        .png({ quality: 100, compressionLevel: 6 })
        .toBuffer();

      console.log(`[OpenAI Images] After PNG conversion: ${normalized.length} bytes`);

      // If still over 4MB, progressively reduce quality
      let quality = 90;
      while (normalized.length > 4 * 1024 * 1024 && quality > 50) {
        console.log(`[OpenAI Images] Image too large, reducing quality to ${quality}%`);
        normalized = await sharp(imageBuffer)
          .png({ quality, compressionLevel: 9 })
          .toBuffer();
        quality -= 10;
      }

      // If still too large, resize dimensions
      if (normalized.length > 4 * 1024 * 1024) {
        console.log(`[OpenAI Images] Still too large, resizing to 1024x1024`);
        normalized = await sharp(imageBuffer)
          .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
          .png({ quality: 80, compressionLevel: 9 })
          .toBuffer();
      }

      const finalSizeMB = (normalized.length / (1024 * 1024)).toFixed(2);
      console.log(`[OpenAI Images] Normalized image: ${finalSizeMB}MB`);

      if (normalized.length > 4 * 1024 * 1024) {
        throw new Error(`Image still too large after normalization: ${finalSizeMB}MB`);
      }

      return normalized;
    } catch (error) {
      console.error(`[OpenAI Images] Error normalizing image:`, error);
      throw error;
    }
  }

  /**
   * Check if the service is configured
   */
  isConfigured(): boolean {
    return this.client !== null;
  }

  /**
   * Generate enhanced product images based on original image
   * Creates faithful variations of the original image: 1 catalog + 2 styled variations
   * Note: Currently limited to square (1024x1024) due to DALL-E 2 API limitations for variations/edits
   */
  async generateEnhancedImages(
    productName: string,
    productDescription: string,
    scenario: string,
    originalImageUrl: string,
    orientation: 'portrait' | 'square' = 'portrait'
  ): Promise<string[]> {
    if (!this.client) {
      throw new Error('OpenAI client not configured. Please set OPENAI_API_KEY.');
    }

    // Note: DALL-E 2 (used for variations and edits) only supports 1024x1024
    // DALL-E 3 doesn't support variations/edits yet, so we're limited to square format
    const imageSize = '1024x1024';
    
    if (orientation === 'portrait') {
      console.log(`[OpenAI Images] ⚠️  Portrait orientation requested but limited to square due to DALL-E 2 API constraints`);
    }
    
    console.log(`[OpenAI Images] Generating 3 enhanced variations from original image`);
    console.log(`[OpenAI Images] Product: ${productName}`);
    console.log(`[OpenAI Images] Original image: ${originalImageUrl}`);
    console.log(`[OpenAI Images] Scenario: ${scenario}`);
    console.log(`[OpenAI Images] Size: ${imageSize} (square format)`);

    const imageUrls: string[] = [];

    try {
      // Strategy: Use createVariations() which maintains HIGH fidelity to original product
      // This API preserves the product's appearance much better than edit/generation
      console.log(`[OpenAI Images] Creating 3 faithful variations of the original product...`);
      
      const variations = await this.createVariations(originalImageUrl, 3);
      
      if (variations.length > 0) {
        imageUrls.push(...variations);
        console.log(`[OpenAI Images] Successfully created ${variations.length}/3 faithful variations`);
      }
      
      // If we got fewer than 3, try to complete with additional requests
      if (variations.length < 3) {
        console.log(`[OpenAI Images] Only got ${variations.length} variations, requesting more...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
          const additionalCount = 3 - variations.length;
          const additional = await this.createVariations(originalImageUrl, additionalCount);
          imageUrls.push(...additional);
          console.log(`[OpenAI Images] Added ${additional.length} more variations, total: ${imageUrls.length}/3`);
        } catch (error) {
          console.error(`[OpenAI Images] Could not get additional variations:`, error);
        }
      }
      
    } catch (error) {
      console.error(`[OpenAI Images] Error in variation creation:`, error);
      
      // Fallback: try edit approach with very strict prompts
      console.log(`[OpenAI Images] Falling back to edit approach...`);
      
      try {
        const catalogPrompt = `Create a professional product photo with clean white background. The product must be EXACTLY identical to the original - same size, same colors, same design, same details, same proportions. Only change the background to pure white and improve lighting. The product itself CANNOT change at all.`;
        const editedImage = await this.editImage(originalImageUrl, catalogPrompt);
        imageUrls.push(editedImage);
        console.log(`[OpenAI Images] Created 1 image via edit (${imageUrls.length}/3)`);
      } catch (editError) {
        console.error(`[OpenAI Images] Edit fallback also failed:`, editError);
        throw error; // Re-throw original error
      }
    }

    console.log(`[OpenAI Images] Successfully generated ${imageUrls.length}/3 images`);
    return imageUrls;
  }

  /**
   * Edit an existing image using DALL-E 2 (image editing)
   * Note: DALL-E 2 only supports 1024x1024 for edits
   */
  async editImage(
    imageUrl: string,
    prompt: string,
    maskUrl?: string
  ): Promise<string> {
    if (!this.client) {
      throw new Error('OpenAI client not configured. Please set OPENAI_API_KEY.');
    }

    console.log(`[OpenAI Images] Editing image with prompt: ${prompt}`);

    try {
      // Download and normalize the image
      const imageBuffer = await this.downloadImage(imageUrl);
      const normalizedBuffer = await this.normalizeImage(imageBuffer);
      
      // Create File object from normalized buffer
      const imageBlob = new Blob([normalizedBuffer], { type: 'image/png' });
      const imageFile = new File([imageBlob], 'image.png', { type: 'image/png' });

      let maskFile: File | undefined;
      if (maskUrl) {
        const maskBuffer = await this.downloadImage(maskUrl);
        const normalizedMaskBuffer = await this.normalizeImage(maskBuffer);
        const maskBlob = new Blob([normalizedMaskBuffer], { type: 'image/png' });
        maskFile = new File([maskBlob], 'mask.png', { type: 'image/png' });
      }

      const response = await this.client.images.edit({
        image: imageFile,
        mask: maskFile,
        prompt,
        n: 1,
        size: '1024x1024', // DALL-E 2 only supports 1024x1024
      });

      if (response.data && response.data.length > 0 && response.data[0].url) {
        console.log(`[OpenAI Images] Image edited successfully`);
        return response.data[0].url;
      }

      throw new Error('No image returned from OpenAI');
    } catch (error) {
      console.error(`[OpenAI Images] Error editing image:`, error);
      throw error;
    }
  }

  /**
   * Create variations of an existing image
   * Note: DALL-E 2 only supports 1024x1024 for variations
   */
  async createVariations(
    imageUrl: string,
    count: number = 1
  ): Promise<string[]> {
    if (!this.client) {
      throw new Error('OpenAI client not configured. Please set OPENAI_API_KEY.');
    }

    console.log(`[OpenAI Images] Creating ${count} variation(s)`);

    try {
      // Download the image
      const imageBuffer = await this.downloadImage(imageUrl);
      
      // Normalize to PNG and ensure under 4MB
      const normalizedBuffer = await this.normalizeImage(imageBuffer);
      
      // Create File object from normalized buffer
      const imageBlob = new Blob([normalizedBuffer], { type: 'image/png' });
      const imageFile = new File([imageBlob], 'image.png', { type: 'image/png' });

      const response = await this.client.images.createVariation({
        image: imageFile,
        n: Math.min(count, 10), // OpenAI limits to 10 variations
        size: '1024x1024', // DALL-E 2 only supports 1024x1024
      });

      const imageUrls = (response.data || [])
        .filter(img => img.url)
        .map(img => img.url!);

      console.log(`[OpenAI Images] Created ${imageUrls.length} variation(s)`);
      return imageUrls;
    } catch (error) {
      console.error(`[OpenAI Images] Error creating variations:`, error);
      throw error;
    }
  }

  /**
   * Build enhancement prompt for image editing (faithful to original)
   */
  private buildEnhancementPrompt(scenario: string): string {
    // Prompts designed to preserve the product EXACTLY as is
    // Only modify background and lighting
    const scenarioPrompts: Record<string, string> = {
      'catalog': 'Professional product photography with pure solid white background (#FFFFFF). The product must remain completely unchanged - same colors, same shape, same details, same proportions. Only replace the background with clean white and add professional studio lighting. No modifications to the product itself.',
      
      'table': 'The exact same product photographed on an elegant wooden table or surface. Product must be 100% identical - same size, same colors, same design, same details. Only add a beautiful wooden table/surface underneath and improve lighting. The product itself cannot change at all.',
      
      'nature': 'The exact same product in a natural botanical setting with plants and greenery in the background. Product must remain perfectly identical - same appearance, same proportions, same colors. Only add natural elements like plants, leaves, or flowers in the background. Professional natural daylight. The product is untouched.',
      
      'minimal': 'The exact same product in a minimalist modern setting with clean geometric shapes and neutral tones. Product must be completely unchanged - same design, same colors, same features. Only add minimalist geometric elements or clean neutral background. The product remains exactly as it is.',
      
      'lifestyle': 'The exact same product in a lifestyle home environment. Product must be 100% identical - same look, same details, same colors. Only add lifestyle elements like furniture, fabrics, or home decor in the background. Natural home lighting. Product is completely preserved.',
      
      'studio': 'The exact same product with professional studio photography setup and dramatic lighting. Product must remain entirely unchanged - same shape, same colors, same design. Only enhance lighting and add studio backdrop/elements. The product itself is untouched.',
      
      'random': 'The exact same product in a creative and aesthetically pleasing setting. Product must be perfectly identical - same appearance, same proportions, same colors. Only add artistic background elements and professional lighting. The product cannot change.',
    };

    return scenarioPrompts[scenario] || scenarioPrompts['catalog'];
  }

  /**
   * Download image from URL to Buffer
   */
  async downloadImage(url: string): Promise<Buffer> {
    console.log(`[OpenAI Images] Downloading image from: ${url}`);
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      console.log(`[OpenAI Images] Downloaded ${buffer.length} bytes`);
      return buffer;
    } catch (error) {
      console.error(`[OpenAI Images] Error downloading image:`, error);
      throw error;
    }
  }
}

export const openAIImageService = new OpenAIImageService();
