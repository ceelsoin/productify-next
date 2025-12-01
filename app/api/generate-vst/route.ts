/**
 * API Route for VST Narratives Generation
 * Protected route that generates voice-over script templates using Google Gemini
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Verificar API key
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.error('[generate-vst] GEMINI_API_KEY não configurada');
      return NextResponse.json(
        { error: 'Serviço de geração não configurado' },
        { status: 500 }
      );
    }

    // Obter dados da requisição
    const body = await request.json();
    const { productName, productDescription, productCategory } = body;

    if (!productName || !productDescription) {
      return NextResponse.json(
        { error: 'Nome e descrição do produto são obrigatórios' },
        { status: 400 }
      );
    }

    console.log('[generate-vst] Gerando narrativas para:', productName);

    // Inicializar Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `Create 4 different voice-over scripts for this product in Brazilian Portuguese.

Product: ${productName}
Description: ${productDescription}
Category: ${productCategory || 'general'}

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

    // Enviar para Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log('[generate-vst] Resposta do Gemini:', text);

    // Extrair JSON da resposta
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[generate-vst] Resposta não contém JSON válido:', text);
      return NextResponse.json(
        { error: 'Falha ao processar resposta da IA' },
        { status: 500 }
      );
    }

    const rawNarratives = JSON.parse(jsonMatch[0]);
    console.log('[generate-vst] Narrativas parseadas:', rawNarratives);

    // Extrair apenas o texto do voiceover se vier em formato aninhado
    const narratives = {
      hookViral: typeof rawNarratives.hookViral === 'object' && rawNarratives.hookViral.voiceover 
        ? rawNarratives.hookViral.voiceover 
        : rawNarratives.hookViral,
      reviewSincero: typeof rawNarratives.reviewSincero === 'object' && rawNarratives.reviewSincero.voiceover
        ? rawNarratives.reviewSincero.voiceover
        : rawNarratives.reviewSincero,
      lifestyleSolution: typeof rawNarratives.lifestyleSolution === 'object' && rawNarratives.lifestyleSolution.voiceover
        ? rawNarratives.lifestyleSolution.voiceover
        : rawNarratives.lifestyleSolution,
      premiumQuality: typeof rawNarratives.premiumQuality === 'object' && rawNarratives.premiumQuality.voiceover
        ? rawNarratives.premiumQuality.voiceover
        : rawNarratives.premiumQuality,
    };

    console.log('[generate-vst] Narrativas extraídas com sucesso');
    return NextResponse.json({ narratives });
  } catch (error) {
    console.error('[generate-vst] Erro:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao gerar narrativas',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
