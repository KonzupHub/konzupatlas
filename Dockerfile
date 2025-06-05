FROM python:3.11

RUN apt-get update && apt-get install -y tesseract-ocr tesseract-ocr-por poppler-utils

WORKDIR /app
COPY . .

RUN pip install --upgrade pip
RUN pip install -r requirements.txt

EXPOSE 5000

CMD ["gunicorn", "ocr_server:app", "--bind", "0.0.0.0:5000"] 