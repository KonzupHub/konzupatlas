
import React, { useState } from 'react';
import Header from '@/components/Header';
import PDFUploader from '@/components/PDFUploader';
import ProcessingStatus from '@/components/ProcessingStatus';
import ResultsTable from '@/components/ResultsTable';
import { useToast } from '@/hooks/use-toast';

interface LotData {
  numero: string;
  area: number;
  tipo: 'lote' | 'area_publica';
}

type AppState = 'upload' | 'processing' | 'results';

const Index = () => {
  const [state, setState] = useState<AppState>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [extractedData, setExtractedData] = useState<LotData[]>([]);
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    console.log('Arquivo selecionado:', file.name, file.size);
    setSelectedFile(file);
    setState('processing');
    simulateProcessing(file);
  };

  const simulateProcessing = async (file: File) => {
    // Simulação do processamento para demonstração
    const steps = [
      { step: 'Validando arquivo...', duration: 500 },
      { step: 'Analisando Master Plan...', duration: 2000 },
      { step: 'Identificando lotes...', duration: 1500 },
      { step: 'Extraindo áreas...', duration: 1000 },
      { step: 'Gerando planilha...', duration: 800 },
    ];

    let currentProgress = 0;
    
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(steps[i].step);
      const targetProgress = ((i + 1) / steps.length) * 100;
      
      // Animação suave do progresso
      const progressStep = (targetProgress - currentProgress) / 20;
      for (let j = 0; j < 20; j++) {
        currentProgress += progressStep;
        setProgress(Math.min(currentProgress, targetProgress));
        await new Promise(resolve => setTimeout(resolve, steps[i].duration / 20));
      }
    }

    // Dados simulados para demonstração
    const mockData: LotData[] = [
      { numero: '01', area: 450.5, tipo: 'lote' },
      { numero: '02', area: 523.8, tipo: 'lote' },
      { numero: '03', area: 489.2, tipo: 'lote' },
      { numero: '04', area: 612.1, tipo: 'lote' },
      { numero: '05', area: 398.7, tipo: 'lote' },
      { numero: 'AP-01', area: 1250.0, tipo: 'area_publica' },
      { numero: '06', area: 445.3, tipo: 'lote' },
      { numero: '07', area: 534.9, tipo: 'lote' },
      { numero: '08', area: 467.2, tipo: 'lote' },
      { numero: 'AP-02', area: 890.5, tipo: 'area_publica' },
      { numero: '09', area: 511.8, tipo: 'lote' },
      { numero: '10', area: 478.6, tipo: 'lote' },
    ];

    setExtractedData(mockData);
    setState('results');
    
    toast({
      title: "Processamento concluído!",
      description: `${mockData.length} itens extraídos com sucesso do arquivo ${file.name}`,
    });
  };

  const handleDownloadExcel = () => {
    console.log('Download Excel iniciado');
    toast({
      title: "Download iniciado",
      description: "Seu arquivo Excel está sendo preparado...",
    });
    // Aqui seria implementada a geração real do Excel
  };

  const handleDownloadCSV = () => {
    console.log('Download CSV iniciado');
    // Implementação simples de CSV para demonstração
    const csvContent = 'Número,Área (m²),Tipo\n' + 
      extractedData.map(item => `${item.numero},${item.area},${item.tipo}`).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `master_plan_${selectedFile?.name.replace('.pdf', '')}.csv`;
    link.click();
    
    toast({
      title: "CSV baixado!",
      description: "Arquivo CSV salvo com sucesso.",
    });
  };

  const handleNewUpload = () => {
    setState('upload');
    setSelectedFile(null);
    setProgress(0);
    setCurrentStep('');
    setExtractedData([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-6 py-12">
        {state === 'upload' && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold text-gray-900">
                Automatize a extração de <span className="text-konzup-600">Master Plans</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Transforme mapas de loteamentos em planilhas organizadas em segundos. 
                Precisão garantida, trabalho manual eliminado.
              </p>
            </div>
            
            <PDFUploader 
              onFileSelect={handleFileSelect} 
              isProcessing={state === 'processing'}
            />
            
            <div className="text-center text-sm text-gray-500 space-y-2">
              <p>✅ Suporte a PDFs de até 20MB</p>
              <p>🎯 IA especializada em Master Plans</p>
              <p>📊 Export direto para Excel e CSV</p>
              <p>🔒 Seus arquivos são processados com segurança</p>
            </div>
          </div>
        )}
        
        {state === 'processing' && selectedFile && (
          <ProcessingStatus 
            fileName={selectedFile.name}
            progress={progress}
            currentStep={currentStep}
          />
        )}
        
        {state === 'results' && selectedFile && (
          <ResultsTable 
            data={extractedData}
            fileName={selectedFile.name}
            onDownloadExcel={handleDownloadExcel}
            onDownloadCSV={handleDownloadCSV}
            onNewUpload={handleNewUpload}
          />
        )}
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-8 mt-16">
        <div className="container mx-auto px-6 text-center text-gray-600">
          <p>&copy; 2024 Konzup Atlas. Automatização inteligente para construtoras.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
