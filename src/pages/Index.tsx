
import React, { useState } from 'react';
import Header from '@/components/Header';
import PDFUploader from '@/components/PDFUploader';
import ProcessingStatus from '@/components/ProcessingStatus';
import ResultsTable from '@/components/ResultsTable';
import UploadFeatures from '@/components/upload/UploadFeatures';
import { useToast } from '@/hooks/use-toast';
import { usePDFProcessing } from '@/hooks/usePDFProcessing';

interface LotData {
  numero: string;
  area: number;
  tipo: 'lote' | 'area_publica';
}

type AppState = 'upload' | 'processing' | 'results';

const Index = () => {
  const [state, setState] = useState<AppState>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<LotData[]>([]);
  const { toast } = useToast();
  const { processFile, isProcessing, progress, currentStep } = usePDFProcessing();

  const handleFileSelect = async (file: File) => {
    console.log('Arquivo selecionado:', file.name, file.size);
    setSelectedFile(file);
    setState('processing');

    try {
      const data = await processFile(file);
      setExtractedData(data);
      setState('results');
    } catch (error) {
      setState('upload');
      setSelectedFile(null);
    }
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
                Precisão garantida com OCR avançado, trabalho manual eliminado.
              </p>
            </div>
            
            <PDFUploader 
              onFileSelect={handleFileSelect} 
              isProcessing={isProcessing}
            />
            
            <UploadFeatures />
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
          <p>
            &copy; 2025 Konzup Atlas. Automatização inteligente para construtoras. 
            Desenvolvido por{' '}
            <a 
              href="https://konzup.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-konzup-600 hover:text-konzup-700 font-medium underline"
            >
              Konzup
            </a>
            .
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
