/**
 * Mapeamento de tipos de job para pipelines
 */
export const JOB_ITEMS_TO_PIPELINE: Record<string, string> = {
  'enhanced-images': 'enhanced-images-only',
  'viral-copy': 'viral-copy-only',
  'product-description': 'product-description-only',
  'voice-over': 'voice-over-only',
  'promotional-video': 'promotional-video-full',
};

/**
 * Determinar qual pipeline usar baseado nos items do job
 */
export function determinePipeline(items: Array<{ type: string }>): string {
  const types = items.map(item => item.type);

  // Vídeo promocional completo (com tudo)
  if (
    types.includes('promotional-video') &&
    types.includes('enhanced-images') &&
    types.includes('viral-copy') &&
    types.includes('voice-over') &&
    types.includes('captions')
  ) {
    return 'promotional-video-full';
  }

  // Vídeo com voice-over
  if (
    types.includes('promotional-video') &&
    types.includes('enhanced-images') &&
    types.includes('viral-copy') &&
    types.includes('voice-over')
  ) {
    return 'promotional-video-with-voiceover';
  }

  // Vídeo com texto
  if (
    types.includes('promotional-video') &&
    types.includes('enhanced-images') &&
    types.includes('viral-copy')
  ) {
    return 'promotional-video-with-text';
  }

  // Vídeo básico
  if (types.includes('promotional-video') && types.includes('enhanced-images')) {
    return 'promotional-video-basic';
  }

  // Múltiplos tipos de texto (viral-copy + product-description)
  if (types.includes('viral-copy') && types.includes('product-description')) {
    return 'text-only-multiple';
  }

  // Voice-over apenas
  if (types.includes('voice-over') && types.includes('viral-copy')) {
    return 'voice-over-only';
  }

  // Copy apenas
  if (types.includes('viral-copy')) {
    return 'viral-copy-only';
  }

  // Product description apenas
  if (types.includes('product-description')) {
    return 'product-description-only';
  }

  // Imagens apenas
  if (types.includes('enhanced-images')) {
    return 'enhanced-images-only';
  }

  // Default: enhanced images
  return 'enhanced-images-only';
}
