
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LotData {
  numero: string;
  area: number;
  tipo: 'lote' | 'area_publica';
}

interface StatisticsCardProps {
  data: LotData[];
  fileName: string;
}

const StatisticsCard: React.FC<StatisticsCardProps> = ({ data, fileName }) => {
  const totalLotes = data.filter(item => item.tipo === 'lote').length;
  const totalAreaPublica = data.filter(item => item.tipo === 'area_publica').length;
  const areaTotal = data.reduce((sum, item) => sum + item.area, 0);

  return (
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
      </CardContent>
    </Card>
  );
};

export default StatisticsCard;
