
import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PDFUploaderProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

const PDFUploader: React.FC<PDFUploaderProps> = ({ onFileSelect, isProcessing }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>('');

  const validateFile = (file: File): boolean => {
    setError('');
    
    if (file.type !== 'application/pdf') {
      setError('Por favor, selecione apenas arquivos PDF.');
      return false;
    }
    
    if (file.size > 20 * 1024 * 1024) { // 20MB
      setError('O arquivo deve ter no máximo 20MB.');
      return false;
    }
    
    return true;
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  }, [onFileSelect]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  };

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="border-2 border-dashed transition-all duration-300 hover:border-konzup-400">
        <CardContent className="p-8">
          <div
            className={`relative ${dragActive ? 'bg-konzup-50' : ''} rounded-lg transition-colors duration-200`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="pdf-upload"
              className="absolute inset-0 w-full h-full opacity-0 z-50 cursor-pointer"
              onChange={handleChange}
              accept=".pdf"
              disabled={isProcessing}
            />
            
            <div className="text-center py-12">
              <div className="mx-auto flex justify-center">
                <div className="rounded-full bg-konzup-100 p-6 mb-4">
                  <Upload className="h-12 w-12 text-konzup-600" />
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Faça upload do seu Master Plan
              </h3>
              
              <p className="text-gray-600 mb-6">
                Arraste e solte seu arquivo PDF aqui ou clique para selecionar
              </p>
              
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center justify-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Formato: PDF</span>
                </div>
                <div>Tamanho máximo: 20MB</div>
              </div>
              
              <Button 
                type="button" 
                className="mt-6 bg-konzup-600 hover:bg-konzup-700 text-white px-8 py-2"
                disabled={isProcessing}
              >
                Selecionar Arquivo
              </Button>
            </div>
          </div>
          
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFUploader;
