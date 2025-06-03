
import React from 'react';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DownloadActionsProps {
  onDownloadExcel: () => void;
  onDownloadCSV: () => void;
  onNewUpload: () => void;
}

const DownloadActions: React.FC<DownloadActionsProps> = ({
  onDownloadExcel,
  onDownloadCSV,
  onNewUpload
}) => {
  return (
    <div className="mt-6 flex flex-wrap gap-3 justify-center">
      <Button 
        onClick={onDownloadExcel}
        className="bg-green-600 hover:bg-green-700 text-white px-6"
      >
        <FileSpreadsheet className="h-4 w-4 mr-2" />
        Baixar Excel
      </Button>
      <Button 
        onClick={onDownloadCSV}
        variant="outline"
        className="border-gray-300 px-6"
      >
        <FileText className="h-4 w-4 mr-2" />
        Baixar CSV
      </Button>
      <Button 
        onClick={onNewUpload}
        variant="outline"
        className="border-konzup-300 text-konzup-600 hover:bg-konzup-50 px-6"
      >
        <Download className="h-4 w-4 mr-2" />
        Novo Upload
      </Button>
    </div>
  );
};

export default DownloadActions;
