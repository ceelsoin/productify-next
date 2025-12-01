/**
 * Image Analysis Service
 * Client-side service that calls backend API routes for secure AI analysis
 */

export interface ProductAnalysis {
  productName: string;
  seoTitle: string;
  briefDescription: string;
  category: string;
  suggestedKeywords: string[];
}

export interface VSTNarrative {
  hookViral: string;
  reviewSincero: string;
  lifestyleSolution: string;
  premiumQuality: string;
}

/**
 * Analyze product image and generate SEO-optimized content
 * Calls backend API route to keep API keys secure
 */
export async function analyzeProductImage(imageFile: File): Promise<ProductAnalysis> {
  try {
    console.log('[analyzeProductImage] Enviando imagem para análise...');
    
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch('/api/analyze-image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao analisar imagem');
    }

    const data = await response.json();
    console.log('[analyzeProductImage] Análise concluída:', data.analysis);
    
    return data.analysis;
  } catch (error) {
    console.error('[analyzeProductImage] Erro:', error);
    if (error instanceof Error) {
      throw new Error(`Erro ao analisar imagem: ${error.message}`);
    }
    throw new Error('Erro desconhecido ao analisar imagem');
  }
}

/**
 * Generate VST (Voice-over Script Template) narratives
 * Calls backend API route to keep API keys secure
 */
export async function generateVSTNarratives(
  productName: string,
  productDescription: string,
  productCategory: string
): Promise<VSTNarrative> {
  try {
    console.log('[generateVSTNarratives] Gerando narrativas...');
    
    const response = await fetch('/api/generate-vst', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productName,
        productDescription,
        productCategory,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao gerar narrativas');
    }

    const data = await response.json();
    console.log('[generateVSTNarratives] Narrativas geradas:', data.narratives);
    
    return data.narratives;
  } catch (error) {
    console.error('[generateVSTNarratives] Erro:', error);
    if (error instanceof Error) {
      throw new Error(`Erro ao gerar narrativas VST: ${error.message}`);
    }
    throw new Error('Erro desconhecido ao gerar narrativas VST');
  }
}
