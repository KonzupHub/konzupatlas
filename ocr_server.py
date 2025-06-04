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

            all_texts = []
            for i, page in enumerate(pages):
                print(f"Processando página {i + 1}...")

                # OCR com Tesseract (vários modos)
                text6 = pytesseract.image_to_string(page, lang='por', config='--psm 6')
                text11 = pytesseract.image_to_string(page, lang='por', config='--psm 11')
                text4 = pytesseract.image_to_string(page, lang='por', config='--psm 4')
                all_texts.extend([text6, text11, text4])

            # Junta todos os textos OCR para análise única
            all_lines = "\n".join(all_texts)
            extracted_data = extract_lot_data(all_lines)

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

def extract_lot_data(text):
    """
    Extrai dados de lotes do texto usando padrões abrangentes para capturar todos os formatos.
    """
    data = []
    found_areas = set()

    # Analisa cada linha individualmente para maximizar a captura de lotes desalinhados
    lines = text.split('\n')
    for line in lines:
        line = line.strip()
        # 1. "Lote 012 - 1.234,56 m²"
        match = re.match(r'(?:Lote|LOT|lot)?\s*(\d{1,4})[\s\-\–:]*([\d\.]{1,7},\d{2})\s*m²', line, re.IGNORECASE)
        if match:
            numero = match.group(1).zfill(3)
            area_str = match.group(2)
        else:
            # 2. "012    1.234,56 m²"
            match = re.match(r'(\d{1,4})\s+([\d\.]{1,7},\d{2})\s*m²', line)
            if match:
                numero = match.group(1).zfill(3)
                area_str = match.group(2)
            else:
                # 3. Só área: "1.234,56 m²"
                match = re.match(r'([\d\.]{1,7},\d{2})\s*m²', line)
                if match:
                    numero = ""
                    area_str = match.group(1)
                else:
                    continue

        try:
            area_num = float(area_str.replace('.', '').replace(',', '.'))
            key = f"{numero}-{area_str}"
            if key not in found_areas and area_num > 0:
                found_areas.add(key)
                data.append({
                    'numero': numero if numero else f'{len(data)+1:03d}',
                    'area': round(area_num, 2),
                    'tipo': 'lote',
                    'area_original': area_str
                })
        except Exception:
            continue
    return data

if __name__ == '__main__':
    print("Servidor OCR Python iniciado!")
    print("Certifique-se de ter instalado:")
    print("pip install flask flask-cors pdf2image pytesseract pillow")
    print("E também instalar o Tesseract OCR no sistema")
    app.run(host='0.0.0.0', port=5000, debug=True)
