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

    const prompt = `Analise esta imagem de produto e forneça informações detalhadas em JSON.

Sua resposta DEVE ser um objeto JSON válido com estes campos exatos:
{
  "productName": "Nome descritivo do produto (3-7 palavras em português)",
  "seoTitle": "Título otimizado para SEO (50-60 caracteres em português)",
  "briefDescription": "Descrição breve destacando características e benefícios (2-3 frases, 40-80 palavras em português)",
  "category": "Categoria do produto (ex: eletrônicos, decoração, moda, acessórios, brinquedos, etc.)",
  "suggestedKeywords": ["palavra-chave1", "palavra-chave2", "palavra-chave3", "palavra-chave4", "palavra-chave5"]
}

REGRAS IMPORTANTES:
1. FOQUE NO PRODUTO PRINCIPAL, não em marcas, logos ou decorações que aparecem nele
   - ✅ CORRETO: "Chaveiro de Parede Estilo Garagem para Miniaturas"
   - ❌ ERRADO: "Chaveiro Audi TT" (foco na decoração, não no produto)

2. Use PORTUGUÊS BRASILEIRO em todos os campos

3. Seja GENÉRICO quando o produto é um acessório/suporte:
   - Se é um chaveiro decorado com carro → "Chaveiro de Parede para Miniaturas"
   - Se é uma capa de celular com personagem → "Capa de Celular Protetora"
   - Se é uma caneca com logo → "Caneca Personalizada"

4. Use MARCA/ESPECÍFICO apenas quando o produto EM SI é da marca:
   - Tênis Nike → pode usar "Nike" pois o produto é Nike
   - iPhone → pode usar "iPhone" pois o produto é Apple
   - Relógio Rolex → pode usar "Rolex" pois o produto é Rolex

5. productName: Seja específico sobre o TIPO de produto e seu uso
   - Exemplo: "Chaveiro de Parede Estilo Garagem", "Porta-Chaves Decorativo para Miniaturas"

6. seoTitle: Inclua tipo do produto, material/estilo, e uso
   - Exemplo: "Chaveiro de Parede Decorativo - Estilo Garagem para Miniaturas"

7. briefDescription: Foque em características físicas, utilidade e apelo decorativo do PRODUTO
   - Não mencione marcas de decoração, apenas o produto em si

8. suggestedKeywords: 5 palavras-chave relevantes em português para SEO

Retorne APENAS o objeto JSON, sem texto adicional.`;

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
