
from flask import Flask, request, jsonify
from flask_cors import CORS
import pdf2image
import pytesseract
import re
import tempfile
import os
from PIL import Image
import io

app = Flask(__name__)
CORS(app)

@app.route('/process-pdf', methods=['POST'])
def process_pdf():
    try:
        if 'pdf' not in request.files:
            return jsonify({'error': 'Nenhum arquivo PDF enviado'}), 400
        
        pdf_file = request.files['pdf']
        
        # Salvar arquivo temporário
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
            pdf_file.save(tmp_file.name)
            
            print(f"Processando PDF: {tmp_file.name}")
            
            # Converter PDF para imagens (alta resolução)
            pages = pdf2image.convert_from_path(tmp_file.name, dpi=300)
            print(f"PDF convertido em {len(pages)} páginas")
            
            extracted_data = []
            
            for i, page in enumerate(pages):
                print(f"Processando página {i + 1}...")
                
                # OCR com Tesseract (português)
               text6 = pytesseract.image_to_string(page, lang='por', config='--psm 6')
               text11 = pytesseract.image_to_string(page, lang='por', config='--psm 11')
               text4 = pytesseract.image_to_string(page, lang='por', config='--psm 4')
               text = "\n".join([text6, text11, text4])

                print(f"Texto extraído da página {i + 1}, tamanho: {len(text)}")
                
                # Extrair dados usando regex específicos para o padrão brasileiro
                page_data = extract_lot_data(text, i + 1)
                extracted_data.extend(page_data)
            
            # Limpar arquivo temporário
            os.unlink(tmp_file.name)
            
            print(f"Total de itens extraídos: {len(extracted_data)}")
            
            return jsonify({
                'success': True,
                'extracted_data': extracted_data,
                'total_items': len(extracted_data),
                'pages_processed': len(pages)
            })
            
    except Exception as e:
        print(f"Erro no processamento: {str(e)}")
        return jsonify({'error': f'Erro no processamento: {str(e)}'}), 500

def extract_lot_data(text, page_num):
    """
    Extrai dados de lotes do texto usando padrões específicos do Brasil
    Busca por padrões como: "1.343,10 m²", "Lote 01 - 1.570,55 m²", etc.
    """
    data = []
    
    # Padrões para capturar áreas brasileiras EXATAS
    patterns = [
        # Padrão principal: "1.343,10 m²" ou "1343,10 m²"
        r'(\d{1,4}(?:\.\d{3})*,\d{2})\s*m²',
        
        # Padrão com lote: "Lote 01 - 1.343,10 m²"
        r'(?:lote|lot)\s*(\d+).*?(\d{1,4}(?:\.\d{3})*,\d{2})\s*m²',
        
        # Padrão tabular: "01    1.343,10 m²"
        r'(\d{1,3})\s+(\d{1,4}(?:\.\d{3})*,\d{2})\s*m²',
        
        # Padrão com separador: "01 = 1.343,10 m²"
        r'(\d{1,3})\s*[=\-:]\s*(\d{1,4}(?:\.\d{3})*,\d{2})\s*m²'
    ]
    
    lote_counter = 1
    found_areas = set()  # Para evitar duplicatas
    
    for pattern in patterns:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        
        for match in matches:
            groups = match.groups()
            
            if len(groups) == 1:
                # Só área encontrada
                area_str = groups[0]
                numero = f"{lote_counter:03d}"
                lote_counter += 1
            elif len(groups) == 2:
                # Número e área encontrados
                numero = f"{int(groups[0]):03d}"
                area_str = groups[1]
            else:
                continue
            
            # Converter área brasileira para número
            try:
                # Remove pontos (separadores de milhares) e converte vírgula para ponto decimal
                area_num = float(area_str.replace('.', '').replace(',', '.'))
                
                # Evitar duplicatas por área
                if area_str not in found_areas and area_num > 0:
                    found_areas.add(area_str)
                    
                    data.append({
                        'numero': numero,
                        'area': round(area_num, 2),
                        'tipo': 'lote',
                        'area_original': area_str,  # Manter formato original
                        'page': page_num
                    })
                    
                    print(f"✅ Extraído: Lote {numero} - {area_str} m² (página {page_num})")
                    
            except ValueError:
                continue
    
    return data

if __name__ == '__main__':
    print("Servidor OCR Python iniciado!")
    print("Certifique-se de ter instalado:")
    print("pip install flask flask-cors pdf2image pytesseract pillow")
    print("E também instalar o Tesseract OCR no sistema")
    app.run(host='0.0.0.0', port=5000, debug=True)
