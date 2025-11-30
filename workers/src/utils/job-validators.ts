import { IJob, IJobItem, EnhancedImagesResult, ViralCopyResult, VoiceOverResult, CaptionsResult, PromotionalVideoResult } from '../models/job.model';
import { JobType, JobItemStatus } from '../core/types';

/**
 * Type guards para análise de contrato
 */

export function isEnhancedImagesItem(item: IJobItem): item is Extract<IJobItem, { type: JobType.ENHANCED_IMAGES }> {
  return item.type === JobType.ENHANCED_IMAGES;
}

export function isViralCopyItem(item: IJobItem): item is Extract<IJobItem, { type: JobType.VIRAL_COPY }> {
  return item.type === JobType.VIRAL_COPY;
}

export function isVoiceOverItem(item: IJobItem): item is Extract<IJobItem, { type: JobType.VOICE_OVER }> {
  return item.type === JobType.VOICE_OVER;
}

export function isCaptionsItem(item: IJobItem): item is Extract<IJobItem, { type: JobType.CAPTIONS }> {
  return item.type === JobType.CAPTIONS;
}

export function isPromotionalVideoItem(item: IJobItem): item is Extract<IJobItem, { type: JobType.PROMOTIONAL_VIDEO }> {
  return item.type === JobType.PROMOTIONAL_VIDEO;
}

/**
 * Type guards para results
 */

export function isEnhancedImagesResult(result: unknown): result is EnhancedImagesResult {
  return (
    typeof result === 'object' &&
    result !== null &&
    'images' in result &&
    'count' in result &&
    Array.isArray((result as any).images)
  );
}

export function isViralCopyResult(result: unknown): result is ViralCopyResult {
  return (
    typeof result === 'object' &&
    result !== null &&
    'text' in result &&
    'platform' in result &&
    'wordCount' in result
  );
}

export function isVoiceOverResult(result: unknown): result is VoiceOverResult {
  return (
    typeof result === 'object' &&
    result !== null &&
    'audioUrl' in result &&
    'duration' in result &&
    'format' in result &&
    'language' in result
  );
}

export function isCaptionsResult(result: unknown): result is CaptionsResult {
  return (
    typeof result === 'object' &&
    result !== null &&
    'captions' in result &&
    'format' in result
  );
}

export function isPromotionalVideoResult(result: unknown): result is PromotionalVideoResult {
  return (
    typeof result === 'object' &&
    result !== null &&
    'videoUrl' in result &&
    'duration' in result &&
    'format' in result
  );
}

/**
 * Helpers para análise de contrato
 */

export function getCompletedItems(job: IJob): IJobItem[] {
  return job.items.filter(item => item.status === JobItemStatus.COMPLETED);
}

export function getEnhancedImages(job: IJob): string[] | null {
  const item = job.items.find(isEnhancedImagesItem);
  if (item?.status === JobItemStatus.COMPLETED && item.result) {
    return item.result.images;
  }
  return null;
}

export function getViralCopyText(job: IJob): string | null {
  const item = job.items.find(isViralCopyItem);
  if (item?.status === JobItemStatus.COMPLETED && item.result) {
    return item.result.text;
  }
  return null;
}

export function getVoiceOverAudio(job: IJob): string | null {
  const item = job.items.find(isVoiceOverItem);
  if (item?.status === JobItemStatus.COMPLETED && item.result) {
    return item.result.audioUrl;
  }
  return null;
}

export function getCaptions(job: IJob): string | null {
  const item = job.items.find(isCaptionsItem);
  if (item?.status === JobItemStatus.COMPLETED && item.result) {
    return item.result.captions;
  }
  return null;
}

export function getPromotionalVideo(job: IJob): string | null {
  const item = job.items.find(isPromotionalVideoItem);
  if (item?.status === JobItemStatus.COMPLETED && item.result) {
    return item.result.videoUrl;
  }
  return null;
}

/**
 * Validar contrato do result baseado no type
 */
export function validateJobItemResult(item: IJobItem): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (item.status !== JobItemStatus.COMPLETED || !item.result) {
    return { valid: true, errors: [] }; // Só valida se completou
  }

  switch (item.type) {
    case JobType.ENHANCED_IMAGES:
      if (!isEnhancedImagesResult(item.result)) {
        errors.push('Invalid EnhancedImagesResult: missing images or count');
      }
      break;

    case JobType.VIRAL_COPY:
      if (!isViralCopyResult(item.result)) {
        errors.push('Invalid ViralCopyResult: missing text, platform or wordCount');
      }
      break;

    case JobType.VOICE_OVER:
      if (!isVoiceOverResult(item.result)) {
        errors.push('Invalid VoiceOverResult: missing audioUrl, duration, format or language');
      }
      break;

    case JobType.CAPTIONS:
      if (!isCaptionsResult(item.result)) {
        errors.push('Invalid CaptionsResult: missing captions or format');
      }
      break;

    case JobType.PROMOTIONAL_VIDEO:
      if (!isPromotionalVideoResult(item.result)) {
        errors.push('Invalid PromotionalVideoResult: missing videoUrl, duration or format');
      }
      break;
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validar todo o job
 */
export function validateJob(job: IJob): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  job.items.forEach((item, index) => {
    const validation = validateJobItemResult(item);
    if (!validation.valid) {
      errors.push(`Item ${index} (${item.type}): ${validation.errors.join(', ')}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
