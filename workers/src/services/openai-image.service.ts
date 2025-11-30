import OpenAI from 'openai';

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
   * Check if the service is configured
   */
  isConfigured(): boolean {
    return this.client !== null;
  }

  /**
   * Generate enhanced product images using DALL-E 3
   * Always generates 3 images: 1 catalog (white background) + 2 with chosen style
   */
  async generateEnhancedImages(
    productName: string,
    productDescription: string,
    scenario: string
  ): Promise<string[]> {
    if (!this.client) {
      throw new Error('OpenAI client not configured. Please set OPENAI_API_KEY.');
    }

    console.log(`[OpenAI Images] Generating 3 images for product: ${productName}`);
    console.log(`[OpenAI Images] Scenario: ${scenario}`);

    const imageUrls: string[] = [];

    // 1. Generate catalog image (white background)
    const catalogPrompt = this.buildPrompt(productName, productDescription, 'catalog');
    console.log(`[OpenAI Images] Generating catalog image...`);
    console.log(`[OpenAI Images] Catalog prompt: ${catalogPrompt.substring(0, 150)}...`);

    try {
      const catalogResponse = await this.client.images.generate({
        model: 'dall-e-3',
        prompt: catalogPrompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        style: 'natural', // Natural style for catalog images
      });

      if (catalogResponse.data && catalogResponse.data.length > 0 && catalogResponse.data[0].url) {
        imageUrls.push(catalogResponse.data[0].url);
        console.log(`[OpenAI Images] Catalog image generated (1/3)`);
      }
    } catch (error) {
      console.error(`[OpenAI Images] Error generating catalog image:`, error);
      throw error;
    }

    // Delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 2. Generate 2 images with user-selected scenario
    const scenarioPrompt = this.buildPrompt(productName, productDescription, scenario);
    console.log(`[OpenAI Images] Generating scenario images (${scenario})...`);
    console.log(`[OpenAI Images] Scenario prompt: ${scenarioPrompt.substring(0, 150)}...`);

    for (let i = 0; i < 2; i++) {
      try {
        const response = await this.client.images.generate({
          model: 'dall-e-3',
          prompt: scenarioPrompt,
          n: 1,
          size: '1024x1024',
          quality: 'standard',
          style: 'vivid', // Vivid style for lifestyle/scenario images
        });

        if (response.data && response.data.length > 0 && response.data[0].url) {
          imageUrls.push(response.data[0].url);
          console.log(`[OpenAI Images] Scenario image ${i + 1}/2 generated (${i + 2}/3 total)`);
        }

        // Delay between requests to avoid rate limits
        if (i < 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`[OpenAI Images] Error generating scenario image ${i + 1}:`, error);
        // Continue with available images even if one fails
      }
    }

    console.log(`[OpenAI Images] Successfully generated ${imageUrls.length}/3 images`);
    return imageUrls;
  }

  /**
   * Edit an existing image using DALL-E 2 (image editing)
   * Note: DALL-E 3 doesn't support image editing yet
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
      // Download the image
      const imageResponse = await fetch(imageUrl);
      const imageBlob = await imageResponse.blob();
      const imageFile = new File([imageBlob], 'image.png', { type: 'image/png' });

      let maskFile: File | undefined;
      if (maskUrl) {
        const maskResponse = await fetch(maskUrl);
        const maskBlob = await maskResponse.blob();
        maskFile = new File([maskBlob], 'mask.png', { type: 'image/png' });
      }

      const response = await this.client.images.edit({
        image: imageFile,
        mask: maskFile,
        prompt,
        n: 1,
        size: '1024x1024',
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
      const imageResponse = await fetch(imageUrl);
      const imageBlob = await imageResponse.blob();
      const imageFile = new File([imageBlob], 'image.png', { type: 'image/png' });

      const response = await this.client.images.createVariation({
        image: imageFile,
        n: Math.min(count, 10), // OpenAI limits to 10 variations
        size: '1024x1024',
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
   * Build a detailed prompt for image generation
   */
  private buildPrompt(
    productName: string,
    productDescription: string,
    scenario: string
  ): string {
    // Map scenario to descriptive prompts (matching frontend scenarios)
    const scenarioPrompts: Record<string, string> = {
      'catalog': 'on a pure white background, professional catalog photography, clean and isolated product, studio lighting, no shadows, high quality, crisp and clear, commercial catalog style',
      'table': 'on a professional wooden table or desk, elegant surface, natural wood texture, soft studio lighting, professional product photography, realistic shadows, clean and organized composition',
      'nature': 'in a natural outdoor setting with plants and greenery, organic environment, natural daylight, botanical background, fresh and eco-friendly atmosphere, professional nature photography',
      'minimal': 'in a minimalist setting, clean geometric shapes, neutral colors, modern and simple backdrop, minimal distractions, contemporary design, professional minimalist photography',
      'lifestyle': 'in a lifestyle setting, home or everyday environment, natural scene with relevant context, realistic usage scenario, soft natural lighting, aesthetically pleasing composition, relatable atmosphere',
      'studio': 'in a professional photography studio setup, dramatic lighting, elegant backdrop, perfect shadows and highlights, high-end commercial photography, sophisticated atmosphere',
      'random': 'in a creative and unique setting, artistic composition, interesting background, professional photography with creative flair, unexpected but aesthetically pleasing environment',
    };

    const scenarioDescription = scenarioPrompts[scenario] || scenarioPrompts['catalog'];

    let prompt = `Professional product photography of ${productName}`;
    
    if (productDescription) {
      prompt += `, ${productDescription}`;
    }

    prompt += `, ${scenarioDescription}. 8K resolution, highly detailed, realistic, commercial photography style.`;

    return prompt;
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
