# --- STAGE 1: Build dell'applicazione React ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copia i file dei pacchetti
COPY package*.json ./

# Installa le dipendenze
RUN npm ci

# Copia il codice sorgente
COPY . .

# Compila il progetto (genera la cartella dist/)
RUN npm run build

# --- STAGE 2: Web Server Nginx di produzione ---
FROM nginx:alpine

# Copia la configurazione personalizzata di Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia solo l'output compilato dallo Stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Espone la porta web standard
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
