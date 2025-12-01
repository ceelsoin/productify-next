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

    // 1. Generate catalog variation (white background)
    // Using createVariation for faithful reproduction
    console.log(`[OpenAI Images] Creating catalog variation (white background)...`);

    try {
      const catalogVariations = await this.createVariations(originalImageUrl, 1);
      if (catalogVariations.length > 0) {
        imageUrls.push(catalogVariations[0]);
        console.log(`[OpenAI Images] Catalog variation created (1/3)`);
      }
    } catch (error) {
      console.error(`[OpenAI Images] Error creating catalog variation:`, error);
      // Try edit as fallback
      try {
        const catalogPrompt = `Make this product photo perfect for a catalog: clean white background, professional lighting, keep the product exactly as it is, only improve the background and lighting`;
        const editedImage = await this.editImage(originalImageUrl, catalogPrompt);
        imageUrls.push(editedImage);
        console.log(`[OpenAI Images] Catalog variation created via edit (1/3)`);
      } catch (editError) {
        console.error(`[OpenAI Images] Edit fallback also failed:`, editError);
        throw error;
      }
    }

    // Delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 2. Create 2 styled variations with user-selected scenario
    console.log(`[OpenAI Images] Creating 2 styled variations (${scenario})...`);
    const scenarioPrompt = this.buildEnhancementPrompt(scenario);

    for (let i = 0; i < 2; i++) {
      try {
        // Use edit to maintain product fidelity while changing background/styling
        const editedImage = await this.editImage(originalImageUrl, scenarioPrompt);
        imageUrls.push(editedImage);
        console.log(`[OpenAI Images] Styled variation ${i + 1}/2 created (${i + 2}/3 total)`);

        // Delay between requests to avoid rate limits
        if (i < 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`[OpenAI Images] Error creating styled variation ${i + 1}:`, error);
        // Try creating a simple variation as fallback
        try {
          const variations = await this.createVariations(originalImageUrl, 1);
          if (variations.length > 0) {
            imageUrls.push(variations[0]);
            console.log(`[OpenAI Images] Styled variation ${i + 1}/2 created via variation (${i + 2}/3 total)`);
          }
        } catch (varError) {
          console.error(`[OpenAI Images] Variation fallback also failed:`, varError);
          // Continue with available images
        }
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
    // Prompts focused on enhancing background/lighting while keeping product EXACTLY as is
    const scenarioPrompts: Record<string, string> = {
      'catalog': 'Replace the background with a pure white background for catalog photography. Keep the product EXACTLY as it is - do not change the product itself, only improve lighting and make background perfectly white and clean.',
      'table': 'Place this product on a beautiful wooden table or desk. Keep the product EXACTLY as it is - only change the background to an elegant wooden surface with natural wood texture and professional lighting.',
      'nature': 'Place this product in a natural outdoor setting with plants and greenery. Keep the product EXACTLY as it is - only change the background to a botanical environment with natural daylight.',
      'minimal': 'Place this product in a minimalist setting with clean geometric shapes and neutral colors. Keep the product EXACTLY as it is - only change the background to a modern minimalist backdrop.',
      'lifestyle': 'Place this product in a lifestyle/home environment. Keep the product EXACTLY as it is - only change the background to a natural home setting with soft natural lighting.',
      'studio': 'Place this product in a professional studio setup with dramatic lighting. Keep the product EXACTLY as it is - only enhance the background and lighting to create a high-end studio atmosphere.',
      'random': 'Place this product in a creative and artistic setting. Keep the product EXACTLY as it is - only change the background to something unique and aesthetically pleasing.',
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
