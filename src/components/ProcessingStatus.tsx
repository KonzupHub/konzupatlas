
import React from 'react';
import { Loader2, FileText, Brain, Table } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ProcessingStatusProps {
  fileName: string;
  progress: number;
  currentStep: string;
}

const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ fileName, progress, currentStep }) => {
  const steps = [
    { name: 'Upload concluído', icon: FileText, completed: progress >= 25 },
    { name: 'Lendo Master Plan', icon: Brain, completed: progress >= 50 },
    { name: 'Extraindo dados', icon: Brain, completed: progress >= 75 },
    { name: 'Gerando planilha', icon: Table, completed: progress >= 100 },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="border-konzup-200">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-konzup-600" />
            <span>Processando Master Plan</span>
          </CardTitle>
          <p className="text-sm text-gray-600">{fileName}</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{currentStep}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
          
          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`rounded-full p-2 ${
                    step.completed 
                      ? 'bg-konzup-100 text-konzup-600' 
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className={`text-sm ${
                    step.completed ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.name}
                  </span>
                  {step.completed && (
                    <div className="ml-auto">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProcessingStatus;
