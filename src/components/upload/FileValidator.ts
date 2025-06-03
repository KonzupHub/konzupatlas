
export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export const validatePDFFile = (file: File): FileValidationResult => {
  if (file.type !== 'application/pdf') {
    return {
      isValid: false,
      error: 'Por favor, selecione apenas arquivos PDF.'
    };
  }
  
  if (file.size > 20 * 1024 * 1024) { // 20MB
    return {
      isValid: false,
      error: 'O arquivo deve ter no máximo 20MB.'
    };
  }
  
  return { isValid: true };
};
