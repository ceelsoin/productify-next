import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { s3Service } from './s3.service';

/**
 * Kie.ai API Response Types
 */
interface KieTaskResponse {
  data: {
    task_id: string;
    status: string;
    error?: string;
  };
}

interface KieStatusResponse {
  data: {
    task_id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    output?: {
      images?: Array<{
        url: string;
      }>;
    };
    error?: string;
  };
}

interface KieUploadResponse {
  data: {
    url: string;
  };
}

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
   * Generate enhanced product images with multiple variations per prompt
   * More efficient: 1 API call per prompt type, gets multiple variations
   * Creates N variations × M prompts images (e.g., 4 variations × 4 prompts = 16 images)
   */
  async generateEnhancedImagesWithVariations(
    productName: string,
    productDescription: string,
    scenario: string,
    originalImageUrl: string,
    variationsPerPrompt: number = 4
  ): Promise<string[]> {
    const kieApiKey = process.env.KIE_API_KEY;
    
    if (!kieApiKey) {
      throw new Error('KIE_API_KEY not configured. Please set KIE_API_KEY environment variable.');
    }

    console.log(`[Gemini Images] Generating ${variationsPerPrompt} variations per prompt via Kie.ai`);
    console.log(`[Gemini Images] Product: ${productName}`);
    console.log(`[Gemini Images] Original image: ${originalImageUrl}`);
    console.log(`[Gemini Images] Scenario: ${scenario}`);

    try {
      // Upload original image to S3 for public access (Kie.ai needs public URL)
      console.log(`[Gemini Images] Uploading image to S3...`);
      const publicImageUrl = await this.uploadImageToS3(originalImageUrl);
      console.log(`[Gemini Images] Image uploaded to S3: ${publicImageUrl}`);

      // Analyze product context
      const productContext = await this.analyzeProductContextSimple(
        productName,
        productDescription,
        scenario
      );
      console.log(`[Gemini Images] Product context:`, productContext);

      // Build prompts for 4 types (catalog + 3 scenario)
      const prompts = this.buildVariationPromptsForEdit(
        productName,
        productDescription,
        scenario,
        productContext
      );

      console.log(`[Gemini Images] Will generate ${variationsPerPrompt} variations for each of ${prompts.length} prompts`);

      // Generate variations for each prompt (4 prompts → 4×variationsPerPrompt images)
      const imagePromises = prompts.map((prompt, index) => {
        const imageType = index === 0 ? 'CATALOG' : `${scenario.toUpperCase()} ${index}`;
        console.log(`[Gemini Images] Queuing ${variationsPerPrompt}x ${imageType} (${index + 1}/${prompts.length})`);
        
        return this.editImageWithPrompt(
          publicImageUrl,
          prompt,
          'JPEG',
          'auto',
          variationsPerPrompt // Generate multiple variations
        ).then(url => {
          console.log(`[Gemini Images] ${imageType} completed: ${url}`);
          return url;
        }).catch(error => {
          console.error(`[Gemini Images] ${imageType} failed:`, error);
          throw error;
        });
      });

      // Wait for all images to complete
      const imageUrls = await Promise.all(imagePromises);

      console.log(`[Gemini Images] Successfully generated ${imageUrls.length} images via Kie.ai`);
      return imageUrls;

    } catch (error) {
      console.error(`[Gemini Images] Error in image generation:`, error);
      throw error;
    }
  }

  /**
   * Generate enhanced product images based on original image
   * Uses Kie.ai Nano Banana Edit API for all image generation
   * Creates 4 high-quality variations: 1 catalog (white bg) + 3 scenario-specific
   */
  async generateEnhancedImages(
    productName: string,
    productDescription: string,
    scenario: string,
    originalImageUrl: string
  ): Promise<string[]> {
    const kieApiKey = process.env.KIE_API_KEY;
    
    if (!kieApiKey) {
      throw new Error('KIE_API_KEY not configured. Please set KIE_API_KEY environment variable.');
    }

    console.log(`[Gemini Images] Generating 4 enhanced variations via Kie.ai Nano Banana Edit`);
    console.log(`[Gemini Images] Product: ${productName}`);
    console.log(`[Gemini Images] Original image: ${originalImageUrl}`);
    console.log(`[Gemini Images] Scenario: ${scenario}`);

    try {
      // Upload original image to S3 for public access (Kie.ai needs public URL)
      console.log(`[Gemini Images] Uploading image to S3...`);
      const publicImageUrl = await this.uploadImageToS3(originalImageUrl);
      console.log(`[Gemini Images] Image uploaded to S3: ${publicImageUrl}`);

      // Analyze product context
      const productContext = await this.analyzeProductContextSimple(
        productName,
        productDescription,
        scenario
      );
      console.log(`[Gemini Images] Product context:`, productContext);

      // Build prompts for 4 variations
      const prompts = this.buildVariationPromptsForEdit(
        productName,
        productDescription,
        scenario,
        productContext
      );

      console.log(`[Gemini Images] Generated ${prompts.length} edit prompts`);

      // Option 1: Generate 4 images with 4 API calls (current approach)
      // Option 2: Generate 4 variations per prompt with 1 API call per prompt (4x more efficient)
      // For now, using Option 1 (4 separate calls) as it gives more control
      // To enable Option 2, uncomment the numVariations parameter below
      
      const imagePromises = prompts.map((prompt, index) => {
        const imageType = index === 0 ? 'CATALOG' : `${scenario.toUpperCase()} ${index}`;
        console.log(`[Gemini Images] Queuing ${imageType} (${index + 1}/4)`);
        
        return this.editImageWithPrompt(
          publicImageUrl,
          prompt,
          'JPEG',
          'auto'
          // numVariations: 4 // Uncomment to get 4 variations per prompt
        ).then(url => {
          console.log(`[Gemini Images] ${imageType} completed: ${url}`);
          return url;
        }).catch(error => {
          console.error(`[Gemini Images] ${imageType} failed:`, error);
          throw error;
        });
      });

      // Wait for all images to complete
      const imageUrls = await Promise.all(imagePromises);

      console.log(`[Gemini Images] Successfully generated ${imageUrls.length}/4 images via Kie.ai`);
      return imageUrls;

    } catch (error) {
      console.error(`[Gemini Images] Error in image generation:`, error);
      throw error;
    }
  }

  /**
   * Analyze product context to understand proper placement (simplified for Kie.ai)
   */
  private async analyzeProductContextSimple(
    productName: string,
    productDescription: string,
    scenario: string
  ): Promise<{
    category: string;
    mounting: string;
    size: string;
    usage: string;
    placement: string;
  }> {
    // Simple heuristic-based analysis since Kie.ai handles the AI part
    const lowerName = productName.toLowerCase();
    const lowerDesc = (productDescription || '').toLowerCase();
    
    let category = 'general product';
    let mounting = 'sits on surface';
    let placement = 'on flat surface';
    
    // Detect wall-mounted items
    if (lowerName.includes('quadro') || lowerName.includes('poster') || 
        lowerName.includes('placa') || lowerDesc.includes('parede')) {
      category = 'wall decor';
      mounting = 'hangs on wall';
      placement = 'hanging on wall';
    }
    // Detect wearable items
    else if (lowerName.includes('colar') || lowerName.includes('brinco') || 
             lowerName.includes('anel') || lowerName.includes('pulseira')) {
      category = 'jewelry';
      mounting = 'worn';
      placement = 'displayed on surface or worn';
    }
    // Detect small desk items
    else if (lowerName.includes('caneca') || lowerName.includes('vaso') || 
             lowerName.includes('porta') || lowerName.includes('organizador')) {
      category = 'desk accessory';
      mounting = 'sits on surface';
      placement = 'on desk or table';
    }
    
    return {
      category,
      mounting,
      size: 'medium',
      usage: 'functional',
      placement,
    };
  }

  /**
   * Build variation prompts specifically for Kie.ai Nano Banana Edit
   * Returns array of 4 prompts: 1 catalog + 3 scenario
   */
  private buildVariationPromptsForEdit(
    productName: string,
    productDescription: string,
    scenario: string,
    productContext: {
      category: string;
      mounting: string;
      size: string;
      usage: string;
      placement: string;
    }
  ): string[] {
    const baseContext = `This is a product photo of: ${productName}.
${productDescription ? `Description: ${productDescription}` : ''}
Product category: ${productContext.category}
How displayed: ${productContext.mounting}
Best placement: ${productContext.placement}`;

    // CATALOG PROMPT
    const catalogPrompt = `${baseContext}

CRITICAL: Keep the product 100% IDENTICAL - same shape, colors, textures, details. Only change the background.

Transform this into a professional catalog image:
- Background: Pure solid white (#FFFFFF) - completely clean, no gradients or textures
- Product: Perfectly centered
- Lighting: Professional studio 3-point lighting - soft, diffused, even
- Shadow: Minimal subtle shadow directly under product for depth
- Style: E-commerce product photography (Amazon/Apple style)
- Quality: Crystal clear, sharp details, true colors
- NO props or decorations

Keep product unchanged.`;

    // SCENARIO PROMPTS
    const scenarioPrompts = this.buildScenarioPromptsForEdit(
      baseContext,
      scenario,
      productContext
    );

    return [catalogPrompt, ...scenarioPrompts];
  }

  /**
   * Build 3 scenario-specific prompts for Kie.ai Edit
   */
  private buildScenarioPromptsForEdit(
    baseContext: string,
    scenario: string,
    productContext: { mounting: string; placement: string }
  ): string[] {
    const mountingNote = productContext.mounting.toLowerCase().includes('wall') || 
                        productContext.mounting.toLowerCase().includes('hang')
      ? `⚠️ THIS PRODUCT HANGS ON WALL - Show it mounted on wall, NOT on table!`
      : '';

    const scenarioTemplates: Record<string, string[]> = {
      table: [
        `${baseContext}

CRITICAL: Keep product identical. Only change environment.
${mountingNote}

Create natural wood table scene:
${productContext.mounting.includes('wall') 
  ? '- Background: Wooden wall/paneling with product hanging as intended'
  : '- Surface: Beautiful oak/walnut table with natural grain'}
- Lighting: Soft natural window light (golden hour)
- Background: Softly blurred room/café (bokeh)
- Atmosphere: Warm, inviting, cozy
- Style: Lifestyle product photography`,

        `${baseContext}

CRITICAL: Keep product identical. Only change environment.
${mountingNote}

Create rustic wood environment:
${productContext.mounting.includes('wall')
  ? '- Background: Reclaimed wood wall with product mounted'
  : '- Surface: Reclaimed wooden desk with character'}
- Lighting: Bright natural daylight
- Background: Defocused creative workspace
- Mood: Artisan, authentic
- Quality: Professional lifestyle`,

        `${baseContext}

CRITICAL: Keep product identical. Only change environment.
${mountingNote}

Create elegant wood setting:
${productContext.mounting.includes('wall')
  ? '- Background: Dark wood paneling with product displayed'
  : '- Surface: Polished mahogany/cherry wood table'}
- Lighting: Balanced natural and ambient
- Background: Upscale interior
- Feel: Premium, refined, elegant`,
      ],
      nature: [
        `${baseContext}

CRITICAL: Keep product identical. Only change environment.

Botanical garden scene:
- Plants: Lush monstera, ferns, palm fronds around product
- Background: Heavily blurred green foliage with bokeh
- Lighting: Filtered sunlight through leaves
- Colors: Rich greens, fresh atmosphere
- Product: Clear focal point with natural frame`,

        `${baseContext}

CRITICAL: Keep product identical. Only change environment.

Garden oasis:
- Greenery: Moss, ferns, soft succulents
- Flowers: Small white/pastel blooms as accent
- Background: Dreamy out-of-focus garden
- Lighting: Soft morning/afternoon sun
- Feel: Peaceful, natural, sustainable`,

        `${baseContext}

CRITICAL: Keep product identical. Only change environment.

Wild nature:
- Base: Natural moss or forest floor
- Plants: Wild grasses, wildflowers, woodland ferns
- Background: Soft-focus landscape
- Lighting: Natural outdoor diffused light
- Mood: Raw, authentic, eco-conscious`,
      ],
      minimal: [
        `${baseContext}

CRITICAL: Keep product identical. Only change background.

Geometric minimalism:
- Shapes: Simple arches, circles, blocks (2-3 geometric forms)
- Materials: Matte plaster, smooth concrete
- Colors: Neutrals - off-white, beige, warm gray
- Background: Subtle gradient neutral
- Shadows: Clean geometric shadows
- Style: Scandinavian contemporary`,

        `${baseContext}

CRITICAL: Keep product identical. Only change background.

Abstract minimalism:
- Elements: Overlapping circles, curved forms
- Texture: Ultra-smooth matte surfaces
- Palette: Monochromatic or analogous colors
- Lighting: Diffused with subtle shadows
- Composition: Asymmetric balance
- Style: Kinfolk/Cereal aesthetic`,

        `${baseContext}

CRITICAL: Keep product identical. Only change background.

Contemporary minimalism:
- Structure: Simple platforms, steps, pedestals
- Material: Smooth plaster, painted wood
- Colors: Dove gray, warm white, sand, stone
- Lighting: Natural window light quality
- Shadows: Clean, defined
- Style: Modern architecture, Japanese minimalism`,
      ],
      lifestyle: [
        `${baseContext}

CRITICAL: Keep product identical. Only change setting.

Cozy home living:
- Setting: Modern living room/bedroom
- Surface: Coffee table/nightstand/counter
- Background: Soft-focus sofa, cushions, bedding
- Decor: Ceramic vase, candle, plant barely visible
- Lighting: Warm natural window light
- Textiles: Hint of linen, cotton in neutrals
- Feel: Inviting, comfortable, hygge`,

        `${baseContext}

CRITICAL: Keep product identical. Only change setting.

Morning routine:
- Location: Kitchen counter/bathroom vanity/breakfast nook
- Context: Morning light, coffee time
- Props: Defocused French press, mug, potted herb
- Surface: Natural stone, marble, light wood
- Background: Soft bokeh modern home
- Lighting: Fresh morning sunlight
- Mood: Aspirational, slow living`,

        `${baseContext}

CRITICAL: Keep product identical. Only change setting.

Stylish living space:
- Placement: Elegant side table/modern console
- Surroundings: High-end interior in soft focus
- Background: Modern furniture, art edge
- Lighting: Balanced natural and ambient
- Accessories: Design books, sculptural object (defocused)
- Palette: Sophisticated neutrals with accent
- Mood: Curated, design-conscious`,
      ],
      studio: [
        `${baseContext}

CRITICAL: Keep product identical. Only change lighting/backdrop.

Dramatic studio:
- Background: Deep gradient charcoal to black
- Setup: Three-point lighting with rim lights
- Key light: Strong directional from 45 degrees
- Rim lighting: Bright highlights on edges
- Effects: Optional light rays or subtle haze
- Mood: Bold, luxury, high-end commercial`,

        `${baseContext}

CRITICAL: Keep product identical. Only change lighting/backdrop.

Colored gel studio:
- Background: Gradient jewel tones (sapphire, purple, burgundy)
- Lighting: Professional gels creating color washes
- Main: Neutral key light on product
- Accents: Colored rim lights (blue, purple, amber, cyan)
- Style: Music video, fashion editorial
- Mood: Bold, energetic, contemporary`,

        `${baseContext}

CRITICAL: Keep product identical. Only change lighting/backdrop.

Cinematic studio:
- Background: Solid dark backdrop with texture
- Lighting: Film-quality strong key with negative fill
- Technique: Spotlight with fall-off vignette
- Atmosphere: Fine mist or dust in light beams
- Highlights: Strategic specular reflections
- Style: Blockbuster advertising
- Quality: Ultra-premium`,
      ],
      random: [
        `${baseContext}

CRITICAL: Keep product identical. Only change background creatively.

Creative unexpected (choose ONE):
- Urban: Colorful graffiti/street art backdrop
- Neon: Dark scene with neon accents (pink/blue/cyan)
- Texture: Interesting material (brushed metal/concrete/marble)
- Light Art: Bokeh lights, fiber optics, light painting
- Reflection: Glossy surface mirror or water reflections
- Artistic: Watercolor wash, ink in water, paint splatter

Product sharp and true colors, experimental background.`,

        `${baseContext}

CRITICAL: Keep product identical. Only change background artistically.

Artistic composition (choose ONE):
- Material Mix: Velvet + marble + brass combinations
- Color Block: Bold solids (Klein blue, millennial pink, emerald)
- Pattern: Geometric patterns, terrazzo, Memphis design
- Organic: Flowing fabric, billowing smoke, liquid splash
- Architectural: Window shadows, staircase geometry
- Phenomena: Prism effects, rainbow refractions

Magazine editorial quality (Vogue, Wallpaper, Kinfolk).`,

        `${baseContext}

CRITICAL: Keep product identical. Only change background boldly.

Bold statement (choose ONE):
- Metallic: Rose gold/copper/silver foil with reflections
- Gradient: Bold color gradients (sunset/ocean/aurora)
- Dimensional: Impossible geometry, Escher perspectives
- Maximalist: Controlled chaos with complementary elements
- Monochrome: All one color family with tonal variations
- Atmospheric: Visible fog, mist, or dramatic light

Viral potential, scroll-stopping, professional execution.`,
      ],
    };

    return scenarioTemplates[scenario] || scenarioTemplates.random;
  }

  /**
   * Analyze product context to understand proper placement and characteristics
   */
  private async analyzeProductContext(
    base64Image: string,
    mimeType: string,
    productName: string,
    productDescription: string
  ): Promise<{
    category: string;
    mounting: string;
    size: string;
    usage: string;
    placement: string;
  }> {
    if (!this.model) {
      throw new Error('Model not initialized');
    }

    try {
      const analysisPrompt = `Analyze this product image and provide context for photography placement.

Product Name: ${productName}
Description: ${productDescription || 'Not provided'}

Please analyze and respond in JSON format with these fields:
{
  "category": "What type of product is this? (e.g., wall decor, desk accessory, jewelry, electronics, clothing, etc.)",
  "mounting": "How is this product displayed/used? (e.g., hangs on wall, sits on surface, worn, held, mounted, etc.)",
  "size": "Approximate size category (e.g., small/pocket-sized, medium/hand-sized, large/desktop, extra-large)",
  "usage": "Primary use context (e.g., decoration, functional tool, wearable, display piece, etc.)",
  "placement": "Best photography placement (e.g., hanging on wall, on flat surface, worn by model, held in hand, mounted display, etc.)"
}

Be specific and practical for product photography. Consider what makes sense for this actual product.`;

      const result = await this.model.generateContent([
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
        analysisPrompt,
      ]);

      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const context = JSON.parse(jsonMatch[0]);
        return context;
      }

      // Fallback
      return {
        category: 'general product',
        mounting: 'sits on surface',
        size: 'medium',
        usage: 'functional',
        placement: 'on flat surface'
      };
    } catch (error) {
      console.error('[Gemini Images] Error analyzing product context:', error);
      // Return safe defaults
      return {
        category: 'general product',
        mounting: 'sits on surface',
        size: 'medium',
        usage: 'functional',
        placement: 'on flat surface'
      };
    }
  }

  /**
   * Build variation prompts: 1 catalog (white bg) + 3 scenario-specific
   * Prompts emphasize keeping the product IDENTICAL while changing background/lighting
   * Uses product context analysis for appropriate placement
   */
  private buildVariationPrompts(
    productName: string,
    productDescription: string,
    scenario: string,
    productContext: {
      category: string;
      mounting: string;
      size: string;
      usage: string;
      placement: string;
    }
  ): string[] {
    const baseContext = `Product: ${productName}${productDescription ? `\nDescription: ${productDescription}` : ''}
Product Type: ${productContext.category}
How it's used: ${productContext.mounting}
Size: ${productContext.size}
Best placement for photos: ${productContext.placement}`;
    
    // FIRST PROMPT: Always catalog style with white background
    const catalogPrompt = `${baseContext}

CRITICAL INSTRUCTION: Keep the product 100% IDENTICAL - same shape, colors, textures, proportions, and all details. DO NOT modify the product in any way.

CATALOG IMAGE REQUIREMENTS:
- Background: Pure solid opaque white (#FFFFFF or rgb(255,255,255)) - NO gradients, textures, or shadows on background
- Product: Perfectly centered in frame
- Lighting: Professional 3-point studio lighting - soft, diffused, even illumination from multiple angles
- Shadow: Minimal subtle shadow directly under product (10-15% gray opacity) for depth
- Quality: Crystal clear focus, sharp details, high resolution
- Style: E-commerce catalog photography (like Amazon, Apple product pages)
- Exposure: Bright but not overexposed, showing true product colors
- NO props, decorations, or background elements - just product on white
- Extras: if product is an accessory of another product, try to include the main product mockup beside or near it

The product itself must remain COMPLETELY UNCHANGED.`;

    // SCENARIO-SPECIFIC PROMPTS (3 variations)
    const scenarioPrompts: Record<string, string[]> = {
      'catalog': [
        `${baseContext}

CRITICAL: Keep product 100% identical. Only change background and lighting.

PREMIUM CATALOG VARIATION:
- Background: Pure white with subtle gradient shadow (5% gray)
- Angle: Slightly elevated view (15-20 degrees) showing product dimensionality
- Lighting: Soft box lighting wrapping evenly around product
- Focus: Razor sharp on all surfaces and details
- Quality: Luxury product photography standard
- True-to-life color accuracy

Product unchanged.`,

        `${baseContext}

CRITICAL: Keep product 100% identical. Only change background and lighting.

CLEAN CATALOG VARIATION:
- Background: Pristine solid white backdrop
- Lighting: Butterfly lighting creating elegant shadow beneath
- Clarity: Perfect focus showing every product feature
- Exposure: Bright high-key lighting with no hot spots
- Style: Print catalog ready, professional commercial quality

Product unchanged.`,

        `${baseContext}

CRITICAL: Keep product 100% identical. Only change background and lighting.

MINIMAL CATALOG VARIATION:
- Background: Pure white with barely visible reflection
- Lighting: Overhead diffused light with side fill
- Shadow: Soft realistic shadow for grounding
- Details: All product features clearly visible
- Quality: Magazine-quality product shot

Product unchanged.`,
      ],
      'table': [
        `${baseContext}

CRITICAL: Keep product 100% identical. Only change surface and environment.

IMPORTANT PLACEMENT RULE: 
${productContext.mounting.toLowerCase().includes('wall') || productContext.mounting.toLowerCase().includes('hang') 
  ? '⚠️ THIS PRODUCT HANGS ON A WALL - Show it mounted on a wall in background, NOT laying on table surface!'
  : productContext.mounting.toLowerCase().includes('worn') || productContext.mounting.toLowerCase().includes('jewelry')
  ? '⚠️ THIS IS A WEARABLE ITEM - Show it displayed/presented on surface, not randomly placed'
  : '✓ This product sits on surfaces - Show it naturally placed on the table'}

NATURAL WOOD SURFACE SCENE:
- Setting: ${productContext.placement}
${productContext.mounting.toLowerCase().includes('wall') || productContext.mounting.toLowerCase().includes('hang')
  ? `- Background: Wooden wall or wood-paneled background where product is displayed
- Product Position: Hanging/mounted on the wooden surface as intended
- Angle: Straight-on or slightly angled to show it properly mounted`
  : `- Surface: Beautiful oak or walnut table with visible natural grain
- Product Position: Naturally resting/sitting on the wooden surface
- Texture: Rich wood with semi-matte finish`}
- Lighting: Soft natural window light from side (golden hour, 4000-5000K)
- Shadow: Gentle natural shadows following light direction
- Background: Softly blurred room or café setting (bokeh effect)
- Atmosphere: Warm, inviting, cozy

Product unchanged.`,

        `${baseContext}

CRITICAL: Keep product 100% identical. Only change surface and environment.

PLACEMENT INSTRUCTION: ${productContext.placement}
${productContext.mounting.toLowerCase().includes('wall') || productContext.mounting.toLowerCase().includes('hang')
  ? '⚠️ WALL-MOUNTED PRODUCT - Must show hanging on wall, not on table!'
  : ''}

RUSTIC WOOD ENVIRONMENT:
${productContext.mounting.toLowerCase().includes('wall') || productContext.mounting.toLowerCase().includes('hang')
  ? `- Background: Reclaimed wood wall or barn wood paneling
- Display: Product properly mounted/hanging as designed
- Wood: Distressed finish with character and patina`
  : `- Surface: Reclaimed wooden desk or workbench with character
- Placement: Product sitting naturally on surface
- Wood type: Lighter tones (pine, birch) with visible wear`}
- Lighting: Bright natural daylight creating clean shadows
- Background: Defocused home office or creative space
- Mood: Artisan, authentic, crafted feel
- Quality: Professional lifestyle photography

Product unchanged.`,

        `${baseContext}

CRITICAL: Keep product 100% identical. Only change surface and environment.

CONTEXT-AWARE PLACEMENT: Based on product analysis - ${productContext.mounting}

ELEGANT WOOD SETTING:
${productContext.mounting.toLowerCase().includes('wall') || productContext.mounting.toLowerCase().includes('hang')
  ? `- Environment: Sophisticated interior with dark wood wall paneling
- Mounting: Product displayed as intended (hanging/mounted)
- Wood: Polished mahogany or walnut paneling with elegant finish`
  : `- Surface: Polished dark mahogany or cherry wood table
- Placement: Product elegantly positioned on surface
- Finish: Semi-gloss premium furniture grade`}
- Lighting: Balanced natural and ambient interior lighting
- Background: Upscale interior space with refined atmosphere
- Palette: Rich browns, warm ambers, sophisticated tones
- Feel: Premium, refined, elegant presentation

Product unchanged.`,
      ],
      'nature': [
        `${baseContext}

CRITICAL: Keep product 100% identical. Only change environment.

BOTANICAL GARDEN:
- Plants: Lush monstera leaves, ferns, or palm fronds around product
- Additional: Eucalyptus sprigs, ivy, or tropical flowers (NOT covering product)
- Background: Heavily blurred green foliage with bokeh
- Lighting: Filtered natural sunlight through leaves (dappled, soft)
- Colors: Rich emerald, forest green, sage with light spots
- Atmosphere: Fresh, organic, eco-friendly
- Composition: Product clear focal point, plants frame naturally
- Depth: Strong foreground/background blur

Product unchanged.`,

        `${baseContext}

CRITICAL: Keep product 100% identical. Only change environment.

GARDEN OASIS:
- Greenery: Mix of moss, fern leaves, soft succulent forms
- Flowers: Small white or pastel blooms as minimal accent
- Elements: Small stones, bark, or natural fiber nearby
- Background: Dreamy out-of-focus garden with green gradient
- Lighting: Soft morning or afternoon sun (golden, gentle shadows)
- Palette: Lime to deep forest greens
- Feel: Peaceful, natural, sustainable
- Balance: Asymmetrical with nature framing product

Product unchanged.`,

        `${baseContext}

CRITICAL: Keep product 100% identical. Only change environment.

WILD NATURE:
- Base: Natural moss bed or forest floor aesthetic
- Plants: Wild grasses, clover, small wildflowers, woodland ferns
- Texture: Bark, lichen, or river stones for depth
- Background: Soft-focus landscape (trees, meadow, water)
- Lighting: Natural outdoor light diffused by clouds
- Atmosphere: Raw, authentic, eco-conscious
- Colors: Earth tones with vibrant green accents
- Mood: Grounded, adventurous

Product unchanged.`,
      ],
      'minimal': [
        `${baseContext}

CRITICAL: Keep product 100% identical. Only change background.

GEOMETRIC MINIMALISM:
- Shapes: Simple arches, circles, rectangular blocks (2-3 geometric forms)
- Materials: Matte plaster, smooth concrete, or painted surfaces
- Colors: Neutral palette - off-white, beige, warm gray, soft taupe
- Background: Subtle gradient from light to slightly darker neutral
- Lighting: Soft directional light creating clean geometric shadows
- Shadows: Sharp-edged from geometric objects for visual interest
- Space: Balanced negative space, rule of thirds
- Style: Scandinavian, contemporary art gallery aesthetic

Product unchanged.`,

        `${baseContext}

CRITICAL: Keep product 100% identical. Only change background.

ABSTRACT MINIMALISM:
- Elements: Overlapping circles, curved forms, layered rectangles
- Texture: Ultra-smooth matte surfaces
- Palette: Monochromatic or analogous (cream+beige+soft pink OR grayscale)
- Background: Soft gradient or solid with slight texture
- Lighting: Diffused creating barely-there shadows
- Interest: Light/shadow play through shapes for depth
- Composition: Asymmetric balance, product slightly off-center
- Reference: Kinfolk magazine, Cereal aesthetic

Product unchanged.`,

        `${baseContext}

CRITICAL: Keep product 100% identical. Only change background.

CONTEMPORARY MINIMALISM:
- Structure: Simple platforms, steps, or pedestals in geometric forms
- Material: Smooth plaster, painted wood, modern composite
- Colors: Dove gray, warm white, sand, stone
- Background: Two-tone separation or gentle gradient
- Lighting: Natural window light quality - soft directional
- Shadows: Clean, defined shadows enhancing geometry
- Detail: One curved element contrasting angular shapes
- Style: Modern architecture, Japanese minimalism

Product unchanged.`,
      ],
      'lifestyle': [
        `${baseContext}

CRITICAL: Keep product 100% identical. Only change setting.

COZY HOME LIVING:
- Setting: Modern living room or bedroom with natural placement
- Surface: Coffee table, nightstand, or kitchen counter (wood/marble/painted)
- Background: Soft-focus sofa, cushions, throw blanket, or bedding
- Decor: Barely visible ceramic vase, candle, plant, or books
- Lighting: Warm natural window light (late afternoon, 3000-4000K)
- Textiles: Hint of linen, cotton, knit in neutrals
- Palette: Warm whites, creams, soft grays, muted earth tones
- Feel: Inviting, comfortable, hygge aesthetic

Product unchanged.`,

        `${baseContext}

CRITICAL: Keep product 100% identical. Only change setting.

MORNING ROUTINE:
- Location: Kitchen counter, bathroom vanity, or breakfast nook
- Context: Natural use moment (morning light, coffee time)
- Props: Defocused French press, ceramic mug, potted herb, or linen towel
- Surface: Natural stone, marble, or light wood
- Background: Soft bokeh modern home setting
- Lighting: Fresh morning sunlight streaming through window
- Colors: Clean whites, warm wood, greenery accents
- Details: Maybe steam, water droplets, or natural condensation
- Mood: Aspirational but authentic, slow living

Product unchanged.`,

        `${baseContext}

CRITICAL: Keep product 100% identical. Only change setting.

STYLISH LIVING SPACE:
- Placement: Elegant side table, modern console, or designer shelf
- Surroundings: High-end interior design in soft focus
- Materials: Mix of smooth surfaces, soft textiles, natural elements
- Background: Modern furniture, art edge, or architectural detail
- Lighting: Balanced natural and ambient interior (gallery quality)
- Accessories: Design books, sculptural object, or premium candle (defocused)
- Palette: Sophisticated neutrals with accent (navy, olive, rust)
- Textiles: Cashmere, velvet, or linen suggestions
- Mood: Curated, design-conscious, elevated

Product unchanged.`,
      ],
      'studio': [
        `${baseContext}

CRITICAL: Keep product 100% identical. Only change lighting and backdrop.

DRAMATIC STUDIO:
- Background: Deep gradient charcoal gray to black (cinematic)
- Setup: Three-point lighting with emphasis on rim lights
- Key light: Strong directional from 45 degrees (creates dimension)
- Rim/edge lighting: Bright highlights on product edges (separation)
- Fill: Subtle fill preventing pure black shadows
- Effects: Optional light rays or subtle atmospheric haze
- Reflections: Strategic highlights showing premium quality
- Mood: Bold, luxury, high-end commercial
- Style: Car photography, luxury watch ads

Product unchanged.`,

        `${baseContext}

CRITICAL: Keep product 100% identical. Only change lighting and backdrop.

COLORED GEL STUDIO:
- Background: Gradient with jewel tones (sapphire blue, deep purple, burgundy)
- Lighting: Professional gels creating color washes
- Main: Neutral key light on product (true product colors)
- Accents: Colored rim lights or background lights (blue, purple, amber, cyan)
- Technique: Light painting or dual-color gradient effect
- Shadows: Defined but not harsh, adding depth
- Style: Music video, fashion editorial, Nike/Adidas campaigns
- Mood: Bold, energetic, contemporary

Product unchanged.`,

        `${baseContext}

CRITICAL: Keep product 100% identical. Only change lighting and backdrop.

CINEMATIC STUDIO:
- Background: Solid dark backdrop (matte black or deep gray) with texture
- Lighting: Film-quality setup - strong key with negative fill
- Technique: Spotlight with fall-off creating natural vignette
- Atmosphere: Fine mist or dust particles in light beams
- Highlights: Strategic specular reflections showing material quality
- Shadows: Deep rich blacks with controlled detail
- Tint: Slight cool or warm grade for mood (film LUT style)
- Style: Christopher Nolan aesthetic, car commercials
- Quality: Ultra-premium, blockbuster advertising

Product unchanged.`,
      ],
      'random': [
        `${baseContext}

CRITICAL: Keep product 100% identical. Only change background creatively.

CREATIVE UNEXPECTED - Choose ONE bold direction:
Option A - Urban: Colorful graffiti wall or street art backdrop with vibrant colors
Option B - Neon: Dark scene with neon light accents (pink, blue, cyan glow)
Option C - Texture: Interesting material (brushed metal, raw concrete, cracked marble)
Option D - Light Art: Bokeh lights, fiber optics, or light painting effects
Option E - Reflection: Glossy surface mirror effect or water reflections
Option F - Artistic: Watercolor wash, ink in water, or paint splatter background

Execution:
- Product: Perfectly sharp and true-to-life colors
- Background: Experimental and bold
- Lighting: Creative but ensures product clarity
- Style: Instagram-worthy, scroll-stopping, shareable

Product unchanged.`,

        `${baseContext}

CRITICAL: Keep product 100% identical. Only change background artistically.

ARTISTIC COMPOSITION - Choose ONE artistic direction:
Option A - Material Mix: Velvet + marble + brass unexpected combinations
Option B - Color Block: Bold solid colors (Klein blue, millennial pink, emerald)
Option C - Pattern: Geometric patterns, terrazzo, or Memphis design
Option D - Organic: Flowing fabric, billowing smoke, or liquid splash (frozen)
Option E - Architectural: Interesting angles, window shadows, staircase geometry
Option F - Phenomena: Prism effects, rainbow refractions, or sunset colors
Option G - Floating: Levitation effect with invisible suspension

Approach:
- Product: Hero and completely clear focal point
- Background: Artistic complement without overwhelming
- Quality: Magazine editorial (Vogue, Wallpaper, Kinfolk)
- Execution: Professional, intentional, not accidental

Product unchanged.`,

        `${baseContext}

CRITICAL: Keep product 100% identical. Only change background boldly.

BOLD STATEMENT - Choose ONE high-impact direction:
Option A - Metallic: Rose gold, copper, or silver foil with reflections
Option B - Gradient: Bold color gradients (sunset, ocean, aurora)
Option C - Dimensional: Impossible geometry, M.C. Escher perspectives
Option D - Maximalist: Controlled chaos with complementary elements
Option E - Monochrome: All one color family with tonal variations
Option F - High Key: Everything super bright except product (inverse studio)
Option G - Atmospheric: Visible fog, mist, or dust in dramatic light
Option H - Pop Art: Bright solid color with graphic or halftone patterns

Concept:
- Statement aligning with product personality
- Scroll-stopping without gimmicks
- Product integrity maintained
- Viral potential - shareable quality
- Professional execution, not amateur

Product unchanged.`,
      ],
    };

    const selectedScenarioPrompts = scenarioPrompts[scenario] || scenarioPrompts['random'];
    
    // Return: [catalog prompt] + [3 scenario prompts] = 4 total
    return [catalogPrompt, ...selectedScenarioPrompts];
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
   * Generate a single enhanced image (for regeneration)
   * @param imageIndex Index of the image to generate (0=catalog, 1-3=scenario variations)
   */
  async generateSingleEnhancedImage(
    productName: string,
    productDescription: string,
    scenario: string,
    originalImageUrl: string,
    imageIndex: number
  ): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini client not configured. Please set GOOGLE_API_KEY or GEMINI_API_KEY.');
    }

    console.log(`[Gemini Images] Regenerating single image at index ${imageIndex}`);
    console.log(`[Gemini Images] Product: ${productName}`);
    console.log(`[Gemini Images] Scenario: ${scenario}`);

    try {
      // Download and prepare the original image
      const imageBuffer = await this.downloadImage(originalImageUrl);
      const base64Image = imageBuffer.toString('base64');
      const mimeType = await this.detectMimeType(imageBuffer);

      // Analyze product context
      const productContext = await this.analyzeProductContext(
        base64Image,
        mimeType,
        productName,
        productDescription
      );

      // Build prompts and get the specific one
      const prompts = this.buildVariationPrompts(
        productName, 
        productDescription, 
        scenario,
        productContext
      );

      if (imageIndex < 0 || imageIndex >= prompts.length) {
        throw new Error(`Invalid image index: ${imageIndex}. Must be between 0 and ${prompts.length - 1}`);
      }

      const prompt = prompts[imageIndex];
      const imageType = imageIndex === 0 ? 'CATALOG' : `${scenario.toUpperCase()} ${imageIndex}`;
      
      console.log(`[Gemini Images] Generating ${imageType}...`);
      console.log(`[Gemini Images] Prompt: ${prompt.substring(0, 150)}...`);
      
      // Generate image using original as reference
      const result = await this.model.generateContent([
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
        prompt,
      ]);

      const response = await result.response;
      const parts = response.candidates?.[0]?.content?.parts;

      if (parts && parts.length > 0) {
        const imagePart = parts.find(part => 'inlineData' in part && part.inlineData);
        
        if (imagePart && 'inlineData' in imagePart && imagePart.inlineData) {
          // Save the generated image with appropriate prefix
          const prefix = imageIndex === 0 ? 'catalog' : `${scenario}-${imageIndex}`;
          const savedUrl = await this.saveGeneratedImage(
            Buffer.from(imagePart.inlineData.data, 'base64'),
            prefix
          );
          console.log(`[Gemini Images] ${imageType} regenerated successfully: ${savedUrl}`);
          return savedUrl;
        } else {
          throw new Error(`No image data in response for ${imageType}`);
        }
      } else {
        throw new Error(`No parts in response for ${imageType}`);
      }

    } catch (error) {
      console.error(`[Gemini Images] Error regenerating image at index ${imageIndex}:`, error);
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

  /**
   * Edit image using Kie.ai Nano Banana Edit API
   * Allows natural language editing of images with high precision
   * 
   * @param imageUrl URL of the image to edit
   * @param editPrompt Natural language description of desired edits
   * @param outputFormat Output format (PNG or JPEG)
   * @param imageSize Aspect ratio (1:1, 9:16, 16:9, 3:4, 4:3, 2:3, 3:2, 5:4, 4:5, 21:9, auto)
   * @param numVariations Number of variations to generate (1-4, default 1). Kie.ai will generate different variations from same input
   * @returns URL of the edited image (or array if multiple variations)
   */
  async editImageWithPrompt(
    imageUrl: string,
    editPrompt: string,
    outputFormat: 'PNG' | 'JPEG' = 'JPEG',
    imageSize: string = 'auto',
    numVariations: number = 1
  ): Promise<string> {
    const kieApiKey = process.env.KIE_API_KEY;
    
    if (!kieApiKey) {
      throw new Error('KIE_API_KEY not configured. Please set KIE_API_KEY environment variable.');
    }

    console.log(`[Gemini Images] Editing image with Nano Banana Edit`);
    console.log(`[Gemini Images] Image URL (S3 public): ${imageUrl}`);
    console.log(`[Gemini Images] Edit prompt: ${editPrompt}`);
    console.log(`[Gemini Images] Output format: ${outputFormat}`);
    console.log(`[Gemini Images] Image size: ${imageSize}`);
    console.log(`[Gemini Images] Variations: ${numVariations}`);

    try {
      // Image already on S3 (public), use URL directly
      // Submit edit task to Kie.ai using correct API format
      // Note: Kie.ai expects 'png' or 'jpeg' (lowercase)
      // Note: API expects 'image_urls' (plural) not 'image_input'
      // Note: Can send same image multiple times to get variations
      const normalizedFormat = outputFormat.toLowerCase(); // 'png' or 'jpeg'
      
      // Clamp variations between 1-4 (Kie.ai practical limit)
      const clampedVariations = Math.max(1, Math.min(4, numVariations));
      
      // Send same image multiple times for variations
      const imageUrls = Array(clampedVariations).fill(imageUrl);
      
      const kieInput: any = {
        prompt: editPrompt,
        image_urls: imageUrls, // Multiple URLs = multiple variations
        output_format: normalizedFormat, // 'png' or 'jpeg'
        image_size: imageSize === 'auto' ? '4:5' : imageSize, // API expects 'image_size' not 'aspect_ratio'
      };

      const kiePayload = {
        model: 'google/nano-banana-edit',
        input: kieInput,
      };

      console.log(`[Gemini Images] Request payload:`, JSON.stringify(kiePayload, null, 2));

      const taskResponse = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${kieApiKey}`,
        },
        body: JSON.stringify(kiePayload),
      });

      if (!taskResponse.ok) {
        const errorText = await taskResponse.text();
        console.error(`[Gemini Images] API Error Response:`, errorText);
        throw new Error(`Failed to submit edit task: ${taskResponse.statusText} - ${errorText}`);
      }

      const responseData: any = await taskResponse.json();
      console.log(`[Gemini Images] API Response:`, JSON.stringify(responseData, null, 2));

      // Check Kie.ai response format
      if (responseData.code !== 200) {
        throw new Error(`Kie.ai error: ${responseData.msg || 'Unknown error'}`);
      }

      const taskId = responseData.data?.taskId;
      
      if (!taskId) {
        throw new Error(`No taskId in response: ${JSON.stringify(responseData)}`);
      }
      
      console.log(`[Gemini Images] Edit task submitted: ${taskId}`);
      console.log(`[Gemini Images] Task will be processed asynchronously`);

      // Poll for completion using recordInfo endpoint (official KIE.AI API)
      // RESILIENT: Handles network errors, API timeouts, and retries
      let editedImageUrl: string | null = null;
      let attempts = 0;
      const maxAttempts = 120; // 10 minutes (5s * 120) - Extended for Kie.ai processing time
      let consecutiveErrors = 0;
      const maxConsecutiveErrors = 3; // Allow 3 consecutive errors before giving up
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
        attempts++;
        
        try {
          // Official KIE.AI endpoint for image/TTS/upscale tasks with timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout per request
          
          const statusResponse = await fetch(`https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${kieApiKey}`,
            },
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!statusResponse.ok) {
            const errorText = await statusResponse.text();
            console.warn(`[Gemini Images] Query returned ${statusResponse.status} (attempt ${attempts}/${maxAttempts}):`, errorText);
            
            // Retry on 5xx errors (server issues) or 429 (rate limit)
            if (statusResponse.status >= 500 || statusResponse.status === 429) {
              consecutiveErrors++;
              console.log(`[Gemini Images] Server error, will retry (${consecutiveErrors}/${maxConsecutiveErrors} consecutive errors)`);
              
              if (consecutiveErrors >= maxConsecutiveErrors) {
                throw new Error(`Kie.ai API unavailable after ${maxConsecutiveErrors} consecutive errors`);
              }
              continue; // Retry
            }
            
            // Non-retryable error (4xx except 429)
            throw new Error(`Failed to fetch task status: ${statusResponse.statusText}`);
          }

          const statusData: any = await statusResponse.json();
          
          // Reset error counter on successful response
          consecutiveErrors = 0;
          
          if (statusData.code !== 200) {
            console.warn(`[Gemini Images] API returned code ${statusData.code}: ${statusData.msg}`);
            
            // Some error codes are temporary, retry
            if (statusData.code >= 500) {
              consecutiveErrors++;
              if (consecutiveErrors >= maxConsecutiveErrors) {
                throw new Error(`Query error: ${statusData.msg}`);
              }
              continue;
            }
            
            throw new Error(`Query error: ${statusData.msg}`);
          }

          // KIE.AI uses 'state' field: 'waiting' | 'generating' | 'success' | 'fail'
          const taskState = statusData.data?.state;
          console.log(`[Gemini Images] Task state (attempt ${attempts}/${maxAttempts}): ${taskState}`);

          if (taskState === 'success') {
            // Parse resultJson to extract image URLs
            if (!statusData.data.resultJson) {
              throw new Error('Task completed but no resultJson in response');
            }

            try {
              const result = JSON.parse(statusData.data.resultJson);
              
              if (result.resultUrls && Array.isArray(result.resultUrls) && result.resultUrls.length > 0) {
                // Get first result (for now, return single URL)
                // Future: could return all variations for multi-variation support
                const imageUrl = result.resultUrls[0];
                editedImageUrl = imageUrl;
                console.log(`[Gemini Images] ✅ Edit completed successfully after ${attempts} attempts`);
                console.log(`[Gemini Images] Generated ${result.resultUrls.length} variation(s)`);
                console.log(`[Gemini Images] First result: ${imageUrl.substring(0, 80)}...`);
                break;
              } else {
                throw new Error('No resultUrls found in completed task');
              }
            } catch (parseError) {
              console.error(`[Gemini Images] Failed to parse resultJson:`, statusData.data.resultJson);
              throw new Error(`Failed to parse result: ${parseError instanceof Error ? parseError.message : 'Unknown'}`);
            }
          } else if (taskState === 'fail') {
            const failMsg = statusData.data?.failMsg || statusData.data?.failCode || 'Unknown error';
            throw new Error(`Edit task failed: ${failMsg}`);
          } else if (taskState === 'waiting' || taskState === 'generating') {
            // Continue polling - task is still in progress
            // No error increment here - this is normal
          } else {
            console.warn(`[Gemini Images] Unknown state: ${taskState} - continuing to poll`);
          }

        } catch (fetchError: any) {
          // Handle network errors, timeouts, etc.
          if (fetchError.name === 'AbortError') {
            console.warn(`[Gemini Images] ⏱️ Request timeout (attempt ${attempts}/${maxAttempts}) - will retry`);
            consecutiveErrors++;
          } else if (fetchError.message?.includes('fetch failed') || fetchError.message?.includes('ECONNREFUSED')) {
            console.warn(`[Gemini Images] 🔌 Network error (attempt ${attempts}/${maxAttempts}): ${fetchError.message} - will retry`);
            consecutiveErrors++;
          } else {
            // Re-throw non-network errors (API errors, validation errors, etc.)
            throw fetchError;
          }

          // Check if too many consecutive errors
          if (consecutiveErrors >= maxConsecutiveErrors) {
            throw new Error(`Failed after ${maxConsecutiveErrors} consecutive network/timeout errors. Last error: ${fetchError.message}`);
          }

          // Add exponential backoff for consecutive errors
          if (consecutiveErrors > 1) {
            const backoffMs = Math.min(5000 * Math.pow(2, consecutiveErrors - 1), 30000); // Max 30s
            console.log(`[Gemini Images] 🔄 Backing off for ${backoffMs}ms before retry`);
            await new Promise(resolve => setTimeout(resolve, backoffMs));
          }
        }
      }

      if (!editedImageUrl) {
        // Task still processing after max time - don't fail the job, return null to allow retry
        console.warn(`[Gemini Images] ⚠️ Task ${taskId} still processing after ${maxAttempts} attempts (${maxAttempts * 5 / 60} minutes)`);
        console.warn(`[Gemini Images] This is not a failure - Kie.ai may still be processing. Job can be retried.`);
        throw new Error(`Kie.ai task ${taskId} exceeded polling time (${maxAttempts * 5 / 60} minutes). Task may still complete - please retry the job.`);
      }

      // Download and save edited image to S3
      console.log(`[Gemini Images] Downloading edited image from: ${editedImageUrl}`);
      const imageBuffer = await this.downloadImage(editedImageUrl);
      
      // Upload to S3 instead of local storage
      const filename = `edited-${Date.now()}.${outputFormat.toLowerCase() === 'png' ? 'png' : 'jpg'}`;
      const contentType = outputFormat.toLowerCase() === 'png' ? 'image/png' : 'image/jpeg';
      const s3Url = await s3Service.uploadBuffer(imageBuffer, filename, contentType, true);
      
      console.log(`[Gemini Images] Edited image saved to S3: ${s3Url}`);
      return s3Url;

    } catch (error) {
      console.error(`[Gemini Images] Error editing image:`, error);
      throw error;
    }
  }

  /**
   * Upload image to S3 for public access
   * Kie.ai requires a publicly accessible URL to download the image
   * @param imageUrl Local or remote image URL
   * @returns Public S3 URL
   */
  private async uploadImageToS3(imageUrl: string): Promise<string> {
    try {
      console.log(`[Gemini Images] Preparing to upload image to S3`);
      
      // Check if already an S3 URL
      if (imageUrl.includes(process.env.S3_ENDPOINT || '') && imageUrl.includes(process.env.S3_BUCKET_NAME || '')) {
        console.log(`[Gemini Images] Image already on S3, using existing URL`);
        return imageUrl;
      }

      // Download image if remote URL or read from local path
      let imageBuffer: Buffer;
      
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        console.log(`[Gemini Images] Downloading remote image...`);
        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error(`Failed to download image: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        imageBuffer = Buffer.from(arrayBuffer);
      } else {
        // Local file path
        console.log(`[Gemini Images] Reading local image file...`);
        const absolutePath = imageUrl.startsWith('/') ? imageUrl : path.join(process.cwd(), imageUrl);
        imageBuffer = await fs.readFile(absolutePath);
      }

      // Detect MIME type
      const mimeType = await this.detectMimeType(imageBuffer);
      const ext = mimeType.split('/')[1] || 'jpg';
      const filename = `product-${Date.now()}.${ext}`;

      // Upload to S3 as public file
      const publicUrl = await s3Service.uploadBuffer(
        imageBuffer,
        filename,
        mimeType,
        true // makePublic = true
      );
      
      console.log(`[Gemini Images] Image uploaded successfully to S3: ${publicUrl}`);
      return publicUrl;

    } catch (error) {
      console.error(`[Gemini Images] Error uploading image to S3:`, error);
      throw error;
    }
  }
}

export const geminiImageService = new GeminiImageService();
