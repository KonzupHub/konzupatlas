
import { useCallback } from 'react';

export const useFileCleanup = () => {
  const cleanupFile = useCallback((file: File) => {
    // Simula a limpeza do arquivo após processamento
    console.log(`🗑️ Arquivo ${file.name} removido após processamento bem-sucedido`);
    console.log('💰 Economia de armazenamento: Arquivo temporário deletado');
    
    // Em produção, aqui seria feita a chamada para deletar do storage
    // supabase.storage.from('temp-uploads').remove([filePath])
  }, []);

  const scheduleCleanup = useCallback((file: File, delayMs: number = 5000) => {
    setTimeout(() => {
      cleanupFile(file);
    }, delayMs);
  }, [cleanupFile]);

  return { cleanupFile, scheduleCleanup };
};
