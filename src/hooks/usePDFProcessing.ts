
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LotData {
  numero: string;
  area: number;
  tipo: 'lote' | 'area_publica';
}

export const usePDFProcessing = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const { toast } = useToast();

  const processFile = async (file: File): Promise<LotData[]> => {
    setIsProcessing(true);
    setProgress(0);
    setCurrentStep('Preparando upload...');

    try {
      // Step 1: Upload do arquivo
      setCurrentStep('Fazendo upload do arquivo...');
      setProgress(15);

      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await supabase.functions.invoke('upload-pdf', {
        body: formData
      });

      if (uploadResponse.error) {
        throw new Error(uploadResponse.error.message);
      }

      const { filePath, historyId } = uploadResponse.data;

      // Step 2: Processar com OCR REAL
      setCurrentStep('Convertendo PDF em imagens...');
      setProgress(30);

      const processResponse = await supabase.functions.invoke('process-pdf', {
        body: { filePath, historyId }
      });

      if (processResponse.error) {
        throw new Error(processResponse.error.message);
      }

      // Simular progresso durante o processamento OCR REAL
      const steps = [
        { step: 'Executando OCR Tesseract...', progress: 50 },
        { step: 'Identificando padrões de lotes...', progress: 70 },
        { step: 'Extraindo números e áreas...', progress: 85 },
        { step: 'Organizando dados extraídos...', progress: 95 },
        { step: 'Finalizando processamento...', progress: 100 }
      ];

      for (const stepData of steps) {
        setCurrentStep(stepData.step);
        setProgress(stepData.progress);
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      const { data: extractedData, totalItems, processingTime } = processResponse.data;

      toast({
        title: "Processamento OCR concluído!",
        description: `${totalItems} itens extraídos em ${processingTime}s via OCR Tesseract. Arquivo temporário será removido automaticamente.`,
      });

      return extractedData;

    } catch (error) {
      console.error('Erro no processamento OCR:', error);
      toast({
        title: "Erro no processamento",
        description: error.message || "Ocorreu um erro ao processar o arquivo",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processFile,
    isProcessing,
    progress,
    currentStep
  };
};
