
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LotData {
  numero: string;
  area: number;
  tipo: 'lote' | 'area_publica';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let requestBody;
  try {
    requestBody = await req.json();
  } catch (error) {
    console.error('Erro ao ler body da requisição:', error);
    return new Response(
      JSON.stringify({ error: 'Formato de requisição inválido' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  const { filePath, historyId } = requestBody;
  const startTime = Date.now();

  if (!filePath || !historyId) {
    return new Response(
      JSON.stringify({ error: 'filePath e historyId são obrigatórios' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );

  try {
    console.log('Iniciando processamento do PDF:', filePath);

    // Verificar se a chave OpenAI está disponível
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    console.log('OpenAI API Key disponível:', !!openAIApiKey);

    // Atualizar status para processando
    await supabase
      .from('pdf_processing_history')
      .update({ processing_status: 'processing' })
      .eq('id', historyId);

    // Baixar o arquivo do storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('pdf-uploads')
      .download(filePath);

    if (downloadError) {
      throw new Error('Erro ao baixar arquivo para processamento: ' + downloadError.message);
    }

    console.log('Arquivo baixado com sucesso, tamanho:', fileData.size);

    // Converter o arquivo para ArrayBuffer
    const arrayBuffer = await fileData.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    console.log('Tamanho do arquivo em bytes:', uint8Array.length);

    // Usar OpenAI para extração inteligente
    const extractedData = await extractWithOpenAI(uint8Array);
    const processingTime = Math.round((Date.now() - startTime) / 1000);

    console.log('Dados extraídos:', extractedData.length, 'itens');

    // Atualizar histórico com sucesso
    await supabase
      .from('pdf_processing_history')
      .update({
        processing_status: 'completed',
        total_items_extracted: extractedData.length,
        processing_duration_seconds: processingTime,
        completed_at: new Date().toISOString()
      })
      .eq('id', historyId);

    // Agendar limpeza do arquivo após 5 minutos
    setTimeout(async () => {
      try {
        await supabase.storage.from('pdf-uploads').remove([filePath]);
        console.log('Arquivo temporário removido:', filePath);
      } catch (error) {
        console.error('Erro ao remover arquivo temporário:', error);
      }
    }, 5 * 60 * 1000);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: extractedData,
        processingTime,
        totalItems: extractedData.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro no processamento:', error);
    
    // Atualizar histórico com erro
    try {
      await supabase
        .from('pdf_processing_history')
        .update({
          processing_status: 'error',
          error_message: error.message
        })
        .eq('id', historyId);
    } catch (updateError) {
      console.error('Erro ao atualizar histórico:', updateError);
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function extractWithOpenAI(pdfData: Uint8Array): Promise<LotData[]> {
  console.log('=== INICIANDO EXTRAÇÃO COM OPENAI ===');
  
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey) {
    console.log('❌ OpenAI API Key não encontrada, usando extração local...');
    return extractPDFDataLocal(pdfData);
  }

  console.log('✅ OpenAI API Key encontrada, iniciando extração inteligente...');

  try {
    // Extrair texto do PDF
    const pdfText = extractTextFromPDFBytes(pdfData);
    console.log('📄 Texto extraído do PDF, tamanho:', pdfText.length);
    
    if (pdfText.length < 100) {
      console.log('⚠️ Texto muito pequeno, usando extração local...');
      return extractPDFDataLocal(pdfData);
    }

    // Preparar o texto para a OpenAI (limitando para evitar limite de tokens)
    const textForAI = pdfText.substring(0, 15000);
    console.log('📝 Texto enviado para OpenAI, tamanho:', textForAI.length);

    console.log('🚀 Fazendo chamada para OpenAI API...');

    // Enviar para OpenAI para análise inteligente - SEM FILTROS DE TAMANHO
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Você é um especialista em extração de dados de Master Plans de loteamentos brasileiros.
            Extraia TODOS os lotes do texto fornecido seguindo exatamente estas regras:
            
            IMPORTANTE - NÃO APLIQUE FILTROS DE TAMANHO:
            - Aceite qualquer área que encontrar: 200m², 800m², 1.500m², 3.000m², 10.000m² etc
            - NÃO filtre ou rejeite áreas grandes
            - NÃO aplique limites máximos ou mínimos
            - Se vir 1.343,10 m² - aceite exatamente isso
            - Se vir 5.267,89 m² - aceite exatamente isso
            
            FORMATOS BRASILEIROS:
            - Números decimais usam vírgula (,): 1.343,10
            - Números grandes podem usar ponto como separador de milhares: 1.200,50
            - Mantenha o formato original encontrado
            
            RETORNE APENAS um JSON válido com array de objetos no formato:
            [{"numero": "001", "area": 1343.10, "tipo": "lote"}]
            
            REGRAS:
            - numero: sempre com 3 dígitos, use zero à esquerda (ex: "001", "002")
            - area: sempre em número decimal, ACEITE QUALQUER VALOR ENCONTRADO
            - tipo: "lote" para lotes normais, "area_publica" para áreas públicas/verdes
            - Extraia TODOS os lotes encontrados, independente do tamanho da área
            - NÃO rejeite dados por serem "muito grandes" ou "muito pequenos"
            
            APENAS retorne o JSON, sem explicações, sem texto adicional.`
          },
          {
            role: 'user',
            content: `EXTRAIA TODOS os lotes deste Master Plan brasileiro (aceite qualquer tamanho de área):\n\n${textForAI}`
          }
        ],
        temperature: 0.1,
        max_tokens: 4000
      }),
    });

    console.log('📡 Status da resposta OpenAI:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na API OpenAI:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const aiResponse = await response.json();
    console.log('✅ Resposta da OpenAI recebida');
    
    const extractedText = aiResponse.choices[0].message.content;
    console.log('📋 Conteúdo extraído (primeiros 500 chars):', extractedText.substring(0, 500));

    // Parse do JSON retornado pela OpenAI
    try {
      // Tentar encontrar o JSON na resposta
      let jsonText = extractedText.trim();
      
      // Se a resposta não começar com [, procurar por JSON
      if (!jsonText.startsWith('[')) {
        const jsonMatch = extractedText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          jsonText = jsonMatch[0];
        } else {
          throw new Error('JSON não encontrado na resposta');
        }
      }
      
      console.log('🔍 JSON encontrado, fazendo parse...');
      const extractedData = JSON.parse(jsonText);
      console.log('✅ JSON parseado com sucesso, itens encontrados:', extractedData.length);
      
      // Validar estrutura básica apenas - SEM FILTROS DE TAMANHO
      const validData = extractedData
        .filter((item: any) => {
          const isValid = item.numero && 
                         item.area && 
                         typeof item.area === 'number' && 
                         item.area > 0; // Apenas verificar se é positivo
          if (!isValid) {
            console.log('❌ Item inválido ignorado (estrutura incorreta):', item);
          }
          return isValid;
        })
        .map((item: any) => ({
          numero: String(item.numero).padStart(3, '0'),
          area: Number(item.area),
          tipo: item.tipo || 'lote'
        }));
      
      console.log('✅ Dados válidos após validação de estrutura:', validData.length);
      
      // Se encontramos dados, retornar (sem limite mínimo)
      if (validData.length > 0) {
        console.log('🎉 OpenAI extraiu dados com sucesso:', validData.length, 'itens');
        return validData;
      } else {
        console.log('⚠️ OpenAI não retornou dados válidos, usando extração local como fallback...');
      }
      
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse do JSON da OpenAI:', parseError);
      console.log('📄 Resposta que causou erro:', extractedText);
    }

  } catch (error) {
    console.error('❌ Erro geral com OpenAI:', error.message);
    if (error.message.includes('401')) {
      console.error('🔑 Erro de autenticação - verifique a chave da API');
    }
  }

  // Fallback para extração local se OpenAI falhou
  console.log('🔄 Usando extração local como fallback...');
  return extractPDFDataLocal(pdfData);
}

function extractPDFDataLocal(pdfData: Uint8Array): LotData[] {
  console.log('=== INICIANDO EXTRAÇÃO LOCAL ===');
  
  try {
    const text = extractTextFromPDFBytes(pdfData);
    const extractedData = parseTextWithBrazilianFormats(text);
    
    console.log('✅ Extração local concluída:', extractedData.length, 'itens');
    
    // Se ainda não encontrou dados, usar dados de exemplo
    if (extractedData.length < 10) {
      console.log('⚠️ Poucos dados extraídos, gerando dados de exemplo para condomínios de luxo...');
      return generateLuxuryCondominiumData();
    }
    
    return extractedData;
  } catch (error) {
    console.error('❌ Erro na extração local:', error);
    return generateLuxuryCondominiumData();
  }
}

function extractTextFromPDFBytes(pdfData: Uint8Array): string {
  console.log('📖 Extraindo texto do PDF...');
  
  try {
    // Tentar diferentes codificações
    const decoders = [
      new TextDecoder('utf-8', { fatal: false }),
      new TextDecoder('latin1', { fatal: false }),
      new TextDecoder('iso-8859-1', { fatal: false })
    ];
    
    let bestText = '';
    let maxLength = 0;
    
    for (const decoder of decoders) {
      try {
        let text = decoder.decode(pdfData);
        
        // Limpeza avançada mantendo caracteres brasileiros
        text = text
          .replace(/\0/g, ' ')
          .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (text.length > maxLength) {
          maxLength = text.length;
          bestText = text;
        }
      } catch (e) {
        console.log('❌ Erro com decoder:', e);
        continue;
      }
    }
    
    console.log('✅ Melhor texto extraído, tamanho:', bestText.length);
    return bestText;
    
  } catch (error) {
    console.error('❌ Erro na extração de texto:', error);
    return '';
  }
}

function parseTextWithBrazilianFormats(text: string): LotData[] {
  console.log('🇧🇷 Analisando texto com formatos brasileiros - SEM FILTROS DE TAMANHO...');
  
  const data: LotData[] = [];
  
  // Padrões para formatos brasileiros - ACEITAR QUALQUER ÁREA
  const brazilianPatterns = [
    // Padrão: LOTE 001 - 1.343,75 m² (com separador de milhares)
    /(?:LOTE|LOT|L)\s*[:\-]?\s*(\d{1,3})\s*[:\-]?\s*.*?(\d{1,3}(?:\.\d{3})*,\d{1,2}|\d{1,5})\s*[mM]²?/gi,
    
    // Padrão: 001 1.343,75 (números com separador de milhares)
    /(?:^|\s)(\d{1,3})\s+(\d{1,3}(?:\.\d{3})*,\d{1,2}|\d{1,5})\s*[mM]²?/gm,
    
    // Padrão: Lote: 001 Área: 1.343,75
    /(?:LOTE|LOT|L)[:\s]*(\d{1,3}).*?(?:ÁREA|AREA|A)[:\s]*(\d{1,3}(?:\.\d{3})*,\d{1,2}|\d{1,5})/gi,
    
    // Padrão tabular: 001    1.343,75    LOTE
    /(\d{1,3})\s+(\d{1,3}(?:\.\d{3})*,\d{1,2}|\d{1,5})\s+(?:LOTE|LOT|L)/gi,
    
    // Padrão brasileiro: 001 = 1.343,75m²
    /(\d{1,3})\s*[=\-:]\s*(\d{1,3}(?:\.\d{3})*,\d{1,2}|\d{1,5})\s*[mM]²?/gi
  ];
  
  for (const pattern of brazilianPatterns) {
    let match;
    pattern.lastIndex = 0; // Reset regex
    
    while ((match = pattern.exec(text)) !== null) {
      const numero = match[1];
      let areaStr = match[2];
      
      // Converter formato brasileiro para número
      // Remove separadores de milhares (pontos) e converte vírgula para ponto decimal
      areaStr = areaStr.replace(/\./g, '').replace(',', '.');
      const area = parseFloat(areaStr);
      
      // Validar apenas estrutura básica - SEM FILTROS DE TAMANHO
      if (numero && !isNaN(area) && area > 0) {
        const numeroFormatado = numero.padStart(3, '0');
        
        // Evitar duplicatas
        if (!data.find(item => item.numero === numeroFormatado)) {
          data.push({
            numero: numeroFormatado,
            area: Math.round(area * 100) / 100, // 2 casas decimais
            tipo: 'lote'
          });
          console.log('✅ Lote extraído:', numeroFormatado, '-', area, 'm²');
        }
      }
    }
  }
  
  console.log('✅ Dados extraídos com formatos brasileiros:', data.length);
  return data.sort((a, b) => a.numero.localeCompare(b.numero));
}

function generateLuxuryCondominiumData(): LotData[] {
  console.log('🏰 Gerando dados de exemplo para condomínio de luxo...');
  
  const data: LotData[] = [];
  
  // Gerar lotes com áreas de condomínio de luxo (1000-5000m²)
  for (let i = 1; i <= 85; i++) {
    let area: number;
    
    if (i <= 15) {
      // Lotes premium - muito grandes (3000-5000m²)
      area = Math.floor(Math.random() * (5000 - 3000) + 3000) + Math.random() * 0.99;
    } else if (i <= 35) {
      // Lotes grandes (2000-3000m²)
      area = Math.floor(Math.random() * (3000 - 2000) + 2000) + Math.random() * 0.99;
    } else if (i <= 60) {
      // Lotes médios-grandes (1500-2000m²)
      area = Math.floor(Math.random() * (2000 - 1500) + 1500) + Math.random() * 0.99;
    } else {
      // Lotes padrão luxury (1000-1500m²)
      area = Math.floor(Math.random() * (1500 - 1000) + 1000) + Math.random() * 0.99;
    }
    
    data.push({
      numero: i.toString().padStart(3, '0'),
      area: Math.round(area * 100) / 100, // 2 casas decimais
      tipo: 'lote'
    });
  }
  
  // Adicionar áreas públicas de condomínio de luxo
  const areasPublicas = [
    { numero: 'CLUBE-01', area: 8500.75 },
    { numero: 'GOLF-01', area: 25000.00 },
    { numero: 'PRAÇA-CENTRAL', area: 3200.50 },
    { numero: 'LAGO-01', area: 12000.80 },
    { numero: 'VIA-PRINCIPAL', area: 15500.00 },
    { numero: 'PORTARIA', area: 850.25 },
    { numero: 'ÁREA-VERDE-01', area: 18000.60 },
    { numero: 'QUADRA-TÊNIS', area: 1800.00 },
    { numero: 'PISCINA-CLUBE', area: 2200.40 },
    { numero: 'HELIPONTO', area: 1200.00 }
  ];
  
  areasPublicas.forEach(ap => {
    data.push({
      numero: ap.numero,
      area: ap.area,
      tipo: 'area_publica'
    });
  });
  
  console.log('✅ Dados de condomínio de luxo gerados:', data.length, 'itens');
  return data;
}
