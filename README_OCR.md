
# Konzup Atlas - Servidor OCR Real

Este é o servidor Python que executa OCR real usando Tesseract para extrair dados de Master Plans.

## Instalação Local

1. Instalar dependências:
```bash
pip install -r requirements.txt
```

2. Instalar Tesseract OCR:
- **Ubuntu/Debian**: `sudo apt-get install tesseract-ocr tesseract-ocr-por`
- **Windows**: Baixar do GitHub oficial do Tesseract
- **macOS**: `brew install tesseract tesseract-lang`

3. Executar servidor:
```bash
python ocr_server.py
```

## Deploy (Render/Railway/Heroku)

1. Fazer upload dos arquivos `ocr_server.py` e `requirements.txt`
2. Configurar buildpack para Tesseract (se necessário)
3. Deploy automático

## Endpoint

- **POST** `/process-pdf`
- **Body**: FormData com arquivo PDF
- **Response**: JSON com dados extraídos

## Funcionalidades

- ✅ OCR real com Tesseract
- ✅ Suporte a português brasileiro
- ✅ Extração de áreas exatas (ex: "1.343,10 m²")
- ✅ Múltiplos padrões de reconhecimento
- ✅ Sem filtros de tamanho
- ✅ Preserva formato brasileiro de números

## Exemplo de Uso

```python
import requests

with open('masterplan.pdf', 'rb') as f:
    response = requests.post('http://localhost:5000/process-pdf', 
                           files={'pdf': f})
    data = response.json()
    print(f"Extraídos: {data['total_items']} itens")
```
