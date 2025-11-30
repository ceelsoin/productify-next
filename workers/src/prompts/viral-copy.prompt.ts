/**
 * Viral Copy Prompt Builder
 * Builds prompts for generating viral social media copy
 */

export interface ViralCopyPromptParams {
  productName: string;
  productDescription?: string;
  platform: string;
  tone?: string;
  includeEmojis?: boolean;
  includeHashtags?: boolean;
  language?: string;
}

export function buildViralCopyPrompt(params: ViralCopyPromptParams): { system: string; user: string } {
  const {
    productName,
    productDescription,
    platform,
    tone = 'engaging and exciting',
    includeEmojis = true,
    includeHashtags = true,
    language = 'pt-BR',
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

  const systemPrompt = `You are an expert social media copywriter specializing in creating viral, engaging content for ${platform}.
Your copy should be attention-grabbing, authentic, and optimized for ${platform}'s audience and format.
Always write in ${targetLanguage}.`;

  const emojiInstruction = includeEmojis
    ? `- Use emojis appropriately for ${platform} to make the copy more engaging`
    : '- DO NOT use any emojis';

  const hashtagInstruction = includeHashtags
    ? `- Include relevant hashtags for ${platform}`
    : '- DO NOT include hashtags';

  const userPrompt = `Create compelling ${platform} copy for this product:

Product Name: ${productName}
${productDescription ? `Description: ${productDescription}` : ''}

Requirements:
- Platform: ${platform}
- Tone: ${tone}
- Language: ${targetLanguage}
${emojiInstruction}
${hashtagInstruction}
- Keep it concise and impactful
- Focus on benefits and value proposition
- Optimize for ${platform}'s best practices

Generate the complete ${platform} post now:`;

  return {
    system: systemPrompt,
    user: userPrompt,
  };
}
