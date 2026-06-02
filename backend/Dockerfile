# ─── Imagen base más ligera disponible para Node ──────────────
FROM node:22-alpine

WORKDIR /app

# Instalar solo dependencias de producción
COPY package*.json ./
RUN npm ci --omit=dev

COPY src/ ./src/

# Modelo de Tesseract para el OCR. El código usa langPath=/app con gzip=true,
# por eso el destino es eng.traineddata.gz (Tesseract.js detecta por los magic
# bytes si está comprimido o no, así que vale el fichero tal cual del repo).
COPY eng.traineddata ./eng.traineddata.gz

# Ejecutar como usuario no-root (incluido en la imagen oficial de Node)
USER node

EXPOSE 3000

CMD ["node", "src/index.js"]
