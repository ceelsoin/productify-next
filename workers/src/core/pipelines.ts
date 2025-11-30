import { JobType } from '../core/types';

/**
 * Text generation prompt configuration
 */
export interface TextPromptConfig {
  systemPrompt: string;
  userPromptTemplate: string;
  variables: string[]; // Variables that will be replaced in the template
}

/**
 * Pipeline step configuration
 */
export interface PipelineStep {
  type: JobType;
  dependsOn?: JobType[];
  config: Record<string, unknown>;
  promptConfig?: TextPromptConfig; // For text-based job types
}

/**
 * Pipeline definition
 */
export interface Pipeline {
  name: string;
  description: string;
  steps: PipelineStep[];
}

/**
 * Available pipelines
 */
export const PIPELINES: Record<string, Pipeline> = {
  'enhanced-images-only': {
    name: 'Enhanced Images Only',
    description: 'Generate enhanced product images',
    steps: [
      {
        type: JobType.ENHANCED_IMAGES,
        config: {},
      },
    ],
  },

  'viral-copy-only': {
    name: 'Viral Copy Only',
    description: 'Generate viral marketing copy',
    steps: [
      {
        type: JobType.VIRAL_COPY,
        config: {},
        promptConfig: {
          systemPrompt: `You are an expert social media copywriter specializing in creating viral, engaging content for {{platform}}.
Your copy should be attention-grabbing, authentic, and optimized for {{platform}}'s audience and format.
Always write in {{language}}.`,
          userPromptTemplate: `Create compelling {{platform}} copy for this product:

Product Name: {{productName}}
{{#if productDescription}}Description: {{productDescription}}{{/if}}

Requirements:
- Platform: {{platform}}
- Tone: {{tone}}
- Language: {{language}}
{{#if includeEmojis}}- Use emojis appropriately for {{platform}} to make the copy more engaging{{else}}- DO NOT use any emojis{{/if}}
{{#if includeHashtags}}- Include relevant hashtags for {{platform}}{{else}}- DO NOT include hashtags{{/if}}
- Keep it concise and impactful
- Focus on benefits and value proposition
- Optimize for {{platform}}'s best practices

Generate the complete {{platform}} post now:`,
          variables: ['platform', 'productName', 'productDescription', 'tone', 'language', 'includeEmojis', 'includeHashtags'],
        },
      },
    ],
  },

  'product-description-only': {
    name: 'Product Description Only',
    description: 'Generate optimized product description for marketplaces and ecommerce',
    steps: [
      {
        type: JobType.PRODUCT_DESCRIPTION,
        config: {},
        promptConfig: {
          systemPrompt: `You are an expert at writing product descriptions for {{style}} platforms.
{{#if style === 'marketplace'}}Your descriptions should be:
- SEO-optimized with relevant keywords
- Clear and scannable with bullet points
- Feature-focused and benefit-driven
- Trustworthy and professional
- Optimized for marketplace search algorithms{{/if}}
{{#if style === 'ecommerce'}}Your descriptions should be:
- Persuasive and conversion-focused
- Storytelling-driven to create emotional connection
- Detailed with specifications and use cases
- Brand-aligned and engaging
- Optimized for online shopping behavior{{/if}}
{{#if style === 'professional'}}Your descriptions should be:
- Technical and specification-focused
- ROI and value proposition driven
- Professional tone without hype
- Detailed with technical specifications
- Industry-standard terminology{{/if}}
Always write in {{language}}.`,
          userPromptTemplate: `Create an optimized product description for {{style}} use:

Product Name: {{productName}}
{{#if productDescription}}Current Description: {{productDescription}}{{/if}}
Target Audience: {{targetAudience}}

Requirements:
- Style: {{style}}
- Language: {{language}}
{{#if includeEmojis}}- Use strategic emojis to highlight key features (sparingly and professionally){{else}}- DO NOT use any emojis{{/if}}
- Include a compelling title/headline
- Add 4-6 key features/benefits as bullet points
- Include a clear call-to-action
- Optimize for SEO and {{style}} best practices
- Make it scannable and easy to read
- Focus on what matters to {{targetAudience}}

Generate the complete product description now:`,
          variables: ['style', 'productName', 'productDescription', 'targetAudience', 'language', 'includeEmojis'],
        },
      },
    ],
  },

  'voice-over-only': {
    name: 'Voice-Over Only',
    description: 'Generate voice-over from text',
    steps: [
      {
        type: JobType.VIRAL_COPY,
        config: {},
      },
      {
        type: JobType.VOICE_OVER,
        dependsOn: [JobType.VIRAL_COPY],
        config: {},
      },
    ],
  },

  'promotional-video-basic': {
    name: 'Promotional Video (Basic)',
    description: 'Video with enhanced images only',
    steps: [
      {
        type: JobType.ENHANCED_IMAGES,
        config: {},
      },
      {
        type: JobType.PROMOTIONAL_VIDEO,
        dependsOn: [JobType.ENHANCED_IMAGES],
        config: {},
      },
    ],
  },

  'promotional-video-with-text': {
    name: 'Promotional Video with Text',
    description: 'Video with enhanced images and viral copy',
    steps: [
      {
        type: JobType.ENHANCED_IMAGES,
        config: {},
      },
      {
        type: JobType.VIRAL_COPY,
        config: {},
      },
      {
        type: JobType.PROMOTIONAL_VIDEO,
        dependsOn: [JobType.ENHANCED_IMAGES, JobType.VIRAL_COPY],
        config: {},
      },
    ],
  },

  'promotional-video-with-voiceover': {
    name: 'Promotional Video with Voice-Over',
    description: 'Video with enhanced images, text, and voice-over',
    steps: [
      {
        type: JobType.ENHANCED_IMAGES,
        config: {},
      },
      {
        type: JobType.VIRAL_COPY,
        config: {},
      },
      {
        type: JobType.VOICE_OVER,
        dependsOn: [JobType.VIRAL_COPY],
        config: {},
      },
      {
        type: JobType.PROMOTIONAL_VIDEO,
        dependsOn: [JobType.ENHANCED_IMAGES, JobType.VIRAL_COPY, JobType.VOICE_OVER],
        config: {},
      },
    ],
  },

  'promotional-video-full': {
    name: 'Promotional Video (Full)',
    description: 'Complete video with images, text, voice-over, and captions',
    steps: [
      {
        type: JobType.ENHANCED_IMAGES,
        config: {},
      },
      {
        type: JobType.VIRAL_COPY,
        config: {},
      },
      {
        type: JobType.VOICE_OVER,
        dependsOn: [JobType.VIRAL_COPY],
        config: {},
      },
      {
        type: JobType.CAPTIONS,
        dependsOn: [JobType.VOICE_OVER],
        config: {},
      },
      {
        type: JobType.PROMOTIONAL_VIDEO,
        dependsOn: [JobType.ENHANCED_IMAGES, JobType.VIRAL_COPY, JobType.VOICE_OVER, JobType.CAPTIONS],
        config: {},
      },
    ],
  },
};

/**
 * Get pipeline by name
 */
export function getPipeline(name: string): Pipeline | undefined {
  return PIPELINES[name];
}

/**
 * List all available pipelines
 */
export function listPipelines(): Array<{ id: string; name: string; description: string }> {
  return Object.entries(PIPELINES).map(([id, pipeline]) => ({
    id,
    name: pipeline.name,
    description: pipeline.description,
  }));
}

/**
 * Validate pipeline dependencies
 */
export function validatePipeline(pipeline: Pipeline): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const completedTypes = new Set<JobType>();

  for (const step of pipeline.steps) {
    // Check if dependencies are satisfied
    if (step.dependsOn) {
      for (const dep of step.dependsOn) {
        if (!completedTypes.has(dep)) {
          errors.push(`Step ${step.type} depends on ${dep} which hasn't been completed yet`);
        }
      }
    }

    completedTypes.add(step.type);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
