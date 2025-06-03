
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface LotData {
  numero: string;
  area: number;
  tipo: 'lote' | 'area_publica';
}

interface DataTableProps {
  data: LotData[];
}

const DataTable: React.FC<DataTableProps> = ({ data }) => {
  return (
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
  );
};

export default DataTable;
