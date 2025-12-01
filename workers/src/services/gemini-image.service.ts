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
   * Creates 4 high-quality variations: 1 catalog (white bg) + 3 scenario-specific
   * Maintains product fidelity while changing backgrounds
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

    console.log(`[Gemini Images] Generating 4 enhanced variations (1 catalog + 3 ${scenario})`);
    console.log(`[Gemini Images] Product: ${productName}`);
    console.log(`[Gemini Images] Original image: ${originalImageUrl}`);
    console.log(`[Gemini Images] Scenario: ${scenario}`);

    const imageUrls: string[] = [];

    try {
      // Download and prepare the original image
      const imageBuffer = await this.downloadImage(originalImageUrl);
      const base64Image = imageBuffer.toString('base64');
      const mimeType = await this.detectMimeType(imageBuffer);

      // Generate 4 variations: 1 catalog + 3 scenario-specific
      const prompts = this.buildVariationPrompts(productName, productDescription, scenario);

      for (let i = 0; i < prompts.length; i++) {
        try {
          const imageType = i === 0 ? 'CATALOG' : `${scenario.toUpperCase()} ${i}`;
          console.log(`[Gemini Images] Generating ${imageType} (${i + 1}/4)...`);
          console.log(`[Gemini Images] Prompt: ${prompts[i].substring(0, 150)}...`);
          
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
              // Save the generated image with appropriate prefix
              const prefix = i === 0 ? 'catalog' : `${scenario}-${i}`;
              const savedUrl = await this.saveGeneratedImage(
                Buffer.from(imagePart.inlineData.data, 'base64'),
                prefix
              );
              imageUrls.push(savedUrl);
              console.log(`[Gemini Images] ${imageType} created successfully: ${savedUrl}`);
            } else {
              console.error(`[Gemini Images] No image data in response for ${imageType}`);
              console.error(`[Gemini Images] Response parts:`, JSON.stringify(parts, null, 2));
            }
          } else {
            console.error(`[Gemini Images] No parts in response for ${imageType}`);
          }

          // Delay between requests to avoid rate limits
          if (i < prompts.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } catch (error) {
          console.error(`[Gemini Images] Error generating image ${i + 1}:`, error);
          // Continue with other variations
        }
      }

      if (imageUrls.length === 0) {
        throw new Error('Failed to generate any images');
      }

      console.log(`[Gemini Images] Successfully generated ${imageUrls.length}/4 images`);
      return imageUrls;

    } catch (error) {
      console.error(`[Gemini Images] Error in image generation:`, error);
      throw error;
    }
  }

  /**
   * Build variation prompts: 1 catalog (white bg) + 3 scenario-specific
   * Prompts emphasize keeping the product IDENTICAL while changing background/lighting
   */
  private buildVariationPrompts(
    productName: string,
    productDescription: string,
    scenario: string
  ): string[] {
    const baseContext = `Product: ${productName}${productDescription ? `\nDescription: ${productDescription}` : ''}`;
    
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

NATURAL WOOD TABLE:
- Surface: Beautiful oak or walnut table with visible natural grain
- Texture: Rich wood with semi-matte finish
- Lighting: Soft natural window light from side (golden hour, 4000-5000K)
- Shadow: Gentle natural shadows following light direction
- Background: Softly blurred room or café setting (bokeh effect)
- Elements: Maybe hint of plant or cup edge in soft focus (never covering product)
- Atmosphere: Warm, inviting, cozy
- Reflection: Subtle ambient occlusion where product meets wood

Product unchanged.`,

        `${baseContext}

CRITICAL: Keep product 100% identical. Only change surface and environment.

RUSTIC WORKSPACE:
- Surface: Reclaimed or distressed wooden desk with character
- Wood type: Lighter tones (pine, birch) with visible wear and patina
- Lighting: Bright natural daylight creating clean shadows
- Background: Defocused home office or workshop (whites, creams)
- Detail: Maybe fabric texture edge (linen) barely visible
- Mood: Creative, artisan, authentic workspace
- Quality: Professional lifestyle photography

Product unchanged.`,

        `${baseContext}

CRITICAL: Keep product 100% identical. Only change surface and environment.

ELEGANT TABLE SETTING:
- Surface: Polished dark mahogany or cherry wood with slight sheen
- Finish: Semi-gloss premium furniture grade
- Lighting: Balanced natural and interior lighting
- Background: Upscale dining room or modern kitchen (bokeh)
- Palette: Rich browns, warm ambers, neutral tones
- Optional: Soft fabric (placemat) edge in neutral color
- Feel: Sophisticated, refined, premium
- Detail: Subtle reflections on polished surface

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
