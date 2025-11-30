import { JobType } from '../core/types';

/**
 * Pipeline step configuration
 */
export interface PipelineStep {
  type: JobType;
  dependsOn?: JobType[];
  config: Record<string, unknown>;
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
