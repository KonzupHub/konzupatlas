
import React from 'react';
import { Upload, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UploadZoneProps {
  dragActive: boolean;
  isProcessing: boolean;
  onDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const UploadZone: React.FC<UploadZoneProps> = ({
  dragActive,
  isProcessing,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onFileSelect
}) => {
  return (
    <div
      className={`relative ${dragActive ? 'bg-konzup-50' : ''} rounded-lg transition-colors duration-200`}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <input
        type="file"
        id="pdf-upload"
        className="absolute inset-0 w-full h-full opacity-0 z-50 cursor-pointer"
        onChange={onFileSelect}
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
  );
};

export default UploadZone;
