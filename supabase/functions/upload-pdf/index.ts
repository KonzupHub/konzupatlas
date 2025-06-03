
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Função para sanitizar o nome do arquivo
function sanitizeFileName(fileName: string): string {
  return fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Substitui caracteres especiais por underscore
    .replace(/_+/g, '_') // Remove underscores múltiplos
    .replace(/^_|_$/g, ''); // Remove underscores no início e fim
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file || file.type !== 'application/pdf') {
      throw new Error('Arquivo deve ser um PDF válido');
    }

    if (file.size > 20 * 1024 * 1024) {
      throw new Error('Arquivo deve ter no máximo 20MB');
    }

    console.log('Fazendo upload do arquivo:', file.name, 'Tamanho:', file.size);

    // Sanitizar o nome do arquivo antes do upload
    const sanitizedFileName = sanitizeFileName(file.name);
    const fileName = `temp/${Date.now()}_${sanitizedFileName}`;
    
    console.log('Nome do arquivo sanitizado:', fileName);

    // Upload para storage temporário
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('pdf-uploads')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Erro no upload:', uploadError);
      throw new Error('Falha no upload do arquivo');
    }

    // Registrar no histórico
    const { data: historyData, error: historyError } = await supabase
      .from('pdf_processing_history')
      .insert({
        file_name: file.name, // Mantém o nome original no histórico
        file_size: file.size,
        processing_status: 'uploaded'
      })
      .select()
      .single();

    if (historyError) {
      console.error('Erro ao registrar histórico:', historyError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        filePath: fileName,
        historyId: historyData?.id 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro no upload:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
