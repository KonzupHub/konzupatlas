
import React from 'react';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
  const totalLotes = data.filter(item => item.tipo === 'lote').length;
  const totalAreaPublica = data.filter(item => item.tipo === 'area_publica').length;
  const areaTotal = data.reduce((sum, item) => sum + item.area, 0);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header com estatísticas */}
      <Card className="bg-gradient-to-r from-konzup-50 to-blue-50 border-konzup-200">
        <CardHeader>
          <CardTitle className="text-green-700">✅ Extração Concluída!</CardTitle>
          <p className="text-sm text-gray-600">{fileName}</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-konzup-600">{data.length}</div>
              <div className="text-sm text-gray-600">Total de itens</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalLotes}</div>
              <div className="text-sm text-gray-600">Lotes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{totalAreaPublica}</div>
              <div className="text-sm text-gray-600">Áreas Públicas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{areaTotal.toLocaleString()}</div>
              <div className="text-sm text-gray-600">m² total</div>
            </div>
          </div>
          
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
        </CardContent>
      </Card>

      {/* Tabela de resultados */}
      <Card>
        <CardHeader>
          <CardTitle>Dados Extraídos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-3 font-semibold">Número</th>
                  <th className="text-left p-3 font-semibold">Área (m²)</th>
                  <th className="text-left p-3 font-semibold">Tipo</th>
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 50).map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-mono">{item.numero}</td>
                    <td className="p-3">{item.area.toLocaleString()}</td>
                    <td className="p-3">
                      <Badge 
                        variant={item.tipo === 'lote' ? 'default' : 'secondary'}
                        className={item.tipo === 'lote' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}
                      >
                        {item.tipo === 'lote' ? 'Lote' : 'Área Pública'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {data.length > 50 && (
              <div className="mt-4 text-center text-sm text-gray-500 p-4 bg-gray-50 rounded">
                Mostrando 50 de {data.length} registros. Baixe o arquivo completo para ver todos os dados.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsTable;
