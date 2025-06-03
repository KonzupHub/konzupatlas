
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatisticsCard from './results/StatisticsCard';
import DownloadActions from './results/DownloadActions';
import DataTable from './results/DataTable';

interface LotData {
  numero: string;
  area: number;
  tipo: 'lote' | 'area_publica';
}

interface ResultsTableProps {
  data: LotData[];
  fileName: string;
  onDownloadExcel: () => void;
  onDownloadCSV: () => void;
  onNewUpload: () => void;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ 
  data, 
  fileName, 
  onDownloadExcel, 
  onDownloadCSV, 
  onNewUpload 
}) => {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <StatisticsCard data={data} fileName={fileName} />
      <DownloadActions 
        onDownloadExcel={onDownloadExcel}
        onDownloadCSV={onDownloadCSV}
        onNewUpload={onNewUpload}
      />

      <Card>
        <CardHeader>
          <CardTitle>Dados Extraídos</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable data={data} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsTable;
