/**
 * API Route for Image Analysis
 * Protected route that analyzes product images using Google Gemini
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
      console.error('[analyze-image] GEMINI_API_KEY não configurada');
      return NextResponse.json(
        { error: 'Serviço de análise não configurado' },
        { status: 500 }
      );
    }

    // Obter dados da requisição
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    
    if (!imageFile) {
      return NextResponse.json(
        { error: 'Imagem não fornecida' },
        { status: 400 }
      );
    }

    console.log('[analyze-image] Analisando imagem:', imageFile.name, imageFile.type);

    // Converter imagem para base64
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');

    // Inicializar Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

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

    // Enviar para Gemini
    const result = await model.generateContent([
      {
        inlineData: {
          data: base64,
          mimeType: imageFile.type,
        },
      },
      prompt,
    ]);

    const response = await result.response;
    const text = response.text();
    console.log('[analyze-image] Resposta do Gemini:', text);

    // Extrair JSON da resposta
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[analyze-image] Resposta não contém JSON válido:', text);
      return NextResponse.json(
        { error: 'Falha ao processar resposta da IA' },
        { status: 500 }
      );
    }

    const analysis = JSON.parse(jsonMatch[0]);
    console.log('[analyze-image] Análise concluída com sucesso');

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('[analyze-image] Erro:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao analisar imagem',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
