# 1. Immagine di base leggera e ufficiale di Python
FROM python:3.12-slim

# 2. Imposta la cartella di lavoro all'interno del container
WORKDIR /app

# 3. Evita che Python scriva file .pyc e forza l'output immediato nei log
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 4. Copia prima solo i requisiti per sfruttare la cache di Docker
COPY requirements.txt .

# 5. Installa le dipendenze
RUN pip install --no-cache-dir -r requirements.txt

# 6. Copia il codice dell'applicazione
COPY ./app ./app

# 7. Espone la porta su cui gira FastAPI
EXPOSE 8000

# 8. Comando di avvio in produzione con Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
