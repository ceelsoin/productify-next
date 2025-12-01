/**
 * Image Analysis Service
 * Analyzes product images using AI to extract information
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

interface ProductAnalysis {
  productName: string;
  seoTitle: string;
  briefDescription: string;
  category: string;
  suggestedKeywords: string[];
}

interface VSTNarrative {
  hookViral: string;
  reviewSincero: string;
  lifestyleSolution: string;
  premiumQuality: string;
}

/**
 * Analyze product image and generate SEO-optimized content
 */
export async function analyzeProductImage(imageFile: File): Promise<ProductAnalysis> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('Google API key not configured');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Convert image to base64
    const imageData = await fileToBase64(imageFile);

    const prompt = `Analyze this product image and provide detailed information in JSON format.

Your response MUST be a valid JSON object with these exact fields:
{
  "productName": "Clear, descriptive product name (3-7 words)",
  "seoTitle": "SEO-optimized title with relevant keywords (50-60 characters)",
  "briefDescription": "Brief description highlighting key features and benefits (2-3 sentences, 40-80 words)",
  "category": "Product category (e.g., electronics, home decor, fashion, accessories, toys, etc.)",
  "suggestedKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}

Guidelines:
- productName: Be specific and descriptive (e.g., "Chaveiro de Parede Hot Wheels Miniatura" not just "Chaveiro")
- seoTitle: Include brand, product type, and key feature
- briefDescription: Focus on what makes the product unique and desirable
- category: Choose from common e-commerce categories
- suggestedKeywords: 5 relevant keywords for SEO

Return ONLY the JSON object, no additional text.`;

    const result = await model.generateContent([
      {
        inlineData: {
          data: imageData.split(',')[1], // Remove data:image/... prefix
          mimeType: imageFile.type,
        },
      },
      prompt,
    ]);

    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const analysis: ProductAnalysis = JSON.parse(jsonMatch[0]);
    return analysis;
  } catch (error) {
    console.error('Error analyzing product image:', error);
    throw new Error('Failed to analyze product image');
  }
}

/**
 * Generate VST (Voice-over Script Template) narratives
 */
export async function generateVSTNarratives(
  productName: string,
  productDescription: string,
  productCategory: string
): Promise<VSTNarrative> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('Google API key not configured');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `Create 4 different voice-over scripts for this product in Brazilian Portuguese.

Product: ${productName}
Description: ${productDescription}
Category: ${productCategory}

Generate 4 voice-over scripts (15-20 seconds each, ~40-60 words) in JSON format:

{
  "hookViral": "Viral Hook style - Start with shocking question or bold statement to grab attention immediately. Energetic, fast-paced, creates FOMO. Example: 'Você PRECISA ver isso! Sabe aquele problema que te irrita TODO DIA? Descobri a solução perfeita e vai mudar sua vida...'",
  "reviewSincero": "Sincere Review style - Personal, honest testimonial tone. Speak as if genuinely recommending to a friend. Example: 'Olha, eu testei e preciso contar pra vocês... No começo eu estava cético, mas depois de usar alguns dias...'",
  "lifestyleSolution": "Lifestyle Solution style - Focus on how product fits seamlessly into daily life and solves real problems. Aspirational but relatable. Example: 'Imagine começar seu dia sem aquele estresse de sempre. Com [produto], suas manhãs ficam mais práticas...'",
  "premiumQuality": "Premium Quality style - Sophisticated, emphasizes craftsmanship, exclusivity, and superior materials. Example: 'Produtos comuns não bastam quando você busca excelência. Cada detalhe foi pensado para oferecer a melhor experiência...'"
}

Requirements:
- Write in natural, conversational Brazilian Portuguese
- Each script should be 15-20 seconds when spoken (40-60 words)
- Include emotional triggers and clear call-to-action
- Match the style perfectly to the description
- Make it sound authentic and engaging for voice-over

Return ONLY the JSON object.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const narratives: VSTNarrative = JSON.parse(jsonMatch[0]);
    return narratives;
  } catch (error) {
    console.error('Error generating VST narratives:', error);
    throw new Error('Failed to generate VST narratives');
  }
}

/**
 * Convert File to base64 data URL
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
