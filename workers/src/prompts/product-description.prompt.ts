/**
 * Product Description Prompt Builder
 * Builds prompts for generating optimized product descriptions for marketplaces and ecommerce
 */

export interface ProductDescriptionPromptParams {
  productName: string;
  productDescription?: string;
  targetAudience?: string;
  includeEmojis?: boolean;
  language?: string;
  style?: 'marketplace' | 'ecommerce' | 'professional';
}

export function buildProductDescriptionPrompt(params: ProductDescriptionPromptParams): { system: string; user: string } {
  const {
    productName,
    productDescription,
    targetAudience = 'general consumers',
    includeEmojis = false,
    language = 'pt-BR',
    style = 'marketplace',
  } = params;

  const languageInstructions: Record<string, string> = {
    'pt-BR': 'português brasileiro',
    'en-US': 'English (US)',
    'es-ES': 'español',
    'fr-FR': 'français',
    'de-DE': 'Deutsch',
    'it-IT': 'italiano',
  };

  const targetLanguage = languageInstructions[language] || languageInstructions['pt-BR'];

  const styleInstructions: Record<string, string> = {
    marketplace: `You are an expert at writing product descriptions for major marketplaces (Amazon, Mercado Livre, OLX, etc.).
Your descriptions should be:
- SEO-optimized with relevant keywords
- Clear and scannable with bullet points
- Feature-focused and benefit-driven
- Trustworthy and professional
- Optimized for marketplace search algorithms`,
    ecommerce: `You are an expert at writing product descriptions for ecommerce websites.
Your descriptions should be:
- Persuasive and conversion-focused
- Storytelling-driven to create emotional connection
- Detailed with specifications and use cases
- Brand-aligned and engaging
- Optimized for online shopping behavior`,
    professional: `You are an expert at writing professional product descriptions for B2B or technical products.
Your descriptions should be:
- Technical and specification-focused
- ROI and value proposition driven
- Professional tone without hype
- Detailed with technical specifications
- Industry-standard terminology`,
  };

  const systemPrompt = styleInstructions[style];

  const emojiInstruction = includeEmojis
    ? '- Use strategic emojis to highlight key features (sparingly and professionally)'
    : '- DO NOT use any emojis';

  const userPrompt = `Create an optimized product description for ${style} use:

Product Name: ${productName}
${productDescription ? `Current Description: ${productDescription}` : ''}
Target Audience: ${targetAudience}

Requirements:
- Style: ${style}
- Language: ${targetLanguage}
${emojiInstruction}
- Include a compelling title/headline
- Add 4-6 key features/benefits as bullet points
- Include a clear call-to-action
- Optimize for SEO and ${style} best practices
- Make it scannable and easy to read
- Focus on what matters to ${targetAudience}

Generate the complete product description now:`;

  return {
    system: systemPrompt,
    user: userPrompt,
  };
}
